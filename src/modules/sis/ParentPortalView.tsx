import React, { useState } from 'react';
import { Student } from '../../types/sis';
import { AcademicProgressView } from './AcademicProgressView';
import { Users, Calendar, Award, FileText, PhoneCall, ShieldCheck, Download, CheckCircle2, Ticket, Printer } from 'lucide-react';

export const ParentPortalView: React.FC<{ students: Student[] }> = ({ students }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'report_card' | 'admit_card'>('overview');

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  if (!activeStudent) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full text-xs font-bold">
            Parent Portal • Academic Session 2025-2026
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mt-2">
            Guardian Overview: {activeStudent.parents.fatherName || 'Parent'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track academic progress, daily attendance, exam weightages, and admit card status for your ward.
          </p>
        </div>

        {/* Student Selector for Parents with multiple children */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Select Ward:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.currentClass} - {s.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <img src={activeStudent.photoUrl} alt={activeStudent.fullName} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{activeStudent.fullName}</h3>
              <p className="text-xs text-slate-500">{activeStudent.currentClass} - {activeStudent.section} (Roll: {activeStudent.rollNo})</p>
              <p className="text-xs text-blue-600 font-mono mt-1 font-bold">PEN: {activeStudent.penNo}</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <Calendar className="w-10 h-10 text-emerald-500" />
          <div>
            <p className="text-xs text-slate-400 font-bold">Monthly Attendance</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">96.4%</p>
            <p className="text-xs text-emerald-600 font-bold">24/25 Days Attended</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <Award className="w-10 h-10 text-amber-500" />
          <div>
            <p className="text-xs text-slate-400 font-bold">Term Performance</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">A1 Grade</p>
            <p className="text-xs text-slate-500">Percentage: 92.25%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Ward Dashboard
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Attendance History
        </button>
        <button
          onClick={() => setActiveTab('report_card')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'report_card' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Academic Progress
        </button>
        <button
          onClick={() => setActiveTab('admit_card')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'admit_card' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Admit Card Permit
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Daily Attendance Logs</h3>
          <div className="space-y-2 text-xs">
            {[
              { date: '2026-03-15', status: 'Present', verifiedBy: 'Bus Guardian' },
              { date: '2026-03-14', status: 'Present', verifiedBy: 'Gate Arrival' },
              { date: '2026-03-13', status: 'Present', verifiedBy: 'Class Teacher' }
            ].map((log, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{log.date}</p>
                  <p className="text-slate-500 text-[11px]">Verified by {log.verifiedBy}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {log.status} (Verified)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'report_card' && (
        <AcademicProgressView student={activeStudent} />
      )}

      {activeTab === 'admit_card' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  Examination Allowance Status: <span className="text-emerald-600">PERMITTED</span>
                </p>
                <p className="text-xs text-slate-500">
                  Fee dues cleared. Hall ticket permitted for Annual Exams 2026.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Printing Official Examination Admit Card Slip...')}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" /> Print Roll No / Hall Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

