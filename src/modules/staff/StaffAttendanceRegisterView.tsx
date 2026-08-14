import React, { useState } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Filter,
  CheckSquare,
  Sparkles,
  Building2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { DEPARTMENTS } from './index';
import { StaffMember } from '../../types/otherModules';

interface StaffAttendanceRegisterViewProps {
  onStatusChanged?: (staffMember: StaffMember, status: string) => void;
}

export const StaffAttendanceRegisterView: React.FC<StaffAttendanceRegisterViewProps> = ({ onStatusChanged }) => {
  const { staff, updateStaffStatus } = useOtherModulesStore();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Absent' | 'On Leave' | 'Half Day'>('All');
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Filtered staff list
  const filteredStaff = staff.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.employeeCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q);

    const matchesDept = selectedDepartment === 'All' || s.department === selectedDepartment;

    const currentStatus = s.status || 'Active';
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && (currentStatus === 'Active' || currentStatus === 'Present' as any)) ||
      currentStatus === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate Metrics
  const totalStaffCount = staff.length;
  const presentCount = staff.filter((s) => (s.status || 'Active') === 'Active' || (s.status as any) === 'Present').length;
  const absentCount = staff.filter((s) => s.status === 'Absent').length;
  const onLeaveCount = staff.filter((s) => s.status === 'On Leave').length;
  const halfDayCount = staff.filter((s) => s.status === 'Half Day').length;
  const attendanceRate = totalStaffCount > 0 ? Math.round((presentCount / totalStaffCount) * 100) : 0;

  const handleStatusUpdate = async (
    stf: StaffMember,
    newStatus: 'Active' | 'Absent' | 'On Leave' | 'Half Day'
  ) => {
    await updateStaffStatus(stf.id, newStatus);
    if (onStatusChanged) {
      onStatusChanged(stf, newStatus);
    }
    const label = newStatus === 'Active' ? 'Present' : newStatus;
    setNotificationMsg(`🟢 Updated ${stf.fullName} (${stf.employeeCode}) to "${label}" on ${selectedDate}`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleMarkAllPresent = async () => {
    for (const stf of filteredStaff) {
      await updateStaffStatus(stf.id, 'Active');
    }
    setNotificationMsg(`⚡ Marked ${filteredStaff.length} faculty members as Present for ${selectedDate}`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleMarkAllAbsent = async () => {
    if (confirm(`Are you sure you want to mark all ${filteredStaff.length} selected teachers as Absent?`)) {
      for (const stf of filteredStaff) {
        await updateStaffStatus(stf.id, 'Absent');
      }
      setNotificationMsg(`🔴 Marked ${filteredStaff.length} faculty members as Absent for ${selectedDate}`);
      setTimeout(() => setNotificationMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Biometric & Manual Attendance Register
            </span>
            <span className="text-xs font-bold text-slate-400">• Real-time DB Sync</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Faculty & Staff Daily Attendance Register
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mark individual or batch faculty attendance. Status updates instantly sync across the Staff Directory, Master Timetable Substitution panel, and Supabase database.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-1" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer pr-1"
          />
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-xs text-emerald-600 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Total Faculty</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalStaffCount}</p>
          <span className="text-[10px] text-slate-500">Registered staff</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Present Today</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}</p>
          <span className="text-[10px] text-emerald-600/80 font-bold">{attendanceRate}% Present rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-wider">Absent Today</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{absentCount}</p>
          <span className="text-[10px] text-rose-600/80 font-bold">Requires substitute</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase text-amber-700 dark:text-amber-400 tracking-wider">On Leave</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{onLeaveCount}</p>
          <span className="text-[10px] text-amber-600/80 font-bold">Approved leaves</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">Half Day</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{halfDayCount}</p>
          <span className="text-[10px] text-indigo-600/80 font-bold">Partial shift</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 shadow-xs flex flex-col justify-between">
          <p className="text-[11px] font-extrabold uppercase text-blue-700 dark:text-blue-400 tracking-wider">Attendance %</p>
          <div className="w-full bg-blue-200 dark:bg-blue-900/60 h-2 rounded-full overflow-hidden my-1">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
            />
          </div>
          <span className="text-sm font-black text-blue-800 dark:text-blue-300">{attendanceRate}% On Duty</span>
        </div>
      </div>

      {/* FILTER & BATCH ACTION TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by teacher name, code (e.g. PAR01, EMP-001), designation, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          {/* DEPARTMENT FILTER */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="All">All Academic Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['All', 'Active', 'Absent', 'On Leave', 'Half Day'] as const).map((st) => {
              const label = st === 'Active' ? 'Present' : st;
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* BATCH ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark All Present
            </button>
            <button
              onClick={handleMarkAllAbsent}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 active:scale-98"
            >
              <XCircle className="w-3.5 h-3.5" />
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* ATTENDANCE REGISTER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className="p-3.5">Faculty Member & Code</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Quick 1-Click Action</th>
                <th className="p-3.5">Attendance Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No faculty members found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((stf, idx) => {
                  const currentStatus = stf.status || 'Active';
                  const isPresent = currentStatus === 'Active' || (currentStatus as any) === 'Present';
                  const isAbsent = currentStatus === 'Absent';
                  const isLeave = currentStatus === 'On Leave';
                  const isHalfDay = currentStatus === 'Half Day';

                  return (
                    <tr
                      key={`${stf.id}-${idx}`}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        isAbsent ? 'bg-rose-50/30 dark:bg-rose-950/10' : isLeave ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* TEACHER INFO */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full font-black flex items-center justify-center text-xs shrink-0 ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : isAbsent
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : isLeave
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {stf.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block">
                              {stf.fullName}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {stf.employeeCode} • {stf.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 inline-block">
                          {stf.department}
                        </span>
                      </td>

                      {/* CURRENT STATUS BADGE */}
                      <td className="p-3.5">
                        {isPresent ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            🟢 Present / Active
                          </span>
                        ) : isAbsent ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            🔴 Absent Today
                          </span>
                        ) : isLeave ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            🟡 On Leave
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            ⏱️ Half Day
                          </span>
                        )}
                      </td>

                      {/* 1-CLICK TOGGLE BUTTONS */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStatusUpdate(stf, 'Active')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>

                          <button
                            onClick={() => handleStatusUpdate(stf, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            onClick={() => handleStatusUpdate(stf, 'On Leave')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                              isLeave
                                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            Leave
                          </button>

                          <button
                            onClick={() => handleStatusUpdate(stf, 'Half Day')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                              isHalfDay
                                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            Half Day
                          </button>
                        </div>
                      </td>

                      {/* REMARKS / NOTES */}
                      <td className="p-3.5">
                        <input
                          type="text"
                          placeholder={isAbsent ? 'Absence reason (e.g. medical, emergency)' : 'Optional attendance remarks...'}
                          value={remarksMap[stf.id] || ''}
                          onChange={(e) => setRemarksMap((prev) => ({ ...prev, [stf.id]: e.target.value }))}
                          className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                        />
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
