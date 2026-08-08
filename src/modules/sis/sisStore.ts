import { useState, useEffect } from 'react';
import { Student } from '../../types/sis';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { syncStudentToSupabase, fetchStudentsFromSupabase } from '../../lib/supabaseSync';

const SIS_STORAGE_KEY = 'schoolerp_sis_students_v1';

export function useSisStore() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(SIS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SIS_STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  // Fetch remote students on mount
  useEffect(() => {
    let active = true;
    async function loadRemote() {
      const remote = await fetchStudentsFromSupabase();
      if (remote && remote.length > 0 && active) {
        setStudents((prev) => {
          const map: Record<string, Student> = {};
          prev.forEach((s) => { map[s.admissionNo] = s; });
          remote.forEach((s) => { map[s.admissionNo] = s; });
          return Object.values(map);
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

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
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
    syncStatus,
    addStudent,
    updateStudent,
    deleteStudent,
    addDocumentToStudent
  };
}
