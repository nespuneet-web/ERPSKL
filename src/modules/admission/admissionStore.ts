import { useState, useEffect } from 'react';
import { AdmissionApplication, SeatAvailability } from '../../types/admission';
import { INITIAL_APPLICATIONS } from '../../data/mockData';
import { syncAdmissionLeadToSupabase, fetchAdmissionLeadsFromSupabase } from '../../lib/supabaseSync';
import { getClassFeeStructure } from '../fees/feeStructureStore';

const ADMISSION_STORAGE_KEY = 'schoolerp_admission_apps_v1';

const INITIAL_SEATS: SeatAvailability[] = [
  { className: 'Nursery', totalSeats: 60, filledSeats: 48, reservedSeats: 5, availableSeats: 7 },
  { className: 'KG', totalSeats: 60, filledSeats: 55, reservedSeats: 3, availableSeats: 2 },
  { className: 'Class 1', totalSeats: 80, filledSeats: 72, reservedSeats: 5, availableSeats: 3 },
  { className: 'Class 6', totalSeats: 80, filledSeats: 68, reservedSeats: 6, availableSeats: 6 },
  { className: 'Class 11 Science', totalSeats: 50, filledSeats: 35, reservedSeats: 5, availableSeats: 10 }
];

function ensureUniqueAppIds(list: AdmissionApplication[]): AdmissionApplication[] {
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

export function useAdmissionStore() {
  const [applications, setApplications] = useState<AdmissionApplication[]>(() => {
    const saved = localStorage.getItem(ADMISSION_STORAGE_KEY);
    return saved ? ensureUniqueAppIds(JSON.parse(saved)) : ensureUniqueAppIds(INITIAL_APPLICATIONS);
  });

  const [seats] = useState<SeatAvailability[]>(INITIAL_SEATS);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(ADMISSION_STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

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
          return ensureUniqueAppIds(Object.values(map));
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
    const newApp: AdmissionApplication = {
      ...app,
      id: `app-${Date.now()}`,
      applicationNo: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Inquiry'
    };
    setApplications((prev) => [newApp, ...prev]);

    // Live Sync to Supabase
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
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          updatedApp = { ...a, status, interviewRemarks: remarks || a.interviewRemarks };
          return updatedApp;
        }
        return a;
      })
    );

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
    const newApp: AdmissionApplication = {
      ...app,
      id: `inq-${Date.now()}`,
      applicationNo: `INQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Inquiry',
      feePaid: false,
      registrationFee: 0,
      documentsUploaded: []
    };
    setApplications((prev) => [newApp, ...prev]);

    setSyncStatus(`Created free inquiry for "${newApp.studentName}"...`);
    const res = await syncAdmissionLeadToSupabase(newApp, userContext);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);

    return newApp;
  };

  const updateApplication = async (
    updated: AdmissionApplication,
    userContext?: { username?: string; role?: string }
  ) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setSyncStatus(`Updated application details for "${updated.studentName}"...`);
    const res = await syncAdmissionLeadToSupabase(updated, userContext);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);
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
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === applicationId) {
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
          return finalApp;
        }
        return a;
      })
    );

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
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === inquiryId) {
          const classFees = getClassFeeStructure(a.applyingClass);
          const regFee = overrideRegistrationFee ?? classFees.registrationFee;
          updatedApp = {
            ...a,
            ...(additionalDetails || {}),
            status: 'Registration',
            feePaid: true,
            registrationFee: regFee,
            applicationNo: a.applicationNo.includes('INQ') ? a.applicationNo.replace('INQ', 'REG') : a.applicationNo,
            applicationDate: new Date().toISOString().split('T')[0]
          };
          return updatedApp;
        }
        return a;
      })
    );

    if (updatedApp) {
      setSyncStatus(`Registered "${(updatedApp as AdmissionApplication).studentName}" with ₹${(updatedApp as AdmissionApplication).registrationFee} fee...`);
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
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === registrationId) {
          const classFees = getClassFeeStructure(a.applyingClass);
          const feeBreakdown = a.feeBreakdown || {
            registrationFee: a.registrationFee || classFees.registrationFee,
            admissionFee: classFees.admissionFee,
            tuitionFee: classFees.tuitionFeeQuarterly,
            transportFee: classFees.transportFee,
            commitmentFee: classFees.commitmentFee,
            labFee: classFees.labFee,
            totalFee:
              (a.registrationFee || classFees.registrationFee) +
              classFees.admissionFee +
              classFees.tuitionFeeQuarterly +
              classFees.transportFee +
              classFees.commitmentFee +
              classFees.labFee
          };

          updatedApp = {
            ...a,
            ...(additionalDetails || {}),
            studentCategory: studentCategory || a.studentCategory || 'Normal Child',
            status: 'Admission Process',
            applicationNo: a.applicationNo.includes('REG') ? a.applicationNo.replace('REG', 'ADM') : a.applicationNo,
            applicationDate: new Date().toISOString().split('T')[0],
            feeBreakdown
          };
          return updatedApp;
        }
        return a;
      })
    );

    if (updatedApp) {
      setSyncStatus(`Initiated final admission process for "${(updatedApp as AdmissionApplication).studentName}"...`);
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
    promoteInquiryToRegistration,
    promoteRegistrationToAdmission,
    updateApplicationStatus
  };
}
