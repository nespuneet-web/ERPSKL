import { useState, useEffect } from 'react';
import { Student } from '../../types/sis';
import { INITIAL_STUDENTS } from '../../data/mockData';

const SIS_STORAGE_KEY = 'schoolerp_sis_students_v1';

export function useSisStore() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(SIS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  useEffect(() => {
    localStorage.setItem(SIS_STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`
    };
    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: string, updatedFields: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
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
    addStudent,
    updateStudent,
    deleteStudent,
    addDocumentToStudent
  };
}
