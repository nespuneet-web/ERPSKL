import React, { useState } from 'react';
import { TeacherTimetableRecord } from './timetableData';
import { RoundDutyRecord } from './index';
import { TimetableArrangement } from '../../types/otherModules';
import {
  Award,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Download,
  Users,
  Clock,
  ShieldCheck,
  TrendingUp,
  Plus,
  Edit3
} from 'lucide-react';

interface TeacherDutyAnalyticsProps {
  teacherTimetables: TeacherTimetableRecord[];
  roundDuties: RoundDutyRecord[];
  arrangements: TimetableArrangement[];
}

export const TeacherDutyAnalytics: React.FC<TeacherDutyAnalyticsProps> = ({
  teacherTimetables,
  roundDuties,
  arrangements
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Compute workload metrics for each teacher
  const teacherStats = teacherTimetables.map((t) => {
    const tableDutiesCount = roundDuties.filter((r) => r.teacherName === t.teacherName).length;
    const substitutionsCount = arrangements.filter((a) => a.substituteTeacherName === t.teacherName).length;
    const totalWorkload = tableDutiesCount + substitutionsCount;

    return {
      id: t.id,
      teacherName: t.teacherName,
      department: t.department || 'Senior Secondary',
      tableDutiesCount,
      substitutionsCount,
      totalWorkload
    };
  });

  // SORT IN DECREASING ORDER (HIGHEST WORKLOAD FIRST)
  const sortedStats = [...teacherStats].sort((a, b) => b.totalWorkload - a.totalWorkload);

  // Filter by search & department
  const filteredStats = sortedStats.filter((t) => {
    const matchesSearch =
      t.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const totalDutiesPerformed = roundDuties.length;
  const totalSubstitutionsTaken = arrangements.length;

  return (
    <div className="space-y-6">
      {/* Banner & High Level Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                Annual Analytics Leaderboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Saved & Decreasing Order
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Teacher Table Duty & Substitution Annual Workload Summary
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Find out how many table duties a teacher performed in the year and how many substitution periods they took. Data is saved and ranked in decreasing order.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Duty Report</span>
          </button>
        </div>

        {/* Total Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase">Annual Table Duties</span>
              <div className="text-2xl font-black text-amber-300">{totalDutiesPerformed}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase">Annual Substitutions Taken</span>
              <div className="text-2xl font-black text-cyan-300">{totalSubstitutionsTaken}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase">Combined Workload</span>
              <div className="text-2xl font-black text-emerald-300">{totalDutiesPerformed + totalSubstitutionsTaken}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="ALL">All Departments</option>
            <option value="Senior Secondary">Senior Secondary</option>
            <option value="Science Dept">Science Dept</option>
            <option value="Commerce Dept">Commerce Dept</option>
            <option value="Primary Dept">Primary Dept</option>
          </select>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          📊 Ranked in <strong>decreasing order</strong> by total duties & substitution classes taken.
        </p>
      </div>

      {/* Analytics Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Department</th>
                <th className="p-4 text-center">Table / Patrol Duties</th>
                <th className="p-4 text-center">Substitutions Taken</th>
                <th className="p-4 text-center">Total Combined Workload</th>
                <th className="p-4 text-right">Status Badge</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No faculty records found.
                  </td>
                </tr>
              ) : (
                filteredStats.map((st, idx) => {
                  const isTop3 = idx < 3;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isTop3 ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center font-black text-sm">
                        {idx === 0 && <span className="text-amber-500">🥇 #1</span>}
                        {idx === 1 && <span className="text-slate-400">🥈 #2</span>}
                        {idx === 2 && <span className="text-amber-700">🥉 #3</span>}
                        {idx > 2 && <span className="text-slate-500">#{idx + 1}</span>}
                      </td>

                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        {st.teacherName}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {st.department}
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-extrabold rounded-lg font-mono text-xs">
                          {st.tableDutiesCount} Duties
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 font-extrabold rounded-lg font-mono text-xs">
                          {st.substitutionsCount} Classes
                        </span>
                      </td>

                      <td className="p-4 text-center font-black text-sm text-indigo-600 dark:text-indigo-400">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                          {st.totalWorkload} Total
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {st.totalWorkload > 5 ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold rounded-full border border-emerald-300">
                            ⭐ Star Contributor
                          </span>
                        ) : st.totalWorkload > 0 ? (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-extrabold rounded-full">
                            Active Faculty
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold rounded-full">
                            Standard Schedule
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
