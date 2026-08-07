import React, { useState } from 'react';
import { ExaminationType } from '../../types/examination';
import { Student } from '../../types/sis';
import {
  GD_GOENKA_SCHOOL_META,
  EDUCATIONAL_STAGES,
  EducationalStageId
} from './gdGoenkaData';
import {
  Award,
  Calculator,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Percent,
  Sparkles,
  BookOpen,
  Settings2,
  ShieldCheck,
  ListChecks,
  Clock,
  Calendar,
  MapPin,
  UserCheck,
  FileText
} from 'lucide-react';

interface ExamWeightageSetupProps {
  examTypes: ExaminationType[];
  students: Student[];
  onUpdateExamTypes: (updated: ExaminationType[]) => void;
}

export interface SubjectExamRule {
  examId: string;
  examName: string;
  maxMarks: number;
  includeInCalculation: boolean;
  patternRule: 'as_is_percentage' | 'convert_to_weightage' | 'average' | 'best_of_n';
  targetWeightagePct: number;
  bestOfNValue: number;
  examDate?: string;
  startTime?: string;
  durationMinutes?: number;
  hallNo?: string;
  invigilator?: string;
}

export const ExamWeightageSetup: React.FC<ExamWeightageSetupProps> = ({
  students,
}) => {
  const [activeStageId, setActiveStageId] = useState<EducationalStageId>('STAGE_E_SEC');
  const [selectedSubject, setSelectedSubject] = useState<string>('English');
  const [selectedClass, setSelectedClass] = useState<string>('Class 10-A');

  const currentStageInfo = EDUCATIONAL_STAGES.find((s) => s.id === activeStageId) || EDUCATIONAL_STAGES[4];

  // Global settings for Best Of N or Weekly Test grouping
  const [weeklyTestMode, setWeeklyTestMode] = useState<'best_of_n' | 'average' | 'weightage'>('best_of_n');
  const [globalBestNCount, setGlobalBestNCount] = useState<number>(3);

  // Pre-populated exam schedule with exact GD Goenka assessment components
  const defaultExamsSchedule: SubjectExamRule[] = [
    { examId: 'csa_a', examName: 'CSA Cycle A (30 Marks)', maxMarks: 30, includeInCalculation: true, patternRule: 'best_of_n', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2025-07-15', startTime: '09:00 AM', durationMinutes: 60, hallNo: 'Hall A-1', invigilator: 'Dr. S. K. Rastogi' },
    { examId: 'ut1', examName: 'Unit Test 1 (30 Marks)', maxMarks: 30, includeInCalculation: true, patternRule: 'best_of_n', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2025-08-01', startTime: '09:00 AM', durationMinutes: 60, hallNo: 'Hall A-1', invigilator: 'Mrs. Sunita Verma' },
    { examId: 'csa_b', examName: 'CSA Cycle B (30 Marks)', maxMarks: 30, includeInCalculation: true, patternRule: 'best_of_n', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2025-11-10', startTime: '09:00 AM', durationMinutes: 60, hallNo: 'Hall A-1', invigilator: 'Dr. S. K. Rastogi' },
    { examId: 'ut2', examName: 'Unit Test 2 (30 Marks)', maxMarks: 30, includeInCalculation: true, patternRule: 'best_of_n', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2025-12-05', startTime: '09:00 AM', durationMinutes: 60, hallNo: 'Hall A-1', invigilator: 'Mr. Rajesh Kumar' },
    { examId: 'ma_t2', examName: 'Multiple Assessment T2', maxMarks: 5, includeInCalculation: true, patternRule: 'convert_to_weightage', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2026-01-15', startTime: '10:00 AM', durationMinutes: 45, hallNo: 'Classroom', invigilator: 'Mrs. Sunita Verma' },
    { examId: 'port_t2', examName: 'Portfolio T2', maxMarks: 5, includeInCalculation: true, patternRule: 'convert_to_weightage', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2026-01-20', startTime: '10:00 AM', durationMinutes: 45, hallNo: 'Classroom', invigilator: 'Mrs. Sunita Verma' },
    { examId: 'se_t2', examName: 'Subject Enrichment T2', maxMarks: 5, includeInCalculation: true, patternRule: 'convert_to_weightage', targetWeightagePct: 5, bestOfNValue: 1, examDate: '2026-02-01', startTime: '10:00 AM', durationMinutes: 45, hallNo: 'Lab / Room', invigilator: 'Dr. S. K. Rastogi' },
    { examId: 'hy', examName: 'Half-Yearly Theory / Term I', maxMarks: 80, includeInCalculation: true, patternRule: 'convert_to_weightage', targetWeightagePct: 50, bestOfNValue: 1, examDate: '2025-09-20', startTime: '09:00 AM', durationMinutes: 180, hallNo: 'Main Exam Hall', invigilator: 'Dr. S. K. Rastogi' },
    { examId: 'an', examName: 'Annual Final Exam / Term II', maxMarks: 80, includeInCalculation: true, patternRule: 'convert_to_weightage', targetWeightagePct: 50, bestOfNValue: 1, examDate: '2026-03-12', startTime: '09:00 AM', durationMinutes: 180, hallNo: 'Main Exam Hall', invigilator: 'Mrs. Sunita Verma' },
    { examId: 'wt_series', examName: 'Weekly Test Series (20 Tests)', maxMarks: 20, includeInCalculation: true, patternRule: 'best_of_n', targetWeightagePct: 10, bestOfNValue: 3, examDate: '2025-10-05', startTime: '08:30 AM', durationMinutes: 45, hallNo: 'Classroom', invigilator: 'Mr. Rajesh Kumar' }
  ];

  const [subjectRulesMap, setSubjectRulesMap] = useState<Record<string, SubjectExamRule[]>>({
    'English': defaultExamsSchedule,
    'Mathematics': defaultExamsSchedule,
    'Science': defaultExamsSchedule,
    'Social Studies': defaultExamsSchedule,
    'Hindi': defaultExamsSchedule
  });

  const activeSubjectRules = subjectRulesMap[selectedSubject] || defaultExamsSchedule;

  const handleUpdateRule = (examId: string, updates: Partial<SubjectExamRule>) => {
    setSubjectRulesMap((prev) => {
      const currentList = prev[selectedSubject] || defaultExamsSchedule;
      const updatedList = currentList.map((r) => (r.examId === examId ? { ...r, ...updates } : r));
      return { ...prev, [selectedSubject]: updatedList };
    });
  };

  const handleSaveAllSubjectRules = () => {
    alert(`GD Goenka Agra exam calculation rules saved successfully for ${currentStageInfo.title} (${selectedSubject})!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
              G D GOENKA PUBLIC SCHOOL, AGRA
            </span>
            <span className="text-xs text-slate-500">• Session 2025-26 Rules Engine</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-500" />
            Stage-Wise Assessment Rules & Calculation Setup
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure assessment components (CSA Cycle A/B, UT 1/2, Multiple Assessment, Portfolio, Subject Enrichment, Annual Exam, & Theory/Practical splits across 5 Stages).
          </p>
        </div>

        <button
          onClick={handleSaveAllSubjectRules}
          className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" /> Save Rules Configuration
        </button>
      </div>

      {/* 5 EDUCATIONAL STAGES SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {EDUCATIONAL_STAGES.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveStageId(st.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeStageId === st.id
                ? st.track === 'HPC'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400'
                  : 'bg-blue-700 text-white border-blue-800 shadow-md ring-2 ring-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
            }`}
          >
            <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-80 block">{st.track} TRACK</span>
            <p className="text-xs font-black mt-0.5 truncate">{st.title.split(':')[0]}</p>
            <p className="text-[10px] opacity-90 mt-1 leading-tight line-clamp-2">{st.description}</p>
          </button>
        ))}
      </div>

      {/* STAGE DESCRIPTION BANNER */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-800 dark:text-slate-200 space-y-0.5">
          <h4 className="font-extrabold text-sm">{currentStageInfo.title}</h4>
          <p className="text-slate-600 dark:text-slate-400">{currentStageInfo.description}</p>
          <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
            Applicable Classes: {currentStageInfo.classes.join(', ')} • Document Title: "{currentStageInfo.docTitle}"
          </p>
        </div>
      </div>

      {/* SUBJECT SELECTOR & TOOLBAR */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Select Subject:</label>
            <div className="flex gap-1.5">
              {['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'].map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Periodic Test Selection Rule:</label>
            <select
              value={weeklyTestMode}
              onChange={(e) => setWeeklyTestMode(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white"
            >
              <option value="best_of_n">Best of CSA Cycle B / UT-2 (GD Goenka Pattern)</option>
              <option value="average">Average of All Assessments</option>
              <option value="weightage">Direct Weightage Conversion</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 p-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{currentStageInfo.code} • {selectedSubject}</span>
        </div>
      </div>

      {/* EXAMS CONFIGURATION TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-amber-500" />
                Assessment Components & Schedule ({activeSubjectRules.length} Components)
              </h3>
              <p className="text-xs text-slate-500">
                Configure max marks, exam schedules, times, hall numbers, and calculation inclusion.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b font-bold text-slate-700 dark:text-slate-200 uppercase">
                  <th className="py-3 px-2">Inc.</th>
                  <th className="py-3 px-3">Assessment Component</th>
                  <th className="py-3 px-2">Max Marks</th>
                  <th className="py-3 px-3">Calculation Rule</th>
                  <th className="py-3 px-3">Schedule & Time</th>
                  <th className="py-3 px-2 text-right">Target Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {activeSubjectRules.map((rule) => (
                  <tr key={rule.examId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={rule.includeInCalculation}
                        onChange={(e) => handleUpdateRule(rule.examId, { includeInCalculation: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {rule.examName}
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={rule.maxMarks}
                        onChange={(e) => handleUpdateRule(rule.examId, { maxMarks: Number(e.target.value) })}
                        className="w-16 px-1.5 py-1 text-xs font-bold border rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={rule.patternRule}
                        onChange={(e) => handleUpdateRule(rule.examId, { patternRule: e.target.value as any })}
                        className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border rounded text-slate-900 dark:text-white"
                      >
                        <option value="convert_to_weightage">Convert to Weightage</option>
                        <option value="best_of_n">Best of CSA / UT (Best-1)</option>
                        <option value="as_is_percentage">Percentage As Is</option>
                        <option value="average">Average Score</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>{rule.examDate || '2026-03-12'} ({rule.startTime || '09:00 AM'})</div>
                      <div className="text-[10px] text-slate-400">{rule.hallNo} • Invigilator: {rule.invigilator}</div>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-blue-700 dark:text-blue-300">
                      {rule.targetWeightagePct} Marks
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: STAGE SPECIFIC CALCULATION RULES SUMMARY */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            GD Goenka Agra Calculation Summary
          </h3>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <p className="font-bold text-indigo-900 dark:text-indigo-300 uppercase">
              {currentStageInfo.title}
            </p>

            {currentStageInfo.track === 'HPC' ? (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1 text-emerald-950">
                <p className="font-bold">NIPUN & NCF-SE Pattern Active:</p>
                <p>Evaluates 13 Curriculum Goals across 3-Level Indicators (🌱 Beginner, 🌿 Progressing, 🌳 Proficient).</p>
                <p>Includes Multi-Stakeholder Feedback (Parent, Child Self-Assessment, Peer Assessment).</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">Periodic Test (2.5 / 5 Marks)</p>
                  <p className="text-[11px] text-slate-500">Calculated as Best of CSA Cycle B (30 Marks) vs UT-2 (30 Marks).</p>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">Internal Assessments (7.5 / 15 Marks)</p>
                  <p className="text-[11px] text-slate-500">Multiple Assessment + Portfolio + Subject Enrichment.</p>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">Annual Final Exam (40 / 80 Marks)</p>
                  <p className="text-[11px] text-slate-500">Comprehensive Pen-Paper Assessment for main subjects.</p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t font-bold text-slate-700 dark:text-slate-300">
              Grading Scale: A1 (91-100), A2 (81-90), B1 (71-80), B2 (61-70), C1 (51-60), C2 (41-50), D (33-40), E (&lt;33).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
