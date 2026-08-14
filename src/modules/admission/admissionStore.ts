import { useState, useEffect } from 'react';
import { AdmissionApplication, SeatAvailability, calculateFeeForStartMonth } from '../../types/admission';
import { Student, SiblingInfo } from '../../types/sis';
import { INITIAL_APPLICATIONS } from '../../data/mockData';
import { syncAdmissionLeadToSupabase, fetchAdmissionLeadsFromSupabase, syncStudentToSupabase } from '../../lib/supabaseSync';
import { getClassFeeStructure, calculateClassTuitionForMonth } from '../fees/feeStructureStore';
import { generateAndIncrementNumber } from './admissionNumberConfig';
import {
  getCentralizedStudents,
  saveCentralizedStudents,
  SIS_STORAGE_KEY,
  ADMISSION_STORAGE_KEY
} from '../sis/sisStore';

const INITIAL_SEATS: SeatAvailability[] = [
  { className: 'Nursery', totalSeats: 60, filledSeats: 48, reservedSeats: 5, availableSeats: 7 },
  { className: 'KG', totalSeats: 60, filledSeats: 55, reservedSeats: 3, availableSeats: 2 },
  { className: 'Class 1', totalSeats: 80, filledSeats: 72, reservedSeats: 5, availableSeats: 3 },
  { className: 'Class 6', totalSeats: 80, filledSeats: 68, reservedSeats: 6, availableSeats: 6 },
  { className: 'Class 11 Science', totalSeats: 50, filledSeats: 35, reservedSeats: 5, availableSeats: 10 }
];

export function ensureUniqueAppIds(list: AdmissionApplication[]): AdmissionApplication[] {
  const seen = new Set<string>();
  return list.map((item, idx) => {
    let id = item.id || `app-${idx}`;
    if (seen.has(id)) {
      id = `${id}-${idx}-${Date.now().toString(36)}`;
    }
    seen.add(id);
    return { ...item, id };
  });
}

export function getCentralizedApplications(): AdmissionApplication[] {
  try {
    const saved = localStorage.getItem(ADMISSION_STORAGE_KEY);
    return saved ? ensureUniqueAppIds(JSON.parse(saved)) : ensureUniqueAppIds(INITIAL_APPLICATIONS);
  } catch (e) {
    return ensureUniqueAppIds(INITIAL_APPLICATIONS);
  }
}

export function saveCentralizedApplications(list: AdmissionApplication[]) {
  try {
    localStorage.setItem(ADMISSION_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('schoolerp_admissions_updated'));
    }
  } catch (e) {
    console.error('Error saving centralized admissions:', e);
  }
}

// Automatically sync confirmed student to SIS directory in local storage and Supabase
export function autoSyncAppToSis(app: AdmissionApplication, section: string = 'A', house?: string, club?: string) {
  try {
    const sisList = getCentralizedStudents();

    const existingIdx = sisList.findIndex(
      (s) =>
        (s.admissionNo && app.applicationNo && s.admissionNo.toLowerCase() === app.applicationNo.toLowerCase()) ||
        (s.registrationNo && app.registrationNo && s.registrationNo.toLowerCase() === app.registrationNo.toLowerCase()) ||
        (s.fullName && app.studentName && s.fullName.trim().toLowerCase() === app.studentName.trim().toLowerCase())
    );

    const generatedAdmNo = app.applicationNo?.includes('ADM')
      ? app.applicationNo
      : (existingIdx >= 0 && sisList[existingIdx].admissionNo ? sisList[existingIdx].admissionNo : `ADM-2026-${Math.floor(100 + Math.random() * 900)}`);

    const studentRecord: Student = {
      id: existingIdx >= 0 ? sisList[existingIdx].id : `std-adm-${Date.now()}`,
      admissionNo: generatedAdmNo,
      registrationNo: app.registrationNo || app.applicationNo || `REG-${Date.now().toString().slice(-5)}`,
      scholarNo: app.scholarNo || (existingIdx >= 0 ? sisList[existingIdx].scholarNo : `SCH-${Math.floor(1000 + Math.random() * 9000)}`),
      penNo: app.penNo || (existingIdx >= 0 ? sisList[existingIdx].penNo : `PEN-${Math.floor(1000000000 + Math.random() * 9000000000)}`),
      apaarId: app.apaarId || (existingIdx >= 0 ? sisList[existingIdx].apaarId : `APAAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`),
      aadhaarNo: app.aadhaarNo || (existingIdx >= 0 ? sisList[existingIdx].aadhaarNo : '7812 9012 3456'),
      fullName: app.studentName,
      gender: app.gender || (existingIdx >= 0 ? sisList[existingIdx].gender : 'Male'),
      dob: app.dob || (existingIdx >= 0 ? sisList[existingIdx].dob : '2019-05-10'),
      bloodGroup: app.bloodGroup || (existingIdx >= 0 ? sisList[existingIdx].bloodGroup : 'O+'),
      religion: app.religion || (existingIdx >= 0 ? sisList[existingIdx].religion : 'Hinduism'),
      caste: app.caste || '',
      category: app.category || (existingIdx >= 0 ? sisList[existingIdx].category : 'General'),
      studentCategory: app.studentCategory || (existingIdx >= 0 ? sisList[existingIdx].studentCategory : 'Day Scholar'),
      nationality: 'Indian',
      motherTongue: 'Hindi',
      photoUrl: app.photoUrl || (existingIdx >= 0 ? sisList[existingIdx].photoUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
      admissionDate: app.applicationDate || new Date().toISOString().split('T')[0],
      dateOfJoining: app.dateOfJoining || new Date().toISOString().split('T')[0],
      feeApplicableFromMonth: app.feeApplicableFromMonth || 'April',
      admissionRemarks: app.admissionRemarks || app.specialDiscountNotes || '',
      specialDiscountNotes: app.specialDiscountNotes || '',
      admissionClass: app.applyingClass || 'Class 1',
      currentClass: app.applyingClass || 'Class 1',
      section: section || (existingIdx >= 0 ? sisList[existingIdx].section : 'A'),
      rollNo: existingIdx >= 0 ? sisList[existingIdx].rollNo : sisList.length + 1,
      house: house || (existingIdx >= 0 ? sisList[existingIdx].house : 'Agni (Red)'),
      clubName: club || (existingIdx >= 0 ? sisList[existingIdx].clubName : 'Eco & Green Club'),
      groupAActivity: existingIdx >= 0 ? sisList[existingIdx].groupAActivity : 'Chess',
      groupBActivity: existingIdx >= 0 ? sisList[existingIdx].groupBActivity : 'Cricket',
      previousSchool: app.previousSchool || 'None',
      previousSchoolClass: app.previousSchoolClass || 'Playgroup (PG)',
      transportRequired: app.studentCategory !== 'Hosteler',
      busRouteNo: 'Route 1 - Main City Route',
      hostelRequired: app.studentCategory === 'Hosteler',
      hasSiblingInSchool: Boolean(app.hasSiblingInSchool),
      appliedOtherSchool: Boolean(app.appliedOtherSchool),
      otherSchoolDetails: app.otherSchoolDetails || '',
      forceAdmission: app.forceAdmission,
      forceAdmissionReason: app.forceAdmissionReason,
      forceAdmissionAuthorizedBy: app.forceAdmissionAuthorizedBy,
      forceAdmissionTimestamp: app.forceAdmissionTimestamp,
      parents: {
        fatherName: app.parentName || (existingIdx >= 0 ? sisList[existingIdx].parents?.fatherName : 'Parent / Guardian'),
        fatherMobile: app.contactNumber || (existingIdx >= 0 ? sisList[existingIdx].parents?.fatherMobile : ''),
        fatherEmail: app.email || (existingIdx >= 0 ? sisList[existingIdx].parents?.fatherEmail : 'parent@example.com'),
        fatherOccupation: app.parentOccupation || (existingIdx >= 0 ? sisList[existingIdx].parents?.fatherOccupation : 'Doctor / Engineer'),
        fatherIncome: '18,00,000 PA',
        fatherQualification: 'Graduate',
        motherName: app.motherName || (existingIdx >= 0 ? sisList[existingIdx].parents?.motherName : 'Mother'),
        motherOccupation: app.motherOccupation || (existingIdx >= 0 ? sisList[existingIdx].parents?.motherOccupation : 'Educator'),
        motherMobile: app.contactNumber || (existingIdx >= 0 ? sisList[existingIdx].parents?.motherMobile : ''),
        motherEmail: app.email || (existingIdx >= 0 ? sisList[existingIdx].parents?.motherEmail : 'mother@example.com'),
        address: app.address || (existingIdx >= 0 ? sisList[existingIdx].parents?.address : 'Main Town, Delhi NCR'),
        emergencyContact: app.contactNumber || (existingIdx >= 0 ? sisList[existingIdx].parents?.emergencyContact : '')
      },
      medical: { bloodGroup: 'O+', disability: false },
      documents: existingIdx >= 0 ? sisList[existingIdx].documents : [],
      siblings: (app.siblingsList || []).map((s, idx): SiblingInfo => ({
        id: `sib-${idx}`,
        name: s.name,
        classSection: s.className,
        admissionNo: s.admissionNo,
        relation: s.relation === 'Sister' ? 'Sister' : 'Brother'
      })),
      promotions: existingIdx >= 0 ? sisList[existingIdx].promotions : [],
      status: 'Active'
    };

    let updatedSisList: Student[];
    if (existingIdx >= 0) {
      updatedSisList = sisList.map((s, i) => (i === existingIdx ? { ...s, ...studentRecord } : s));
    } else {
      updatedSisList = [studentRecord, ...sisList];
    }

    saveCentralizedStudents(updatedSisList);
    // Background sync to live Supabase DB
    syncStudentToSupabase(studentRecord);
  } catch (e) {
    console.error('Error auto-syncing application to SIS:', e);
  }
}

export function useAdmissionStore() {
  const [applications, setApplications] = useState<AdmissionApplication[]>(() => getCentralizedApplications());

  const [seats] = useState<SeatAvailability[]>(INITIAL_SEATS);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Sync state with centralized database updates
  useEffect(() => {
    const handleSync = () => {
      setApplications(getCentralizedApplications());
    };

    window.addEventListener('schoolerp_admissions_updated', handleSync);
    window.addEventListener('schoolerp_students_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('schoolerp_admissions_updated', handleSync);
      window.removeEventListener('schoolerp_students_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Fetch remote admission leads on mount from Supabase
  useEffect(() => {
    let active = true;
    async function loadRemote() {
      const remote = await fetchAdmissionLeadsFromSupabase();
      if (remote && remote.length > 0 && active) {
        setApplications((prev) => {
          const map: Record<string, AdmissionApplication> = {};
          prev.forEach((a) => { map[a.applicationNo] = a; });
          remote.forEach((r) => {
            const existing = map[r.applicationNo];
            map[r.applicationNo] = existing ? { ...r, ...existing } : r;
          });
          const combined = ensureUniqueAppIds(Object.values(map));
          saveCentralizedApplications(combined);
          return combined;
        });
      }
    }
    loadRemote();
    return () => { active = false; };
  }, []);

  const addApplication = async (
    app: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'applicationDate' | 'status'>,
    userContext?: { username?: string; role?: string }
  ) => {
    const generatedInqNo = generateAndIncrementNumber('inquiry');
    const newApp: AdmissionApplication = {
      ...app,
      id: `app-${Date.now()}`,
      applicationNo: generatedInqNo,
      inquiryNo: generatedInqNo,
      studentCategory: app.studentCategory || 'Day Scholar',
      dateOfJoining: app.dateOfJoining || new Date().toISOString().split('T')[0],
      feeApplicableFromMonth: app.feeApplicableFromMonth || 'April',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Inquiry'
    };
    const currentList = getCentralizedApplications();
    const updated = [newApp, ...currentList];
    setApplications(updated);
    saveCentralizedApplications(updated);

    setSyncStatus(`Syncing admission for "${newApp.studentName}" to Supabase...`);
    const res = await syncAdmissionLeadToSupabase(newApp, userContext);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);

    return newApp;
  };

  const updateApplicationStatus = async (
    id: string,
    status: AdmissionApplication['status'],
    remarks?: string,
    userContext?: { username?: string; role?: string }
  ) => {
    let updatedApp: AdmissionApplication | null = null;
    const currentList = getCentralizedApplications();
    const updated = currentList.map((a) => {
      if (a.id === id || a.applicationNo === id) {
        updatedApp = { ...a, status, interviewRemarks: remarks || a.interviewRemarks };
        if (status === 'Confirmed' || status === 'Offered' || status === 'Admission Process') {
          autoSyncAppToSis(updatedApp);
        }
        return updatedApp;
      }
      return a;
    });

    setApplications(updated);
    saveCentralizedApplications(updated);

    if (updatedApp) {
      const res = await syncAdmissionLeadToSupabase(updatedApp, userContext);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const addInquiry = async (
    app: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'applicationDate' | 'status' | 'feePaid' | 'registrationFee'>,
    userContext?: { username?: string; role?: string }
  ) => {
    const generatedInqNo = generateAndIncrementNumber('inquiry');
    const newApp: AdmissionApplication = {
      ...app,
      id: `inq-${Date.now()}`,
      applicationNo: generatedInqNo,
      inquiryNo: generatedInqNo,
      studentCategory: app.studentCategory || 'Day Scholar',
      dateOfJoining: app.dateOfJoining || new Date().toISOString().split('T')[0],
      feeApplicableFromMonth: app.feeApplicableFromMonth || 'April',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Inquiry',
      feePaid: false,
      registrationFee: 0,
      documentsUploaded: []
    };
    const currentList = getCentralizedApplications();
    const updated = [newApp, ...currentList];
    setApplications(updated);
    saveCentralizedApplications(updated);

    setSyncStatus(`Created free inquiry #${newApp.applicationNo} for "${newApp.studentName}"...`);
    const res = await syncAdmissionLeadToSupabase(newApp, userContext);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);

    return newApp;
  };

  const updateApplication = async (
    updatedApp: AdmissionApplication,
    userContext?: { username?: string; role?: string }
  ) => {
    const currentList = getCentralizedApplications();
    const updated = currentList.map((a) => (a.id === updatedApp.id || a.applicationNo === updatedApp.applicationNo ? updatedApp : a));
    setApplications(updated);
    saveCentralizedApplications(updated);

    if (updatedApp.status === 'Confirmed' || updatedApp.status === 'Offered' || updatedApp.status === 'Admission Process') {
      autoSyncAppToSis(updatedApp);
    }
    setSyncStatus(`Updated application details for "${updatedApp.studentName}"...`);
    const res = await syncAdmissionLeadToSupabase(updatedApp, userContext);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const saveEntranceTestResult = async (
    applicationId: string,
    testData: {
      score: number;
      maxMarks: number;
      status?: 'Passed' | 'Merit' | 'Needs Improvement' | 'Rejected';
      remarks?: string;
    },
    userContext?: { username?: string; role?: string }
  ) => {
    let updatedApp: AdmissionApplication | null = null;
    const percentage = Math.round((testData.score / testData.maxMarks) * 100);
    const inferredStatus = testData.status || (percentage >= 40 ? 'Passed' : 'Needs Improvement');

    const currentList = getCentralizedApplications();
    const updated = currentList.map((a) => {
      if (a.id === applicationId || a.applicationNo === applicationId) {
        updatedApp = {
          ...a,
          entranceTestScore: testData.score,
          entranceTestMaxMarks: testData.maxMarks,
          entranceTestStatus: inferredStatus,
          interviewRemarks: testData.remarks || a.interviewRemarks
        };
        return updatedApp;
      }
      return a;
    });

    setApplications(updated);
    saveCentralizedApplications(updated);

    if (updatedApp) {
      setSyncStatus(`Saved test score ${testData.score}/${testData.maxMarks} (${percentage}%) for "${(updatedApp as AdmissionApplication).studentName}"...`);
      const res = await syncAdmissionLeadToSupabase(updatedApp, userContext);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
    return updatedApp;
  };

  const addProtectedEditLog = async (
    applicationId: string,
    logData: {
      requestedBy: string;
      fieldChanged: string;
      previousValue: string;
      newValue: string;
      approvedBy: string;
      reason?: string;
    },
    updatedAppFields?: Partial<AdmissionApplication>,
    userContext?: { username?: string; role?: string }
  ) => {
    let finalApp: AdmissionApplication | null = null;
    const currentList = getCentralizedApplications();
    const updated = currentList.map((a) => {
      if (a.id === applicationId || a.applicationNo === applicationId) {
        const newLog = {
          id: `edit-log-${Date.now()}`,
          ...logData,
          approvedAt: new Date().toISOString()
        };
        const existingLogs = a.protectedEditLogs || [];
        finalApp = {
          ...a,
          ...(updatedAppFields || {}),
          protectedEditLogs: [newLog, ...existingLogs]
        };
        if (finalApp.status === 'Confirmed' || finalApp.status === 'Offered' || finalApp.status === 'Admission Process') {
          autoSyncAppToSis(finalApp);
        }
        return finalApp;
      }
      return a;
    });

    setApplications(updated);
    saveCentralizedApplications(updated);

    if (finalApp) {
      setSyncStatus(`Logged approved edit by ${logData.approvedBy} for "${(finalApp as AdmissionApplication).studentName}"...`);
      const res = await syncAdmissionLeadToSupabase(finalApp, userContext);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const promoteInquiryToRegistration = async (
    inquiryId: string,
    overrideRegistrationFee?: number,
    additionalDetails?: Partial<AdmissionApplication>,
    userContext?: { username?: string; role?: string }
  ) => {
    let updatedApp: AdmissionApplication | null = null;
    const generatedRegNo = generateAndIncrementNumber('registration');

    const currentList = getCentralizedApplications();
    const updated = currentList.map((a) => {
      if (a.id === inquiryId || a.applicationNo === inquiryId) {
        const classFees = getClassFeeStructure(a.applyingClass);
        const regFee = overrideRegistrationFee ?? classFees.registrationFee;
        updatedApp = {
          ...a,
          ...(additionalDetails || {}),
          status: 'Registration',
          feePaid: true,
          registrationFee: regFee,
          registrationNo: generatedRegNo,
          applicationNo: generatedRegNo,
          studentCategory: additionalDetails?.studentCategory || a.studentCategory || 'Day Scholar',
          dateOfJoining: additionalDetails?.dateOfJoining || a.dateOfJoining || new Date().toISOString().split('T')[0],
          feeApplicableFromMonth: additionalDetails?.feeApplicableFromMonth || a.feeApplicableFromMonth || 'April',
          applicationDate: new Date().toISOString().split('T')[0]
        };
        return updatedApp;
      }
      return a;
    });

    setApplications(updated);
    saveCentralizedApplications(updated);

    if (updatedApp) {
      setSyncStatus(`Registered "${(updatedApp as AdmissionApplication).studentName}" with Reg #${generatedRegNo} and ₹${(updatedApp as AdmissionApplication).registrationFee} fee...`);
      const res = await syncAdmissionLeadToSupabase(updatedApp, userContext);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const promoteRegistrationToAdmission = async (
    registrationId: string,
    studentCategory?: AdmissionApplication['studentCategory'],
    additionalDetails?: Partial<AdmissionApplication>,
    userContext?: { username?: string; role?: string }
  ) => {
    let updatedApp: AdmissionApplication | null = null;
    const generatedAdmNo = generateAndIncrementNumber('admission');

    const currentList = getCentralizedApplications();
    const updated = currentList.map((a) => {
      if (a.id === registrationId || a.applicationNo === registrationId) {
        const startMonth = additionalDetails?.feeApplicableFromMonth || a.feeApplicableFromMonth || 'April';
        const calculatedTuition = calculateClassTuitionForMonth(a.applyingClass, startMonth);
        const classFees = calculatedTuition.structure;

        const feeBreakdown = {
          registrationFee: a.registrationFee || classFees.registrationFee,
          admissionFee: classFees.admissionFee,
          tuitionFee: calculatedTuition.tuitionFeeCalculated,
          transportFee: (studentCategory || a.studentCategory) === 'Hosteler' ? 0 : classFees.transportFee,
          commitmentFee: classFees.commitmentFee,
          labFee: classFees.labFee,
          totalFee:
            (a.registrationFee || classFees.registrationFee) +
            classFees.admissionFee +
            calculatedTuition.tuitionFeeCalculated +
            ((studentCategory || a.studentCategory) === 'Hosteler' ? 0 : classFees.transportFee) +
            classFees.commitmentFee +
            classFees.labFee,
          annualTuitionFull: classFees.tuitionFeeAnnual,
          feeStartMonth: startMonth,
          monthsCharged: calculatedTuition.monthsCharged
        };

        updatedApp = {
          ...a,
          ...(additionalDetails || {}),
          studentCategory: studentCategory || a.studentCategory || 'Day Scholar',
          status: 'Admission Process',
          applicationNo: generatedAdmNo,
          dateOfJoining: additionalDetails?.dateOfJoining || a.dateOfJoining || new Date().toISOString().split('T')[0],
          feeApplicableFromMonth: startMonth,
          applicationDate: new Date().toISOString().split('T')[0],
          feeBreakdown
        };
        autoSyncAppToSis(updatedApp);
        return updatedApp;
      }
      return a;
    });

    setApplications(updated);
    saveCentralizedApplications(updated);

    if (updatedApp) {
      setSyncStatus(`Initiated final admission for "${(updatedApp as AdmissionApplication).studentName}" with Adm #${generatedAdmNo}...`);
      const res = await syncAdmissionLeadToSupabase(updatedApp, userContext);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  return {
    applications,
    seats,
    syncStatus,
    addApplication,
    addInquiry,
    updateApplication,
    addProtectedEditLog,
    saveEntranceTestResult,
    promoteInquiryToRegistration,
    promoteRegistrationToAdmission,
    updateApplicationStatus
  };
}
