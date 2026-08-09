import React, { useState } from 'react';
import { Student } from '../../types/sis';
import { AcademicProgressView } from './AcademicProgressView';
import { User, Calendar, BookOpen, FileCheck, DollarSign, Bell, Award, Download, CheckCircle2, ShieldCheck, Printer, Ticket } from 'lucide-react';

export const StudentPortalView: React.FC<{ student: Student }> = ({ student }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'report_card' | 'admit_card'>('overview');

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/30 rounded-full text-xs font-bold text-blue-200">
            Student Portal • Session 2025-2026
          </span>
          <h1 className="text-2xl font-black mt-2">Welcome back, {student.fullName}!</h1>
          <p className="text-sm text-blue-200 mt-1 font-medium">
            {student.currentClass} - Section {student.section} | Roll No: {student.rollNo} | House: {student.house} | PEN: {student.penNo}
          </p>
        </div>

        <img
          src={student.photoUrl}
          alt={student.fullName}
          className="w-16 h-16 rounded-full border-2 border-blue-400/50 object-cover hidden sm:block shadow-md"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Dashboard & Homework', icon: BookOpen },
          { id: 'attendance', label: 'Attendance Log', icon: Calendar },
          { id: 'report_card', label: 'Academic Progress', icon: Award },
          { id: 'admit_card', label: 'Exam Permit & Admit Card', icon: Ticket }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-400">Attendance</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">96.4%</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-xs text-slate-400">Enrolled Subjects</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">5 Core</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-xs text-slate-400">Fee Status</p>
                <p className="text-lg font-bold text-emerald-600">Up to Date</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-xs text-slate-400">Latest Term Rank</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">#1 in Section</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Active Homework & Assignments
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">Mathematics: Quadratic Equations Ex 4.2</p>
                  <p className="text-xs text-slate-500 mt-0.5">Due: Tomorrow at 8:00 AM • Mr. Rajesh Namboodiri</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">Science: Ray Optics Lab Practical File</p>
                  <p className="text-xs text-slate-500 mt-0.5">Due: Friday • Dr. Priya Nambiar</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> School Circulars & Notices
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/40 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">Annual Term Examination Date Sheet Released</p>
                  <p className="text-xs text-slate-500 mt-0.5">Download Admit Card permit ticket from the tab above.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE HISTORY */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Attendance Tracker</h3>
              <p className="text-xs text-slate-500">24 / 25 Days Attended (96.4% Overall Attendance)</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold">
              Regular Attendance Status
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { date: '2026-03-15', status: 'Present', source: 'Bus Guardian', statusColor: 'Green' },
              { date: '2026-03-14', status: 'Present', source: 'Gate Duty', statusColor: 'Green' },
              { date: '2026-03-13', status: 'Present', source: 'Class Teacher', statusColor: 'Yellow' },
              { date: '2026-03-12', status: 'Present', source: 'Bus Guardian', statusColor: 'Green' }
            ].map((a, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{a.date}</p>
                  <p className="text-slate-500 text-[11px]">Verified via {a.source}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {a.status} ({a.statusColor})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC PROGRESS */}
      {activeTab === 'report_card' && (
        <AcademicProgressView student={student} />
      )}

      {/* TAB 4: ADMIT CARD & EXAM PERMIT */}
      {activeTab === 'admit_card' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  Examination Allowance Status: <span className="text-emerald-600">PERMITTED</span>
                </p>
                <p className="text-xs text-slate-500">
                  All library & accounts fee clearances verified. Hall ticket permitted for Annual Exams 2026.
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

          {/* Admit Card Digital Ticket */}
          <div className="p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4">
            <div className="flex justify-between items-start border-b pb-4 border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-lg">ANNUAL EXAMINATION ADMIT CARD - 2026</h4>
                <p className="text-xs text-slate-500">ABC School ERP • Academic Session 2025-2026</p>
              </div>
              <span className="px-3 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 text-xs font-bold">
                Center: Main Block Hall A
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
              <div>
                <span className="text-slate-400 block text-[10px]">Candidate Name</span>
                <strong className="text-slate-900 dark:text-white">{student.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Class & Section</span>
                <strong className="text-slate-900 dark:text-white">{student.currentClass} - {student.section}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Roll Number</span>
                <strong className="text-blue-600 font-bold">{student.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PEN Number</span>
                <strong className="text-slate-900 dark:text-white font-mono">{student.penNo}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

