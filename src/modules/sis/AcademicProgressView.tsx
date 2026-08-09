import React from 'react';
import { Student } from '../../types/sis';
import { useAcademicPermissions } from '../admission/academicPermissionStore';
import { Award, Lock, FileText, CheckCircle2, Download, AlertCircle, Eye, Printer } from 'lucide-react';

interface AcademicProgressViewProps {
  student: Student;
}

interface RawExamMark {
  examName: string;
  examKey: 'ut1' | 'ut2' | 'halfYearly' | 'annual';
  taken: boolean;
  theoryMarks: number;
  theoryMax: number;
  internalMarks: number;
  internalMax: number;
  totalObtained: number;
  totalMax: number;
  remarks?: string;
}

interface SubjectRawProgress {
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  exams: Record<'ut1' | 'ut2' | 'halfYearly' | 'annual', RawExamMark>;
}

export const AcademicProgressView: React.FC<AcademicProgressViewProps> = ({ student }) => {
  const { globalReportCardActive, getStudentPermission } = useAcademicPermissions();
  const studentPerm = getStudentPermission(student.id);

  const isSectionActive = globalReportCardActive && studentPerm.reportCardActive;

  // Sample raw marks dataset subject-wise & examination-wise (No calculations, percentages, or grades!)
  const subjectProgressList: SubjectRawProgress[] = [
    {
      subjectCode: 'MATH-101',
      subjectName: 'Mathematics',
      teacherName: 'Ankur Kabra',
      exams: {
        ut1: { examName: 'Unit Test 1', examKey: 'ut1', taken: true, theoryMarks: 28, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 37, totalMax: 40, remarks: 'Taken' },
        ut2: { examName: 'Periodic Test 2', examKey: 'ut2', taken: true, theoryMarks: 27, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 36, totalMax: 40, remarks: 'Taken' },
        halfYearly: { examName: 'Half-Yearly Examination', examKey: 'halfYearly', taken: true, theoryMarks: 72, theoryMax: 80, internalMarks: 18, internalMax: 20, totalObtained: 90, totalMax: 100, remarks: 'Taken' },
        annual: { examName: 'Annual Examination', examKey: 'annual', taken: true, theoryMarks: 75, theoryMax: 80, internalMarks: 19, internalMax: 20, totalObtained: 94, totalMax: 100, remarks: 'Taken' }
      }
    },
    {
      subjectCode: 'SCI-201',
      subjectName: 'Science & Technology',
      teacherName: 'Dr. Priya Nambiar',
      exams: {
        ut1: { examName: 'Unit Test 1', examKey: 'ut1', taken: true, theoryMarks: 26, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 35, totalMax: 40, remarks: 'Taken' },
        ut2: { examName: 'Periodic Test 2', examKey: 'ut2', taken: true, theoryMarks: 25, theoryMax: 30, internalMarks: 8, internalMax: 10, totalObtained: 33, totalMax: 40, remarks: 'Taken' },
        halfYearly: { examName: 'Half-Yearly Examination', examKey: 'halfYearly', taken: true, theoryMarks: 68, theoryMax: 80, internalMarks: 17, internalMax: 20, totalObtained: 85, totalMax: 100, remarks: 'Taken' },
        annual: { examName: 'Annual Examination', examKey: 'annual', taken: true, theoryMarks: 71, theoryMax: 80, internalMarks: 18, internalMax: 20, totalObtained: 89, totalMax: 100, remarks: 'Taken' }
      }
    },
    {
      subjectCode: 'ENG-301',
      subjectName: 'English Language & Lit',
      teacherName: 'Mrs. Sunita Verma',
      exams: {
        ut1: { examName: 'Unit Test 1', examKey: 'ut1', taken: true, theoryMarks: 27, theoryMax: 30, internalMarks: 10, internalMax: 10, totalObtained: 37, totalMax: 40, remarks: 'Taken' },
        ut2: { examName: 'Periodic Test 2', examKey: 'ut2', taken: true, theoryMarks: 28, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 37, totalMax: 40, remarks: 'Taken' },
        halfYearly: { examName: 'Half-Yearly Examination', examKey: 'halfYearly', taken: true, theoryMarks: 74, theoryMax: 80, internalMarks: 19, internalMax: 20, totalObtained: 93, totalMax: 100, remarks: 'Taken' },
        annual: { examName: 'Annual Examination', examKey: 'annual', taken: true, theoryMarks: 76, theoryMax: 80, internalMarks: 19, internalMax: 20, totalObtained: 95, totalMax: 100, remarks: 'Taken' }
      }
    },
    {
      subjectCode: 'SST-401',
      subjectName: 'Social Science',
      teacherName: 'Mr. Rajesh Namboodiri',
      exams: {
        ut1: { examName: 'Unit Test 1', examKey: 'ut1', taken: true, theoryMarks: 25, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 34, totalMax: 40, remarks: 'Taken' },
        ut2: { examName: 'Periodic Test 2', examKey: 'ut2', taken: true, theoryMarks: 26, theoryMax: 30, internalMarks: 8, internalMax: 10, totalObtained: 34, totalMax: 40, remarks: 'Taken' },
        halfYearly: { examName: 'Half-Yearly Examination', examKey: 'halfYearly', taken: true, theoryMarks: 70, theoryMax: 80, internalMarks: 18, internalMax: 20, totalObtained: 88, totalMax: 100, remarks: 'Taken' },
        annual: { examName: 'Annual Examination', examKey: 'annual', taken: false, theoryMarks: 0, theoryMax: 80, internalMarks: 0, internalMax: 20, totalObtained: 0, totalMax: 100, remarks: 'Awaiting Exam / Not Taken Yet' }
      }
    },
    {
      subjectCode: 'HIN-501',
      subjectName: 'Hindi Course-A',
      teacherName: 'Dr. Meenakshi Sharma',
      exams: {
        ut1: { examName: 'Unit Test 1', examKey: 'ut1', taken: true, theoryMarks: 28, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 37, totalMax: 40, remarks: 'Taken' },
        ut2: { examName: 'Periodic Test 2', examKey: 'ut2', taken: true, theoryMarks: 27, theoryMax: 30, internalMarks: 9, internalMax: 10, totalObtained: 36, totalMax: 40, remarks: 'Taken' },
        halfYearly: { examName: 'Half-Yearly Examination', examKey: 'halfYearly', taken: true, theoryMarks: 71, theoryMax: 80, internalMarks: 18, internalMax: 20, totalObtained: 89, totalMax: 100, remarks: 'Taken' },
        annual: { examName: 'Annual Examination', examKey: 'annual', taken: true, theoryMarks: 73, theoryMax: 80, internalMarks: 19, internalMax: 20, totalObtained: 92, totalMax: 100, remarks: 'Taken' }
      }
    }
  ];

  const handlePrintStatement = () => {
    window.print();
  };

  if (!isSectionActive) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Academic Progress View Currently Inactive
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The Academic Progress report card view is activated by the Examination Cell / Admission Panel only when student result statements are officially published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-[11px] font-extrabold uppercase tracking-wide">
            Subject & Examination Raw Marks Statement
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Academic Progress: {student.fullName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Class: {student.currentClass} - Section {student.section} | Roll No: {student.rollNo} | Scholar No: {student.scholarNo}
          </p>
        </div>

        <button
          onClick={handlePrintStatement}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Raw Marks Statement</span>
        </button>
      </div>

      {/* Routine Raw Marks Notice */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
        <p className="font-extrabold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <CheckCircle2 className="w-4 h-4" />
          Raw Marks Statement (No Calculated Percentages or Grades)
        </p>
        <p className="text-[11px] text-slate-500">
          Displaying exact raw marks obtained subject-wise and examination-wise directly from evaluator entries. Examination columns appear when exams are taken and granted clearance by the Admission Panel.
        </p>
      </div>

      {/* Raw Marks Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3.5 px-4">Subject & Faculty</th>

              {/* UT1 */}
              <th className="py-3.5 px-4 min-w-[140px]">
                <span>Unit Test 1</span>
                <span className="block text-[10px] text-slate-400 font-normal normal-case">Max: 40 Raw Marks</span>
              </th>

              {/* PT2 */}
              <th className="py-3.5 px-4 min-w-[140px]">
                <span>Periodic Test 2</span>
                <span className="block text-[10px] text-slate-400 font-normal normal-case">Max: 40 Raw Marks</span>
              </th>

              {/* Half Yearly */}
              <th className="py-3.5 px-4 min-w-[170px]">
                <div className="flex items-center gap-1">
                  <span>Half-Yearly Exam</span>
                  {!studentPerm.halfYearlyGranted && <Lock className="w-3 h-3 text-rose-500" />}
                </div>
                <span className="block text-[10px] text-slate-400 font-normal normal-case">
                  {studentPerm.halfYearlyGranted ? 'Max: 100 Raw Marks' : 'Admission Panel Clearance Needed'}
                </span>
              </th>

              {/* Annual Exam */}
              <th className="py-3.5 px-4 min-w-[170px]">
                <div className="flex items-center gap-1">
                  <span>Annual Exam</span>
                  {!studentPerm.annualGranted && <Lock className="w-3 h-3 text-rose-500" />}
                </div>
                <span className="block text-[10px] text-slate-400 font-normal normal-case">
                  {studentPerm.annualGranted ? 'Max: 100 Raw Marks' : 'Admission Panel Clearance Needed'}
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-900 dark:text-white">
            {subjectProgressList.map((sub) => (
              <tr key={sub.subjectCode} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                {/* Subject Name */}
                <td className="py-3.5 px-4">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{sub.subjectName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{sub.subjectCode} • {sub.teacherName}</p>
                </td>

                {/* UT1 Raw Marks */}
                <td className="py-3.5 px-4">
                  {sub.exams.ut1.taken ? (
                    <div>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {sub.exams.ut1.totalObtained}
                      </span>
                      <span className="text-slate-400 text-xs"> / {sub.exams.ut1.totalMax}</span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        (Th: {sub.exams.ut1.theoryMarks} | Int: {sub.exams.ut1.internalMarks})
                      </p>
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-[10px] font-bold">
                      Exam Not Taken
                    </span>
                  )}
                </td>

                {/* PT2 Raw Marks */}
                <td className="py-3.5 px-4">
                  {sub.exams.ut2.taken ? (
                    <div>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {sub.exams.ut2.totalObtained}
                      </span>
                      <span className="text-slate-400 text-xs"> / {sub.exams.ut2.totalMax}</span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        (Th: {sub.exams.ut2.theoryMarks} | Int: {sub.exams.ut2.internalMarks})
                      </p>
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-[10px] font-bold">
                      Exam Not Taken
                    </span>
                  )}
                </td>

                {/* Half-Yearly Exam Raw Marks */}
                <td className="py-3.5 px-4">
                  {!studentPerm.halfYearlyGranted ? (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-[10px] font-bold flex items-center gap-1 w-max">
                      <Lock className="w-3 h-3 text-rose-600" /> Permission Pending
                    </span>
                  ) : sub.exams.halfYearly.taken ? (
                    <div>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {sub.exams.halfYearly.totalObtained}
                      </span>
                      <span className="text-slate-400 text-xs"> / {sub.exams.halfYearly.totalMax}</span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        (Th: {sub.exams.halfYearly.theoryMarks} | Int: {sub.exams.halfYearly.internalMarks})
                      </p>
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-[10px] font-bold">
                      Exam Not Taken
                    </span>
                  )}
                </td>

                {/* Annual Exam Raw Marks */}
                <td className="py-3.5 px-4">
                  {!studentPerm.annualGranted ? (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-[10px] font-bold flex items-center gap-1 w-max">
                      <Lock className="w-3 h-3 text-rose-600" /> Permission Pending
                    </span>
                  ) : sub.exams.annual.taken ? (
                    <div>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {sub.exams.annual.totalObtained}
                      </span>
                      <span className="text-slate-400 text-xs"> / {sub.exams.annual.totalMax}</span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        (Th: {sub.exams.annual.theoryMarks} | Int: {sub.exams.annual.internalMarks})
                      </p>
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-[10px] font-bold">
                      Awaiting Exam / Not Taken
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <span>Verified by Examination Cell & Admission Desk</span>
        <span>Raw Marks Entry System • No calculated grades or final percentages</span>
      </div>
    </div>
  );
};
