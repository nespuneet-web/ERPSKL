import { useState, useEffect, useCallback } from 'react';
import { Student, SchoolHouse, SchoolClub } from '../../types/sis';
import { INITIAL_STUDENTS, DEFAULT_SCHOOL_HOUSES, DEFAULT_SCHOOL_CLUBS } from '../../data/mockData';
import {
  syncStudentToSupabase,
  fetchStudentsFromSupabase,
  syncHousesClubsToSupabase,
  fetchHousesClubsFromSupabase
} from '../../lib/supabaseSync';
import { deleteRecord } from '../../lib/dbUtility';

export const SIS_STORAGE_KEY = 'schoolerp_sis_students_v1';
export const SIS_HOUSES_KEY = 'schoolerp_sis_houses_v1';
export const SIS_CLUBS_KEY = 'schoolerp_sis_clubs_v1';
export const ADMISSION_STORAGE_KEY = 'schoolerp_admission_apps_v1';

export function ensureUniqueStudentIds(list: Student[]): Student[] {
  const seen = new Set<string>();
  return list.map((item, idx) => {
    let id = item.id || `std-${idx}`;
    if (seen.has(id)) {
      id = `${id}-${idx}-${Date.now().toString(36)}`;
    }
    seen.add(id);
    return { ...item, id };
  });
}

/**
 * Merge admitted or confirmed applicants from the Admission store into the master SIS student list.
 */
export function mergeAdmittedAppsIntoSis(initialList: Student[]): Student[] {
  try {
    const rawApps = localStorage.getItem(ADMISSION_STORAGE_KEY);
    if (!rawApps) return initialList;
    const apps: any[] = JSON.parse(rawApps);
    // Include applications that are Confirmed, Offered, or in Admission Process
    const confirmedOrOffered = apps.filter(
      (a) => a.status === 'Confirmed' || a.status === 'Offered' || a.status === 'Admission Process'
    );

    const studentMap: Record<string, Student> = {};
    initialList.forEach((s) => {
      if (s.admissionNo) studentMap[s.admissionNo.toLowerCase()] = s;
      if (s.registrationNo) studentMap[s.registrationNo.toLowerCase()] = s;
      if (s.fullName) studentMap[s.fullName.trim().toLowerCase()] = s;
    });

    const merged = [...initialList];

    confirmedOrOffered.forEach((app) => {
      const appKey1 = (app.applicationNo || '').toLowerCase();
      const appKey2 = (app.registrationNo || '').toLowerCase();
      const appKey3 = (app.studentName || '').trim().toLowerCase();

      const exists = (appKey1 && studentMap[appKey1]) || (appKey2 && studentMap[appKey2]) || (appKey3 && studentMap[appKey3]);
      if (!exists && app.studentName) {
        const generatedAdmNo = app.applicationNo?.includes('ADM')
          ? app.applicationNo
          : `ADM-2026-${Math.floor(100 + Math.random() * 900)}`;

        const newStudent: Student = {
          id: `std-adm-${app.id || Date.now()}`,
          admissionNo: generatedAdmNo,
          registrationNo: app.registrationNo || app.applicationNo || `REG-${Date.now().toString().slice(-5)}`,
          scholarNo: app.scholarNo || `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
          penNo: app.penNo || `PEN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          apaarId: app.apaarId || `APAAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          aadhaarNo: app.aadhaarNo || '7812 9012 3456',
          fullName: app.studentName,
          gender: app.gender || 'Male',
          dob: app.dob || '2019-05-10',
          bloodGroup: app.bloodGroup || 'O+',
          religion: app.religion || 'Hinduism',
          caste: app.caste || '',
          category: app.category || 'General',
          studentCategory: app.studentCategory || 'Day Scholar',
          nationality: 'Indian',
          motherTongue: 'Hindi',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          admissionDate: app.applicationDate || new Date().toISOString().split('T')[0],
          dateOfJoining: app.dateOfJoining || new Date().toISOString().split('T')[0],
          feeApplicableFromMonth: app.feeApplicableFromMonth || 'April',
          admissionRemarks: app.admissionRemarks || app.specialDiscountNotes || '',
          specialDiscountNotes: app.specialDiscountNotes || '',
          admissionClass: app.applyingClass || 'Class 1',
          currentClass: app.applyingClass || 'Class 1',
          section: 'A',
          rollNo: merged.length + 1,
          house: 'Agni (Red)',
          clubName: 'Eco & Green Club',
          groupAActivity: 'Chess',
          groupBActivity: 'Cricket',
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
            fatherName: app.parentName || 'Parent / Guardian',
            fatherMobile: app.contactNumber || '',
            fatherEmail: app.email || 'parent@example.com',
            fatherOccupation: app.parentOccupation || 'Doctor / Engineer',
            fatherIncome: '18,00,000 PA',
            fatherQualification: 'Graduate',
            motherName: app.motherName || 'Mother',
            motherOccupation: app.motherOccupation || 'Educator',
            motherMobile: app.contactNumber || '',
            motherEmail: app.email || 'mother@example.com',
            address: app.address || 'Main Town, Delhi NCR',
            emergencyContact: app.contactNumber || ''
          },
          medical: { bloodGroup: 'O+', disability: false },
          documents: [],
          siblings: (app.siblingsList || []).map((s: any, idx: number) => ({
            id: `sib-${idx}`,
            name: s.name,
            classSection: s.className,
            admissionNo: s.admissionNo,
            relation: s.relation === 'Sister' ? 'Sister' : 'Brother'
          })),
          promotions: [],
          status: 'Active'
        };
        merged.unshift(newStudent);
        if (newStudent.admissionNo) studentMap[newStudent.admissionNo.toLowerCase()] = newStudent;
        if (newStudent.fullName) studentMap[newStudent.fullName.trim().toLowerCase()] = newStudent;
      }
    });

    return merged;
  } catch (e) {
    console.error('Error merging admitted applications into SIS:', e);
    return initialList;
  }
}

/**
 * Get centralized master list of students from localStorage and merged admissions.
 */
export function getCentralizedStudents(): Student[] {
  try {
    const saved = localStorage.getItem(SIS_STORAGE_KEY);
    const baseList = saved ? ensureUniqueStudentIds(JSON.parse(saved)) : ensureUniqueStudentIds(INITIAL_STUDENTS);
    return mergeAdmittedAppsIntoSis(baseList);
  } catch (e) {
    return ensureUniqueStudentIds(INITIAL_STUDENTS);
  }
}

/**
 * Save centralized student list to localStorage, dispatch update event, and sync to Supabase.
 */
export function saveCentralizedStudents(list: Student[]) {
  try {
    localStorage.setItem(SIS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('schoolerp_students_updated'));
    }
  } catch (e) {
    console.error('Error saving centralized students:', e);
  }
}

export function useSisStore() {
  const [students, setStudents] = useState<Student[]>(() => getCentralizedStudents());

  const [houses, setHouses] = useState<SchoolHouse[]>(() => {
    const saved = localStorage.getItem(SIS_HOUSES_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_HOUSES;
  });

  const [clubs, setClubs] = useState<SchoolClub[]>(() => {
    const saved = localStorage.getItem(SIS_CLUBS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_CLUBS;
  });

  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Sync state with centralized database updates
  useEffect(() => {
    const handleSync = () => {
      setStudents(getCentralizedStudents());
    };

    window.addEventListener('schoolerp_students_updated', handleSync);
    window.addEventListener('schoolerp_admissions_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('schoolerp_students_updated', handleSync);
      window.removeEventListener('schoolerp_admissions_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(SIS_HOUSES_KEY, JSON.stringify(houses));
  }, [houses]);

  useEffect(() => {
    localStorage.setItem(SIS_CLUBS_KEY, JSON.stringify(clubs));
  }, [clubs]);

  // Fetch remote students, houses, and clubs on mount
  useEffect(() => {
    let active = true;
    async function loadRemote() {
      const [remoteStudents, remoteHousesClubs] = await Promise.all([
        fetchStudentsFromSupabase(),
        fetchHousesClubsFromSupabase()
      ]);

      if (remoteHousesClubs && active) {
        if (remoteHousesClubs.houses && remoteHousesClubs.houses.length > 0) {
          setHouses(remoteHousesClubs.houses);
        }
        if (remoteHousesClubs.clubs && remoteHousesClubs.clubs.length > 0) {
          setClubs(remoteHousesClubs.clubs);
        }
      }

      if (remoteStudents && remoteStudents.length > 0 && active) {
        setStudents((prev) => {
          const map: Record<string, Student> = {};
          prev.forEach((s) => { map[s.admissionNo] = s; });
          remoteStudents.forEach((r) => {
            const existing = map[r.admissionNo];
            map[r.admissionNo] = existing ? { ...r, ...existing } : r;
          });
          const combined = ensureUniqueStudentIds(Object.values(map));
          localStorage.setItem(SIS_STORAGE_KEY, JSON.stringify(combined));
          return combined;
        });
      }
    }
    loadRemote();
    return () => { active = false; };
  }, []);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`
    };
    const currentList = getCentralizedStudents();
    const updated = [newStudent, ...currentList.filter((s) => s.admissionNo !== newStudent.admissionNo && s.fullName.toLowerCase() !== newStudent.fullName.toLowerCase())];
    setStudents(updated);
    saveCentralizedStudents(updated);

    // Live Sync to Supabase
    setSyncStatus(`Syncing "${newStudent.fullName}" to Supabase...`);
    const res = await syncStudentToSupabase(newStudent);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);

    return newStudent;
  };

  const updateStudent = async (id: string, updatedFields: Partial<Student>) => {
    let updatedObj: Student | null = null;
    const currentList = getCentralizedStudents();
    const updated = currentList.map((s) => {
      if (s.id === id || s.admissionNo === id) {
        updatedObj = { ...s, ...updatedFields };
        return updatedObj;
      }
      return s;
    });

    setStudents(updated);
    saveCentralizedStudents(updated);

    if (updatedObj) {
      const res = await syncStudentToSupabase(updatedObj);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const deleteStudent = async (id: string) => {
    const currentList = getCentralizedStudents();
    const target = currentList.find((s) => s.id === id || s.admissionNo === id);
    const updated = currentList.filter((s) => s.id !== id && s.admissionNo !== id);
    
    setStudents(updated);
    saveCentralizedStudents(updated);

    if (target && target.admissionNo) {
      setSyncStatus(`Deleting "${target.fullName}" from Supabase database...`);
      const res = await deleteRecord('students', target.admissionNo, undefined, 'admission_no');
      setSyncStatus(res.success ? `🟢 Deleted "${target.fullName}" from Live Supabase DB!` : res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const addHouse = async (house: Omit<SchoolHouse, 'id'>) => {
    const newHouse: SchoolHouse = { ...house, id: `house-${Date.now()}` };
    const updatedHouses = [...houses, newHouse];
    setHouses(updatedHouses);
    await syncHousesClubsToSupabase({ houses: updatedHouses, clubs });
  };

  const addClub = async (club: Omit<SchoolClub, 'id'>) => {
    const newClub: SchoolClub = { ...club, id: `club-${Date.now()}` };
    const updatedClubs = [...clubs, newClub];
    setClubs(updatedClubs);
    await syncHousesClubsToSupabase({ houses, clubs: updatedClubs });
  };

  const addDocumentToStudent = (studentId: string, doc: { title: string; type: any; fileName: string; url: string }) => {
    const currentList = getCentralizedStudents();
    const updated = currentList.map((s) => {
      if (s.id === studentId) {
        const newDoc = {
          id: `doc-${Date.now()}`,
          ...doc,
          uploadDate: new Date().toISOString().split('T')[0],
          verified: true
        };
        return { ...s, documents: [...s.documents, newDoc] };
      }
      return s;
    });
    setStudents(updated);
    saveCentralizedStudents(updated);
  };

  return {
    students,
    houses,
    clubs,
    syncStatus,
    addStudent,
    updateStudent,
    deleteStudent,
    addHouse,
    addClub,
    addDocumentToStudent
  };
}

