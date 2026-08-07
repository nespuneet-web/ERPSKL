import { useState, useEffect } from 'react';
import { ExaminationType, SubjectConfig, ExamMarkSheet, ReportCardTemplate, StudentMarkEntry } from '../../types/examination';
import { INITIAL_EXAM_TYPES, INITIAL_SUBJECTS, INITIAL_REPORT_TEMPLATES } from '../../data/mockData';

const EXAM_TYPES_KEY = 'schoolerp_exam_types_v1';
const SUBJECTS_KEY = 'schoolerp_subjects_v1';
const MARKSHEETS_KEY = 'schoolerp_marksheets_v1';
const TEMPLATES_KEY = 'schoolerp_report_templates_v1';

export function useExamStore() {
  const [examTypes, setExamTypes] = useState<ExaminationType[]>(() => {
    const saved = localStorage.getItem(EXAM_TYPES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_EXAM_TYPES;
  });

  const [subjects, setSubjects] = useState<SubjectConfig[]>(() => {
    const saved = localStorage.getItem(SUBJECTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [marksheets, setMarksheets] = useState<ExamMarkSheet[]>(() => {
    const saved = localStorage.getItem(MARKSHEETS_KEY);
    if (saved) return JSON.parse(saved);
    
    // Initial sample marksheet
    const initialSheet: ExamMarkSheet = {
      id: 'ms-10a-math-ut1',
      examTypeId: 'ex-1',
      className: 'Class 10',
      sectionName: 'A',
      subjectId: 'sub-1',
      academicYear: '2025-2026',
      isLocked: false,
      entries: {
        'std-101': { studentId: 'std-101', theoryMarks: 18, internalMarks: 19, totalMarksObtained: 37, status: 'Present', remarks: 'Excellent' },
        'std-102': { studentId: 'std-102', theoryMarks: 16, internalMarks: 18, totalMarksObtained: 34, status: 'Present', remarks: 'Good work' }
      }
    };
    return [initialSheet];
  });

  const [reportTemplates, setReportTemplates] = useState<ReportCardTemplate[]>(() => {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_REPORT_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem(EXAM_TYPES_KEY, JSON.stringify(examTypes));
  }, [examTypes]);

  useEffect(() => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(MARKSHEETS_KEY, JSON.stringify(marksheets));
  }, [marksheets]);

  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(reportTemplates));
  }, [reportTemplates]);

  // Actions
  const addExamType = (exam: Omit<ExaminationType, 'id'>) => {
    const newExam: ExaminationType = { ...exam, id: `ex-${Date.now()}` };
    setExamTypes((prev) => [...prev, newExam]);
  };

  const updateExamType = (id: string, fields: Partial<ExaminationType>) => {
    setExamTypes((prev) => prev.map((e) => (e.id === id ? { ...e, ...fields } : e)));
  };

  const deleteExamType = (id: string) => {
    setExamTypes((prev) => prev.filter((e) => e.id !== id));
  };

  const addSubject = (subject: Omit<SubjectConfig, 'id'>) => {
    const newSub: SubjectConfig = { ...subject, id: `sub-${Date.now()}` };
    setSubjects((prev) => [...prev, newSub]);
  };

  const updateSubject = (id: string, fields: Partial<SubjectConfig>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...fields } : s)));
  };

  const saveStudentMark = (marksheetId: string, studentId: string, entry: StudentMarkEntry) => {
    setMarksheets((prev) =>
      prev.map((ms) => {
        if (ms.id === marksheetId) {
          if (ms.isLocked) return ms; // Cannot edit locked marksheet
          return {
            ...ms,
            entries: {
              ...ms.entries,
              [studentId]: entry
            }
          };
        }
        return ms;
      })
    );
  };

  const toggleMarksheetLock = (marksheetId: string, lockedBy: string) => {
    setMarksheets((prev) =>
      prev.map((ms) => {
        if (ms.id === marksheetId) {
          return {
            ...ms,
            isLocked: !ms.isLocked,
            lockedBy: !ms.isLocked ? lockedBy : undefined,
            lockedAt: !ms.isLocked ? new Date().toISOString() : undefined
          };
        }
        return ms;
      })
    );
  };

  const saveReportTemplate = (template: ReportCardTemplate) => {
    setReportTemplates((prev) =>
      prev.some((t) => t.id === template.id)
        ? prev.map((t) => (t.id === template.id ? template : t))
        : [...prev, template]
    );
  };

  return {
    examTypes,
    addExamType,
    updateExamType,
    deleteExamType,
    subjects,
    addSubject,
    updateSubject,
    marksheets,
    saveStudentMark,
    toggleMarksheetLock,
    reportTemplates,
    saveReportTemplate
  };
}
