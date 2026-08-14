import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sliders,
  CheckSquare,
  Square,
  Calculator,
  Award,
  Users,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Percent,
  CheckCircle2,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useSisStore } from '../sis/sisStore';
import { Student } from '../../types/sis';
import { ALL_SCHOOL_CLASSES } from '../../types/admission';

interface CalculationSettings {
  includeTheoryMarks: boolean;
  includePeriodicTests: boolean;
  includePracticalMarks: boolean;
  includeGrandTotal: boolean;
  includePercentage: boolean;
  includeClassRank: boolean;
  includeCbseGrades: boolean;
  includeAttendance: boolean;
  includeCoScholastic: boolean;
  includeSubjectAverage: boolean;
  includeTeacherRemarks: boolean;
  includeSignatures: boolean;
}

export const CustomizableStudentReport: React.FC = () => {
  const { students } = useSisStore();

  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedTerm, setSelectedTerm] = useState<string>('Annual Examination 2026');
  const [reportFormat, setReportFormat] = useState<'tabular_summary' | 'detailed_cards'>('tabular_summary');

  // Calculation Checkbox Settings
  const [calcSettings, setCalcSettings] = useState<CalculationSettings>({
    includeTheoryMarks: true,
    includePeriodicTests: true,
    includePracticalMarks: true,
    includeGrandTotal: true,
    includePercentage: true,
    includeClassRank: true,
    includeCbseGrades: true,
    includeAttendance: true,
    includeCoScholastic: true,
    includeSubjectAverage: true,
    includeTeacherRemarks: true,
    includeSignatures: true
  });

  const toggleSetting = (key: keyof CalculationSettings) => {
    setCalcSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter students for the selected class and section
  const targetStudents = useMemo(() => {
    const list = students.filter(
      (s) => s.currentClass === selectedClass && (selectedSection === 'All' || s.section === selectedSection)
    );
    return list.length > 0 ? list : students.slice(0, 15);
  }, [students, selectedClass, selectedSection]);

  // Compute calculated academic performance records dynamically per student
  const calculatedStudentRecords = useMemo(() => {
    const subjectsList = ['English Core', 'Mathematics', 'Science', 'Social Science', 'Hindi / Sanskrit'];

    const studentRows = targetStudents.map((s, index) => {
      // Deterministic synthetic marks based on student ID / index
      const baseSeed = (s.rollNo * 7 + index * 11) % 25;
      
      const subjectScores = subjectsList.map((subj, subjIdx) => {
        const variance = (subjIdx * 4 + index * 3) % 15;
        const pt = Math.min(10, Math.max(7, 8 + ((baseSeed + subjIdx) % 3)));
        const practical = Math.min(20, Math.max(16, 17 + ((baseSeed + subjIdx) % 4)));
        const theory = Math.min(70, Math.max(45, 52 + ((baseSeed + variance) % 19)));
        
        let total = 0;
        let max = 0;
        if (calcSettings.includePeriodicTests) { total += pt; max += 10; }
        if (calcSettings.includePracticalMarks) { total += practical; max += 20; }
        if (calcSettings.includeTheoryMarks) { total += theory; max += 70; }
        if (max === 0) { total = theory; max = 70; }

        const subjectPercent = (total / max) * 100;
        let grade = 'A1';
        if (subjectPercent >= 91) grade = 'A1';
        else if (subjectPercent >= 81) grade = 'A2';
        else if (subjectPercent >= 71) grade = 'B1';
        else if (subjectPercent >= 61) grade = 'B2';
        else if (subjectPercent >= 51) grade = 'C1';
        else if (subjectPercent >= 41) grade = 'C2';
        else if (subjectPercent >= 33) grade = 'D';
        else grade = 'E';

        return {
          subject: subj,
          pt,
          practical,
          theory,
          total,
          max,
          grade
        };
      });

      const grandTotal = subjectScores.reduce((sum, item) => sum + item.total, 0);
      const grandMax = subjectScores.reduce((sum, item) => sum + item.max, 0);
      const overallPercent = grandMax > 0 ? (grandTotal / grandMax) * 100 : 0;

      let overallGrade = 'A1';
      if (overallPercent >= 91) overallGrade = 'A1';
      else if (overallPercent >= 81) overallGrade = 'A2';
      else if (overallPercent >= 71) overallGrade = 'B1';
      else if (overallPercent >= 61) overallGrade = 'B2';
      else if (overallPercent >= 51) overallGrade = 'C1';
      else if (overallPercent >= 41) overallGrade = 'C2';
      else if (overallPercent >= 33) overallGrade = 'D';
      else overallGrade = 'E';

      const attendancePercent = 88 + (index * 2) % 11;
      const coScholasticGrade = index % 3 === 0 ? 'A' : index % 3 === 1 ? 'A+' : 'B+';

      let remark = 'Outstanding academic performance with exemplary discipline.';
      if (overallPercent < 60) remark = 'Consistent effort required in problem solving and theory.';
      else if (overallPercent < 75) remark = 'Good grasp of concepts. Regular revision recommended.';
      else if (overallPercent < 90) remark = 'Very good performance. Excellent participation in class.';

      return {
        student: s,
        subjectScores,
        grandTotal,
        grandMax,
        overallPercent,
        overallGrade,
        attendancePercent,
        coScholasticGrade,
        remark
      };
    });

    // Sort by grandTotal descending to assign ranks
    const sorted = [...studentRows].sort((a, b) => b.grandTotal - a.grandTotal);
    return sorted.map((row, rankIdx) => ({
      ...row,
      rank: rankIdx + 1
    }));
  }, [targetStudents, calcSettings]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-wider">
              Customizable Report Generator
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Dynamic Checkbox Calculations
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student Information & Examination Performance Report Engine with Real-Time Formula Recalculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Control & Calculation Checkboxes Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            1. Report Settings & Target Class Selection
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportFormat('tabular_summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportFormat === 'tabular_summary'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Tabular Master Sheet
            </button>
            <button
              onClick={() => setReportFormat('detailed_cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportFormat === 'detailed_cards'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Individual Report Cards
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
            >
              {ALL_SCHOOL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Examination Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
            >
              <option value="Annual Examination 2026">Annual Examination 2026</option>
              <option value="Term 1 Half-Yearly Exam">Term 1 Half-Yearly Exam</option>
              <option value="Term 2 Pre-Board Exam">Term 2 Pre-Board Exam</option>
              <option value="Periodic Assessment 1">Periodic Assessment 1</option>
              <option value="Periodic Assessment 2">Periodic Assessment 2</option>
            </select>
          </div>
        </div>

        {/* Calculation Checkboxes Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              2. Different Calculations & Report Settings via Checkboxes
            </h4>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
              Toggle checkboxes to recalculate marks in real-time
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { key: 'includeTheoryMarks', label: 'Theory Marks (70 / 80)', desc: 'Include main written examination score' },
              { key: 'includePeriodicTests', label: 'Periodic Assessments (10%)', desc: 'Include periodic unit test scores' },
              { key: 'includePracticalMarks', label: 'Practical / Lab (20%)', desc: 'Include internal viva & practicals' },
              { key: 'includeGrandTotal', label: 'Grand Total & Max Marks', desc: 'Aggregate total marks calculated' },
              { key: 'includePercentage', label: 'Overall Percentage %', desc: 'Percentage computed automatically' },
              { key: 'includeClassRank', label: 'Class Rank Position', desc: 'Rank assigned based on grand total' },
              { key: 'includeCbseGrades', label: 'CBSE 9-Point Grades', desc: 'A1, A2, B1, B2, C1, C2, D, E' },
              { key: 'includeAttendance', label: 'Attendance Record %', desc: 'Show student attendance percentage' },
              { key: 'includeCoScholastic', label: 'Co-Scholastic Grades', desc: 'Art, Physical Education & Discipline' },
              { key: 'includeSubjectAverage', label: 'Subject Breakdown', desc: 'Individual subject marks breakdown' },
              { key: 'includeTeacherRemarks', label: 'Teacher Remarks', desc: 'Evaluator assessment comments' },
              { key: 'includeSignatures', label: 'Signatures & Seal', desc: 'Principal & Teacher signature boxes' }
            ].map((item) => {
              const isChecked = calcSettings[item.key as keyof CalculationSettings];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSetting(item.key as keyof CalculationSettings)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isChecked
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* REPORT PRINTABLE PREVIEW CONTAINER */}
      <div id="printable-report-area" className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-300 shadow-md space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
        
        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[11px] uppercase tracking-widest mb-1">
            Affiliated to Central Board of Secondary Education (CBSE), New Delhi
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA
          </h1>
          <p className="text-xs font-bold text-slate-600">
            Shastripuram, Agra, Uttar Pradesh - 282007 | Email: info@gdgpsagra.edu | Affiliation No: 2130845
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-slate-800 border-t border-slate-200 mt-2">
            <span>Official Student Information & Examination Evaluation Report</span>
            <span>Academic Session: 2025-2026</span>
            <span>Term: {selectedTerm}</span>
          </div>
        </div>

        {/* Selected Criteria Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 text-[10px] block">Target Class & Section</span>
            <strong className="text-slate-900 font-black">{selectedClass} - {selectedSection}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Total Students Evaluated</span>
            <strong className="text-slate-900 font-black">{calculatedStudentRecords.length} Students</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Class Highest Score</span>
            <strong className="text-emerald-700 font-black">
              {calculatedStudentRecords[0]?.overallPercent.toFixed(1)}% ({calculatedStudentRecords[0]?.student.fullName})
            </strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Class Average Score</span>
            <strong className="text-indigo-700 font-black">
              {(
                calculatedStudentRecords.reduce((acc, curr) => acc + curr.overallPercent, 0) /
                calculatedStudentRecords.length
              ).toFixed(1)}%
            </strong>
          </div>
        </div>

        {/* FORMAT 1: TABULAR MASTER SHEET */}
        {reportFormat === 'tabular_summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px] border-b-2 border-slate-400">
                <tr>
                  {calcSettings.includeClassRank && <th className="p-2.5 text-center border-r border-slate-300">Rank</th>}
                  <th className="p-2.5 border-r border-slate-300">Roll No</th>
                  <th className="p-2.5 border-r border-slate-300">Student Name</th>
                  <th className="p-2.5 border-r border-slate-300">PEN / Adm No</th>
                  {calcSettings.includeAttendance && <th className="p-2.5 text-center border-r border-slate-300">Attendance</th>}
                  
                  {calcSettings.includeSubjectAverage && (
                    <>
                      <th className="p-2.5 text-center border-r border-slate-300">English</th>
                      <th className="p-2.5 text-center border-r border-slate-300">Maths</th>
                      <th className="p-2.5 text-center border-r border-slate-300">Science</th>
                      <th className="p-2.5 text-center border-r border-slate-300">Social Sc.</th>
                      <th className="p-2.5 text-center border-r border-slate-300">Hindi</th>
                    </>
                  )}

                  {calcSettings.includeGrandTotal && <th className="p-2.5 text-center border-r border-slate-300">Grand Total</th>}
                  {calcSettings.includePercentage && <th className="p-2.5 text-center border-r border-slate-300">Percentage</th>}
                  {calcSettings.includeCbseGrades && <th className="p-2.5 text-center border-r border-slate-300">Grade</th>}
                  {calcSettings.includeCoScholastic && <th className="p-2.5 text-center border-r border-slate-300">Co-Scholastic</th>}
                  {calcSettings.includeTeacherRemarks && <th className="p-2.5">Teacher Remarks</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-[11px]">
                {calculatedStudentRecords.map((row) => (
                  <tr key={row.student.id} className="hover:bg-slate-50">
                    {calcSettings.includeClassRank && (
                      <td className="p-2 text-center font-black text-indigo-700 border-r border-slate-300">
                        #{row.rank}
                      </td>
                    )}
                    <td className="p-2 font-bold text-slate-800 border-r border-slate-300">{row.student.rollNo}</td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{row.student.fullName}</td>
                    <td className="p-2 font-mono text-slate-600 border-r border-slate-300">{row.student.admissionNo}</td>
                    {calcSettings.includeAttendance && (
                      <td className="p-2 text-center font-bold text-emerald-700 border-r border-slate-300">
                        {row.attendancePercent}%
                      </td>
                    )}

                    {calcSettings.includeSubjectAverage && (
                      <>
                        {row.subjectScores.map((score, sIdx) => (
                          <td key={sIdx} className="p-2 text-center font-bold border-r border-slate-300">
                            <span>{score.total}</span>
                            <span className="text-[9px] text-slate-400">/{score.max}</span>
                          </td>
                        ))}
                      </>
                    )}

                    {calcSettings.includeGrandTotal && (
                      <td className="p-2 text-center font-black text-slate-900 border-r border-slate-300">
                        {row.grandTotal} / {row.grandMax}
                      </td>
                    )}

                    {calcSettings.includePercentage && (
                      <td className="p-2 text-center font-black text-indigo-700 border-r border-slate-300">
                        {row.overallPercent.toFixed(1)}%
                      </td>
                    )}

                    {calcSettings.includeCbseGrades && (
                      <td className="p-2 text-center font-black text-slate-800 border-r border-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300">
                          {row.overallGrade}
                        </span>
                      </td>
                    )}

                    {calcSettings.includeCoScholastic && (
                      <td className="p-2 text-center font-bold text-slate-700 border-r border-slate-300">
                        {row.coScholasticGrade}
                      </td>
                    )}

                    {calcSettings.includeTeacherRemarks && (
                      <td className="p-2 text-[10px] text-slate-600 max-w-xs truncate">
                        {row.remark}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORMAT 2: INDIVIDUAL DETAILED REPORT CARDS */}
        {reportFormat === 'detailed_cards' && (
          <div className="space-y-8">
            {calculatedStudentRecords.slice(0, 5).map((row) => (
              <div key={row.student.id} className="p-6 border-2 border-slate-300 rounded-xl space-y-4 page-break">
                <div className="flex justify-between items-start border-b pb-3 border-slate-200">
                  <div>
                    <h3 className="font-black text-base text-slate-900">{row.student.fullName}</h3>
                    <p className="text-xs text-slate-600">
                      Class: {row.student.currentClass} - Section {row.student.section} | Roll No: {row.student.rollNo} | Adm No: {row.student.admissionNo}
                    </p>
                  </div>
                  <div className="text-right">
                    {calcSettings.includeClassRank && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-900 rounded-md font-black text-xs">
                        Class Rank: #{row.rank}
                      </span>
                    )}
                  </div>
                </div>

                {/* Marks Table */}
                <table className="w-full text-xs text-left border border-slate-300">
                  <thead className="bg-slate-100 font-extrabold text-[10px] uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Subject</th>
                      {calcSettings.includePeriodicTests && <th className="p-2 text-center border-r border-slate-300">Periodic Test (10)</th>}
                      {calcSettings.includePracticalMarks && <th className="p-2 text-center border-r border-slate-300">Internal / Lab (20)</th>}
                      {calcSettings.includeTheoryMarks && <th className="p-2 text-center border-r border-slate-300">Theory Exam (70)</th>}
                      {calcSettings.includeGrandTotal && <th className="p-2 text-center border-r border-slate-300">Total Marks</th>}
                      {calcSettings.includeCbseGrades && <th className="p-2 text-center">Grade</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {row.subjectScores.map((score, sIdx) => (
                      <tr key={sIdx}>
                        <td className="p-2 font-bold border-r border-slate-300">{score.subject}</td>
                        {calcSettings.includePeriodicTests && <td className="p-2 text-center border-r border-slate-300">{score.pt}</td>}
                        {calcSettings.includePracticalMarks && <td className="p-2 text-center border-r border-slate-300">{score.practical}</td>}
                        {calcSettings.includeTheoryMarks && <td className="p-2 text-center border-r border-slate-300">{score.theory}</td>}
                        {calcSettings.includeGrandTotal && (
                          <td className="p-2 text-center font-black border-r border-slate-300">{score.total} / {score.max}</td>
                        )}
                        {calcSettings.includeCbseGrades && <td className="p-2 text-center font-bold">{score.grade}</td>}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-300">
                      <td className="p-2 border-r border-slate-300">Grand Aggregate</td>
                      <td colSpan={3} className="p-2 text-center border-r border-slate-300">
                        {calcSettings.includePercentage && (
                          <span>Overall Percentage: <strong className="text-indigo-700">{row.overallPercent.toFixed(1)}%</strong></span>
                        )}
                      </td>
                      <td className="p-2 text-center font-black border-r border-slate-300">{row.grandTotal} / {row.grandMax}</td>
                      <td className="p-2 text-center font-black">{row.overallGrade}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Additional Info Box */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  {calcSettings.includeAttendance && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 font-bold block text-[10px]">Attendance</span>
                      <strong className="text-emerald-700">{row.attendancePercent}% of working days present</strong>
                    </div>
                  )}
                  {calcSettings.includeCoScholastic && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 font-bold block text-[10px]">Co-Scholastic & Discipline</span>
                      <strong className="text-slate-900">Grade: {row.coScholasticGrade} (Exemplary)</strong>
                    </div>
                  )}
                </div>

                {calcSettings.includeTeacherRemarks && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block text-[10px]">Class Teacher Remarks:</span>
                    <p className="text-slate-800 italic mt-0.5">"{row.remark}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Official Signatures and Stamp */}
        {calcSettings.includeSignatures && (
          <div className="pt-8 grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-800 border-t border-slate-300">
            <div className="space-y-12">
              <div className="h-8" />
              <div className="border-t border-slate-400 pt-1">Class Teacher Signature</div>
            </div>

            <div className="space-y-12">
              <div className="h-8 flex items-center justify-center">
                <span className="px-3 py-1 rounded-full border border-slate-400 text-[10px] text-slate-400 uppercase">
                  Institutional Seal
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">Examination Incharge</div>
            </div>

            <div className="space-y-12">
              <div className="h-8" />
              <div className="border-t border-slate-400 pt-1">Principal / Head of Institution</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
