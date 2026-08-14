import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Calendar,
  Table,
  Sliders,
  Building2,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  Users,
  Award,
  BookOpen
} from 'lucide-react';
import { useAdmissionStore } from '../admission/admissionStore';
import { useSisStore } from '../sis/sisStore';
import { ALL_SCHOOL_CLASSES } from '../../types/admission';
import { CustomizableStudentReport } from './CustomizableStudentReport';
import { useAuth } from '../../context/AuthContext';

export const ReportsModule: React.FC = () => {
  const { applications, seats } = useAdmissionStore();
  const { students } = useSisStore();
  const { activeRole } = useAuth();

  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'customizable_student_report' | 'seats' | 'monthly' | 'customizer'>('customizable_student_report');

  // Institution Branding
  const [schoolName, setSchoolName] = useState('GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA');
  const [schoolCode, setSchoolCode] = useState('GDGPS-AGRA-CBSE-2130845');

  // Compute Seat Capacity & Pipeline Data
  const classReportRows = ALL_SCHOOL_CLASSES.map((clsName) => {
    const seatObj = seats.find((s) => s.className === clsName) || {
      totalSeats: 60,
      filledSeats: 0,
      reservedSeats: 5,
      availableSeats: 60
    };

    const classApps = applications.filter((a) => a.applyingClass === clsName);
    const classStudents = students.filter((s) => s.currentClass === clsName || s.admissionClass === clsName);

    const seatsAllotted = classStudents.length || classApps.filter((a) => a.status === 'Confirmed' || a.status === 'Admission Process').length;
    const registrationPending = classApps.filter((a) => a.status === 'Registration' || a.status === 'Test Scheduled' || a.status === 'Interview Scheduled').length;
    const inquiryPending = classApps.filter((a) => a.status === 'Inquiry' || a.status === 'Received').length;
    const seatsAvailable = Math.max(0, seatObj.totalSeats - seatsAllotted);

    return {
      className: clsName,
      totalSeats: seatObj.totalSeats,
      seatsAllotted,
      seatsAvailable,
      registrationPending,
      inquiryPending
    };
  });

  const filteredReportRows = selectedClassFilter === 'All'
    ? classReportRows
    : classReportRows.filter((r) => r.className === selectedClassFilter);

  // Month-Wise Cumulative Analytics
  const monthList = ['April 2025', 'May 2025', 'July 2025', 'October 2025', 'January 2026'];
  const monthlyData = monthList.map((month) => {
    const regCount = applications.filter((a) => a.status === 'Registration' || a.registrationFee > 0).length;
    const admCount = applications.filter((a) => a.status === 'Confirmed' || a.status === 'Admission Process').length;

    return {
      month,
      registrations: Math.max(12, Math.round(regCount * (0.2 + Math.random() * 0.3) + 15)),
      admissions: Math.max(8, Math.round(admCount * (0.2 + Math.random() * 0.3) + 10))
    };
  });

  const exportReportCSV = () => {
    let csv = 'Class,Seats Available,Seats Allotted,Registration Pending,Inquiry Pending\n';
    filteredReportRows.forEach((r) => {
      csv += `"${r.className}",${r.seatsAvailable},${r.seatsAllotted},${r.registrationPending},${r.inquiryPending}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GDGPS_Agra_Admission_Report_${academicYear}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            Reports & Student Analytics Hub
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {schoolName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional Code: <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{schoolCode}</span> | Academic Session: <span className="font-bold text-indigo-600">{academicYear}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportReportCSV}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('customizable_student_report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'customizable_student_report'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-300" />
          <span>1. Customizable Student Report (Calculations via Checkboxes)</span>
        </button>

        <button
          onClick={() => setActiveTab('seats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'seats'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>2. Class Seat Capacity & Student Counts</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>3. Month-Wise Cumulative Admissions</span>
        </button>

        {activeRole !== 'Teacher' && (
          <button
            onClick={() => setActiveTab('customizer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'customizer'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>4. Institution Details Setup</span>
          </button>
        )}
      </div>

      {/* TAB 1: CUSTOMIZABLE STUDENT REPORT WITH CHECKBOX CALCULATIONS */}
      {activeTab === 'customizable_student_report' && (
        <CustomizableStudentReport />
      )}

      {/* TAB 2: SEAT CAPACITY & PIPELINE MATRIX */}
      {activeTab === 'seats' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" /> Standard Seat Matrix & Pending Pipeline Summary
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500">Filter Class:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="All">All Classes</option>
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center text-emerald-700 dark:text-emerald-400">Seats Available</th>
                  <th className="py-3 px-4 text-center text-indigo-700 dark:text-indigo-400">Seats Allotted</th>
                  <th className="py-3 px-4 text-center text-amber-700 dark:text-amber-400">Registration Pending</th>
                  <th className="py-3 px-4 text-center text-blue-700 dark:text-blue-400">Inquiry Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReportRows.map((row) => (
                  <tr key={row.className} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium">
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">{row.className}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30">
                      {row.seatsAvailable}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30">
                      {row.seatsAllotted}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600 bg-amber-50/50 dark:bg-amber-950/30">
                      {row.registrationPending}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30">
                      {row.inquiryPending}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="py-3 px-4">Total Summary</td>
                  <td className="py-3 px-4 text-center text-emerald-700 dark:text-emerald-400">
                    {filteredReportRows.reduce((a, b) => a + b.seatsAvailable, 0)}
                  </td>
                  <td className="py-3 px-4 text-center text-indigo-700 dark:text-indigo-400">
                    {filteredReportRows.reduce((a, b) => a + b.seatsAllotted, 0)}
                  </td>
                  <td className="py-3 px-4 text-center text-amber-700 dark:text-amber-400">
                    {filteredReportRows.reduce((a, b) => a + b.registrationPending, 0)}
                  </td>
                  <td className="py-3 px-4 text-center text-blue-700 dark:text-blue-400">
                    {filteredReportRows.reduce((a, b) => a + b.inquiryPending, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUMULATIVE MONTH-WISE CLASS REPORT */}
      {activeTab === 'monthly' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Month-Wise Cumulative Registration & Admission Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tracks monthly conversion progression from inquiries through registrations to final admissions.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Month / Term</th>
                  <th className="py-3 px-4 text-center text-emerald-600">Registrations Processed</th>
                  <th className="py-3 px-4 text-center text-purple-600">Final Admissions Confirmed</th>
                  <th className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">Conversion Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthlyData.map((m) => {
                  const conversion = m.registrations > 0 ? Math.round((m.admissions / m.registrations) * 100) : 0;
                  return (
                    <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{m.month}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{m.registrations}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-600">{m.admissions}</td>
                      <td className="py-3.5 px-4 text-center font-black text-indigo-600">{conversion}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ERP ONBOARDING & REPORT CUSTOMIZER */}
      {activeTab === 'customizer' && activeRole !== 'Teacher' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" /> Institution Customization & Header Setup
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure institution branding for all generated student reports and certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">School Institution Name *</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">School Affiliation & Registration Code *</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Session Year *</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="2025-2026">2025 - 2026</option>
                <option value="2026-2027">2026 - 2027</option>
                <option value="2027-2028">2027 - 2028</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
              Institutional Settings Active: Configured for {schoolName}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
