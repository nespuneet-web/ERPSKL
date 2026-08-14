import React, { useState } from 'react';
import { ExaminationType, SubjectConfig, ExamMarkSheet, StudentMarkEntry } from '../../types/examination';
import { Student } from '../../types/sis';
import { Lock, Unlock, Save, Download, Upload, CheckCircle, AlertTriangle, Filter, Search, Users } from 'lucide-react';
import { ALL_SCHOOL_CLASSES } from '../../data/mockData';

interface MarksEntryGridProps {
  examTypes: ExaminationType[];
  subjects: SubjectConfig[];
  students: Student[];
  marksheets: ExamMarkSheet[];
  autoSaveStatus?: string | null;
  onSaveMark: (
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
  ) => void;
  onSyncMarksBatch?: (examName: string, className: string, sectionName: string, subjectName: string, studentList: any[]) => void;
  onToggleLock: (marksheetId: string, lockedBy: string) => void;
  currentUserRole: string;
}

export const MarksEntryGrid: React.FC<MarksEntryGridProps> = ({
  examTypes,
  subjects,
  students,
  marksheets,
  autoSaveStatus,
  onSaveMark,
  onSyncMarksBatch,
  onToggleLock,
  currentUserRole
}) => {
  const [selectedExamId, setSelectedExamId] = useState(examTypes[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamically derive unique classes from student master + mockData
  const dynamicStudentClasses = Array.from(
    new Set(students.map((s) => s.currentClass || s.admissionClass).filter(Boolean))
  ) as string[];
  const classOptions = ['All Classes', ...Array.from(new Set([...ALL_SCHOOL_CLASSES, ...dynamicStudentClasses]))];

  // Dynamically derive unique sections from students
  const dynamicStudentSections = Array.from(
    new Set(students.map((s) => s.section).filter(Boolean))
  ) as string[];
  const sectionOptions = ['All Sections', ...Array.from(new Set(['A', 'B', 'C', 'D', 'E', 'F', ...dynamicStudentSections]))];

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const activeExam = examTypes.find((e) => e.id === selectedExamId) || examTypes[0];

  const isAllClasses = selectedClass === 'All Classes' || selectedClass === 'ALL' || !selectedClass;
  const isAllSections = selectedSection === 'All Sections' || selectedSection === 'ALL' || !selectedSection;

  const targetClassNorm = selectedClass.toLowerCase().replace(/class/g, '').replace(/grade/g, '').replace(/th|st|nd|rd/g, '').trim();
  const targetSectionNorm = selectedSection.toLowerCase().trim();

  const filteredStudents = students.filter((s) => {
    // Class filter
    const stdClassRaw = (s.currentClass || s.admissionClass || '').trim();
    const stdClassNorm = stdClassRaw.toLowerCase().replace(/class/g, '').replace(/grade/g, '').replace(/th|st|nd|rd/g, '').trim();

    const classMatches =
      isAllClasses ||
      stdClassRaw.toLowerCase() === selectedClass.toLowerCase() ||
      (targetClassNorm !== '' && stdClassNorm === targetClassNorm) ||
      stdClassRaw.toLowerCase().includes(selectedClass.toLowerCase()) ||
      selectedClass.toLowerCase().includes(stdClassRaw.toLowerCase());

    // Section filter
    const stdSec = (s.section || 'A').trim();
    const sectionMatches =
      isAllSections ||
      stdSec.toLowerCase() === targetSectionNorm ||
      !s.section;

    // Search filter (name, roll, admission number)
    const q = searchTerm.toLowerCase().trim();
    const searchMatches =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
      String(s.rollNo || '').includes(q);

    return classMatches && sectionMatches && searchMatches;
  });

  const marksheetId = `ms-${selectedClass.toLowerCase().replace(/\s+/g, '')}-${selectedSection.toLowerCase()}-${selectedSubjectId}-${selectedExamId}`;
  const currentMarksheet = marksheets.find((m) => m.id === marksheetId) || {
    id: marksheetId,
    examTypeId: selectedExamId,
    className: selectedClass,
    sectionName: selectedSection,
    subjectId: selectedSubjectId,
    academicYear: '2025-2026',
    isLocked: false,
    entries: {}
  };

  const handleScoreChange = (student: Student, field: 'theoryMarks' | 'internalMarks' | 'practicalMarks', rawVal: string) => {
    if (currentMarksheet.isLocked) return;

    const studentId = student.id;
    const existingEntry = currentMarksheet.entries[studentId] || {
      theoryMarks: 0,
      internalMarks: 0,
      practicalMarks: 0,
      totalMarksObtained: 0,
      status: 'Present'
    };

    const numVal = rawVal === '' ? 0 : Math.max(0, Number(rawVal));
    const updated = { ...existingEntry, [field]: numVal };
    const total = (updated.theoryMarks || 0) + (updated.internalMarks || 0) + (updated.practicalMarks || 0);
    updated.totalMarksObtained = total;

    onSaveMark(marksheetId, studentId, updated, {
      examName: activeExam?.name || 'Term Exam',
      className: selectedClass,
      sectionName: selectedSection,
      subjectName: activeSubject?.name || 'Subject',
      studentAdmissionNo: student.admissionNo,
      studentName: student.fullName
    });
  };

  const handleStatusChange = (student: Student, status: StudentMarkEntry['status']) => {
    if (currentMarksheet.isLocked) return;

    const studentId = student.id;
    const existingEntry = currentMarksheet.entries[studentId] || {
      theoryMarks: 0,
      internalMarks: 0,
      practicalMarks: 0,
      totalMarksObtained: 0,
      status: 'Present'
    };

    onSaveMark(marksheetId, studentId, { ...existingEntry, status }, {
      examName: activeExam?.name || 'Term Exam',
      className: selectedClass,
      sectionName: selectedSection,
      subjectName: activeSubject?.name || 'Subject',
      studentAdmissionNo: student.admissionNo,
      studentName: student.fullName
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Online Marks Entry Grid
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {filteredStudents.length} Students Available
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Auto-Save Active
              </span>
              {autoSaveStatus && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                  {autoSaveStatus}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Instant auto-saving on every keypress. Changes synchronize automatically to the database.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sync to Supabase Button */}
            {onSyncMarksBatch && (
              <button
                onClick={() => {
                  const studentData = filteredStudents.map((s) => {
                    const entry = currentMarksheet.entries[s.id] || { totalMarksObtained: 0 };
                    return {
                      admissionNo: s.admissionNo,
                      name: s.fullName,
                      marksObtained: entry.totalMarksObtained || 0,
                      remarks: entry.remarks || 'Marks evaluated'
                    };
                  });
                  onSyncMarksBatch(
                    activeExam?.name || 'Term Exam',
                    selectedClass,
                    selectedSection,
                    activeSubject?.name || 'Subject',
                    studentData
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                title="Manually verify and bulk-synchronize all marks to cloud database"
              >
                <Save className="w-4 h-4 text-blue-200" /> Save & Sync Marks to Supabase
              </button>
            )}

            {/* Lock/Unlock Button */}
            <button
              onClick={() => onToggleLock(marksheetId, 'Examination Incharge')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer ${
                currentMarksheet.isLocked
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {currentMarksheet.isLocked ? (
                <>
                  <Lock className="w-4 h-4" /> Marks Locked (Click to Unlock)
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" /> Lock & Freeze Marks Entry
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Examination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              {examTypes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.code})
                </option>
              ))}
            </select>
          </div>

          {/* Class Dropdown - ALL CLASSES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Class ({classOptions.length - 1} Classes)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Section Dropdown - ALL SECTIONS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              {sectionOptions.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'All Sections' ? 'All Sections (A-F)' : `Section ${sec}`}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown - ALL SUBJECTS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject ({subjects.length} Total)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quick Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search student or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {currentMarksheet.isLocked && (
          <div className="bg-rose-50 dark:bg-rose-950/40 p-3 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4" /> MARKSHEET IS FROZEN BY EXAMINATION INCHARGE AT {currentMarksheet.lockedAt || 'PREVIOUS SESSION'}. EDITING DISABLED.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name & Details</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Status</th>
                {activeSubject?.hasTheory && <th className="py-3 px-4">Theory (Max: {activeSubject.theoryMaxMarks})</th>}
                {activeSubject?.hasPractical && <th className="py-3 px-4">Practical (Max: {activeSubject.practicalMaxMarks})</th>}
                {activeSubject?.hasInternal && <th className="py-3 px-4">Internal (Max: {activeSubject.internalMaxMarks})</th>}
                <th className="py-3 px-4">Total Obtained</th>
                <th className="py-3 px-4 text-right">Result Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      No students found matching current filters.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try selecting "All Classes" or "All Sections" to view all {students.length} students across the ERP database.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const entry = currentMarksheet.entries[std.id] || {
                    theoryMarks: 0,
                    internalMarks: 0,
                    practicalMarks: 0,
                    totalMarksObtained: 0,
                    status: 'Present'
                  };

                  const isPassed = entry.totalMarksObtained >= (activeSubject?.passingMarks || 33);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {std.rollNo || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{std.fullName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                          <span>Adm: {std.admissionNo}</span>
                          {std.fatherName && <span>• C/O: {std.fatherName}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {std.currentClass || std.admissionClass || 'Class 10'} - {std.section || 'A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={currentMarksheet.isLocked}
                          value={entry.status}
                          onChange={(e) => handleStatusChange(std, e.target.value as any)}
                          className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-medium"
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Medical">Medical</option>
                          <option value="Exempted">Exempted</option>
                        </select>
                      </td>

                      {activeSubject?.hasTheory && (
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            disabled={currentMarksheet.isLocked || entry.status === 'Absent'}
                            min={0}
                            max={activeSubject.theoryMaxMarks}
                            value={entry.theoryMarks ?? 0}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(std, 'theoryMarks', e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-bold"
                          />
                        </td>
                      )}

                      {activeSubject?.hasPractical && (
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            disabled={currentMarksheet.isLocked || entry.status === 'Absent'}
                            min={0}
                            max={activeSubject.practicalMaxMarks}
                            value={entry.practicalMarks ?? 0}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(std, 'practicalMarks', e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-bold"
                          />
                        </td>
                      )}

                      {activeSubject?.hasInternal && (
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            disabled={currentMarksheet.isLocked || entry.status === 'Absent'}
                            min={0}
                            max={activeSubject.internalMaxMarks}
                            value={entry.internalMarks ?? 0}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(std, 'internalMarks', e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-bold"
                          />
                        </td>
                      )}

                      <td className="py-3 px-4 font-extrabold text-base text-slate-900 dark:text-white">
                        {entry.status === 'Absent' ? 'AB' : entry.totalMarksObtained}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {entry.status === 'Absent' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            ABSENT
                          </span>
                        ) : isPassed ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            PASS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            NEEDS IMPROVEMENT
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
