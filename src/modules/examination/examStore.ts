import { useState, useEffect, useRef } from 'react';
import { ExaminationType, SubjectConfig, ExamMarkSheet, ReportCardTemplate, StudentMarkEntry } from '../../types/examination';
import { INITIAL_EXAM_TYPES, INITIAL_SUBJECTS, INITIAL_REPORT_TEMPLATES } from '../../data/mockData';
import {
  syncMarksheetToSupabase,
  fetchMarksheetsFromSupabase,
  syncSubjectConfigToSupabase,
  fetchSubjectConfigsFromSupabase,
  syncExamTypeToSupabase,
  fetchExamTypesFromSupabase
} from '../../lib/supabaseSync';

const EXAM_TYPES_KEY = 'schoolerp_exam_types_v1';
const SUBJECTS_KEY = 'schoolerp_subjects_v1';
const MARKSHEETS_KEY = 'schoolerp_marksheets_v1';
const TEMPLATES_KEY = 'schoolerp_report_templates_v1';

export function useExamStore() {
  const debouncedSyncTimers = useRef<Record<string, any>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  const [examTypes, setExamTypes] = useState<ExaminationType[]>(() => {
    const saved = localStorage.getItem(EXAM_TYPES_KEY);
    if (saved) {
      try {
        const parsed: ExaminationType[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, ExaminationType>();
          INITIAL_EXAM_TYPES.forEach((e) => map.set(e.id, e));
          parsed.forEach((e) => {
            if (e && e.id) map.set(e.id, e);
          });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EXAM_TYPES;
  });

  const [subjects, setSubjects] = useState<SubjectConfig[]>(() => {
    const saved = localStorage.getItem(SUBJECTS_KEY);
    let list: SubjectConfig[] = INITIAL_SUBJECTS;
    if (saved) {
      try {
        const parsed: SubjectConfig[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, SubjectConfig>();
          // Index INITIAL_SUBJECTS first to ensure full 20 catalog
          INITIAL_SUBJECTS.forEach((s) => map.set(s.id, s));
          // Overlay or add parsed items
          parsed.forEach((s) => {
            if (s && s.id) {
              map.set(s.id, s);
            }
          });
          list = Array.from(map.values());
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Strict deduplication by ID and Code
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();
    const cleanList = list.filter((s) => {
      if (!s || !s.id || seenIds.has(s.id)) return false;
      const codeKey = (s.code || '').toLowerCase().trim();
      if (codeKey && seenCodes.has(codeKey)) return false;
      seenIds.add(s.id);
      if (codeKey) seenCodes.add(codeKey);
      return true;
    });
    return cleanList.length > 0 ? cleanList : INITIAL_SUBJECTS;
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

  const [syncStatus, setSyncStatus] = useState<string | null>(null);

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

  // Load Remote Student Marks from Supabase on mount
  useEffect(() => {
    let active = true;
    async function loadRemoteMarks() {
      const remoteMarks = await fetchMarksheetsFromSupabase();
      if (remoteMarks && remoteMarks.length > 0 && active) {
        setMarksheets((prev) => {
          const updated = [...prev];
          remoteMarks.forEach((m: any) => {
            const studentId = m.student_admission_no;
            const marksObtained = Number(m.marks_obtained) || 0;
            // Merge into active marksheets if existing or create
            let sheet = updated[0];
            if (sheet) {
              sheet.entries = {
                ...sheet.entries,
                [studentId]: {
                  studentId,
                  theoryMarks: marksObtained,
                  internalMarks: 0,
                  totalMarksObtained: marksObtained,
                  status: 'Present',
                  remarks: m.remarks || 'Evaluated'
                }
              };
            }
          });
          return [...updated];
        });
      }
    }
    loadRemoteMarks();
    return () => { active = false; };
  }, []);

  // Actions
  const addExamType = (exam: Omit<ExaminationType, 'id'>) => {
    const newExam: ExaminationType = { ...exam, id: `ex-${Date.now()}` };
    setExamTypes((prev) => [...prev, newExam]);
    syncExamTypeToSupabase({
      id: newExam.id,
      examName: newExam.name,
      academicYear: '2025-2026'
    });
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
    syncSubjectConfigToSupabase({
      code: newSub.code,
      name: newSub.name,
      theoryMaxMarks: newSub.theoryMaxMarks || 80,
      internalMaxMarks: newSub.internalMaxMarks || 20
    });
  };

  const updateSubject = (id: string, fields: Partial<SubjectConfig>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...fields } : s)));
  };

  const saveStudentMark = (
    marksheetId: string,
    studentId: string,
    entry: StudentMarkEntry,
    syncContext?: {
      examName?: string;
      className?: string;
      sectionName?: string;
      subjectName?: string;
      studentAdmissionNo?: string;
      studentName?: string;
    }
  ) => {
    setMarksheets((prev) => {
      const exists = prev.some((ms) => ms.id === marksheetId);
      if (!exists) {
        const newSheet: ExamMarkSheet = {
          id: marksheetId,
          examTypeId: '',
          className: syncContext?.className || '',
          sectionName: syncContext?.sectionName || '',
          subjectId: '',
          academicYear: '2025-2026',
          isLocked: false,
          entries: {
            [studentId]: entry
          }
        };
        return [...prev, newSheet];
      }

      return prev.map((ms) => {
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
      });
    });

    // Background debounced auto-sync to Supabase database
    if (syncContext && (syncContext.studentAdmissionNo || studentId)) {
      const admNo = syncContext.studentAdmissionNo || studentId;
      const stdName = syncContext.studentName || admNo;
      const timerKey = `${marksheetId}_${studentId}`;

      if (debouncedSyncTimers.current[timerKey]) {
        clearTimeout(debouncedSyncTimers.current[timerKey]);
      }

      setAutoSaveStatus(`Saving ${stdName}...`);

      debouncedSyncTimers.current[timerKey] = setTimeout(async () => {
        const res = await syncMarksheetToSupabase({
          examName: syncContext.examName || 'Term Evaluation',
          className: syncContext.className || 'Class 10',
          sectionName: syncContext.sectionName || 'A',
          subjectName: syncContext.subjectName || 'General',
          studentAdmissionNo: admNo,
          studentName: stdName,
          marksObtained: entry.totalMarksObtained || 0,
          remarks: entry.remarks || (entry.status === 'Absent' ? 'Absent' : `Auto-saved: ${entry.totalMarksObtained} marks`)
        });

        if (res.success) {
          setAutoSaveStatus(`🟢 Auto-saved ${stdName} (${entry.totalMarksObtained} marks) to Database`);
          setTimeout(() => setAutoSaveStatus(null), 3000);
        } else {
          setAutoSaveStatus(`Saved locally (${res.message || 'offline mode'})`);
          setTimeout(() => setAutoSaveStatus(null), 3000);
        }
      }, 500);
    }
  };

  const syncMarksheetBatch = async (
    examName: string,
    className: string,
    sectionName: string,
    subjectName: string,
    studentList: { admissionNo: string; name: string; marksObtained: number; remarks?: string }[],
    userContext?: { username?: string; role?: string }
  ) => {
    if (studentList.length === 0) return;
    setSyncStatus(`Syncing ${studentList.length} student marks for "${subjectName}" to Supabase...`);
    
    let lastMsg = '';
    for (const item of studentList) {
      const res = await syncMarksheetToSupabase(
        {
          examName,
          className,
          sectionName,
          subjectName,
          studentAdmissionNo: item.admissionNo,
          studentName: item.name,
          marksObtained: item.marksObtained,
          remarks: item.remarks || 'Marksheet evaluated'
        },
        userContext
      );
      lastMsg = res.message;
    }

    setSyncStatus(lastMsg || '🟢 Marks synced successfully to Supabase!');
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const toggleMarksheetLock = (marksheetId: string, lockedBy: string) => {
    setMarksheets((prev) => {
      const exists = prev.some((ms) => ms.id === marksheetId);
      if (!exists) {
        const newSheet: ExamMarkSheet = {
          id: marksheetId,
          examTypeId: '',
          className: '',
          sectionName: '',
          subjectId: '',
          academicYear: '2025-2026',
          isLocked: true,
          lockedBy: lockedBy,
          lockedAt: new Date().toISOString(),
          entries: {}
        };
        return [...prev, newSheet];
      }
      return prev.map((ms) => {
        if (ms.id === marksheetId) {
          return {
            ...ms,
            isLocked: !ms.isLocked,
            lockedBy: !ms.isLocked ? lockedBy : undefined,
            lockedAt: !ms.isLocked ? new Date().toISOString() : undefined
          };
        }
        return ms;
      });
    });
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
    syncStatus,
    autoSaveStatus,
    saveStudentMark,
    syncMarksheetBatch,
    toggleMarksheetLock,
    reportTemplates,
    saveReportTemplate
  };
}
