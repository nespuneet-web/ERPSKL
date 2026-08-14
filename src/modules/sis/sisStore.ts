import { useState, useEffect } from 'react';
import { Student, SchoolHouse, SchoolClub } from '../../types/sis';
import { INITIAL_STUDENTS, DEFAULT_SCHOOL_HOUSES, DEFAULT_SCHOOL_CLUBS } from '../../data/mockData';
import {
  syncStudentToSupabase,
  fetchStudentsFromSupabase,
  syncHousesClubsToSupabase,
  fetchHousesClubsFromSupabase
} from '../../lib/supabaseSync';
import { deleteRecord } from '../../lib/dbUtility';

const SIS_STORAGE_KEY = 'schoolerp_sis_students_v1';
const SIS_HOUSES_KEY = 'schoolerp_sis_houses_v1';
const SIS_CLUBS_KEY = 'schoolerp_sis_clubs_v1';

function ensureUniqueStudentIds(list: Student[]): Student[] {
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

export function useSisStore() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(SIS_STORAGE_KEY);
    return saved ? ensureUniqueStudentIds(JSON.parse(saved)) : ensureUniqueStudentIds(INITIAL_STUDENTS);
  });

  const [houses, setHouses] = useState<SchoolHouse[]>(() => {
    const saved = localStorage.getItem(SIS_HOUSES_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_HOUSES;
  });

  const [clubs, setClubs] = useState<SchoolClub[]>(() => {
    const saved = localStorage.getItem(SIS_CLUBS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_CLUBS;
  });

  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SIS_STORAGE_KEY, JSON.stringify(students));
  }, [students]);

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
          return ensureUniqueStudentIds(Object.values(map));
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
    setStudents((prev) => [newStudent, ...prev]);

    // Live Sync to Supabase
    setSyncStatus(`Syncing "${newStudent.fullName}" to Supabase...`);
    const res = await syncStudentToSupabase(newStudent);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);

    return newStudent;
  };

  const updateStudent = async (id: string, updatedFields: Partial<Student>) => {
    let updatedObj: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedObj = { ...s, ...updatedFields };
          return updatedObj;
        }
        return s;
      })
    );

    if (updatedObj) {
      const res = await syncStudentToSupabase(updatedObj);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const deleteStudent = async (id: string) => {
    const target = students.find((s) => s.id === id || s.admissionNo === id);
    setStudents((prev) => prev.filter((s) => s.id !== id && s.admissionNo !== id));

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
    setStudents((prev) =>
      prev.map((s) => {
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
      })
    );
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

