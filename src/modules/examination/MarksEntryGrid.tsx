import React, { useState } from 'react';
import { ExaminationType, SubjectConfig, ExamMarkSheet, StudentMarkEntry } from '../../types/examination';
import { Student } from '../../types/sis';
import { Lock, Unlock, Save, Download, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

interface MarksEntryGridProps {
  examTypes: ExaminationType[];
  subjects: SubjectConfig[];
  students: Student[];
  marksheets: ExamMarkSheet[];
  onSaveMark: (marksheetId: string, studentId: string, entry: StudentMarkEntry) => void;
  onToggleLock: (marksheetId: string, lockedBy: string) => void;
  currentUserRole: string;
}

export const MarksEntryGrid: React.FC<MarksEntryGridProps> = ({
  examTypes,
  subjects,
  students,
  marksheets,
  onSaveMark,
  onToggleLock,
  currentUserRole
}) => {
  const [selectedExamId, setSelectedExamId] = useState(examTypes[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const activeExam = examTypes.find((e) => e.id === selectedExamId) || examTypes[0];

  const filteredStudents = students.filter(
    (s) => s.currentClass === selectedClass && s.section === selectedSection
  );

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

  const handleScoreChange = (studentId: string, field: 'theoryMarks' | 'internalMarks' | 'practicalMarks', value: number) => {
    if (currentMarksheet.isLocked) return;

    const existingEntry = currentMarksheet.entries[studentId] || {
      theoryMarks: 0,
      internalMarks: 0,
      practicalMarks: 0,
      totalMarksObtained: 0,
      status: 'Present'
    };

    const updated = { ...existingEntry, [field]: value };
    const total = (updated.theoryMarks || 0) + (updated.internalMarks || 0) + (updated.practicalMarks || 0);
    updated.totalMarksObtained = total;

    onSaveMark(marksheetId, studentId, updated);
  };

  const handleStatusChange = (studentId: string, status: StudentMarkEntry['status']) => {
    if (currentMarksheet.isLocked) return;

    const existingEntry = currentMarksheet.entries[studentId] || {
      theoryMarks: 0,
      internalMarks: 0,
      practicalMarks: 0,
      totalMarksObtained: 0,
      status: 'Present'
    };

    onSaveMark(marksheetId, studentId, { ...existingEntry, status });
  };

  return (
    <div className="space-y-6">
      {/* Control Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Online Marks Entry Grid
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Instant auto-save marks evaluation grid with Freeze & Lock audit controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Lock/Unlock Button */}
            <button
              onClick={() => onToggleLock(marksheetId, 'Examination Incharge')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {examTypes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11 Science">Class 11 Science</option>
              <option value="Class 12 Science">Class 12 Science</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
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
                <th className="py-3 px-4">Student Name & Admission No</th>
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
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No students registered in {selectedClass} Section {selectedSection}.
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
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{std.rollNo}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{std.fullName}</p>
                        <p className="text-xs text-slate-500 font-mono">{std.admissionNo}</p>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={currentMarksheet.isLocked}
                          value={entry.status}
                          onChange={(e) => handleStatusChange(std.id, e.target.value as any)}
                          className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
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
                            value={entry.theoryMarks || 0}
                            onChange={(e) => handleScoreChange(std.id, 'theoryMarks', Number(e.target.value))}
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
                            value={entry.practicalMarks || 0}
                            onChange={(e) => handleScoreChange(std.id, 'practicalMarks', Number(e.target.value))}
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
                            value={entry.internalMarks || 0}
                            onChange={(e) => handleScoreChange(std.id, 'internalMarks', Number(e.target.value))}
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
