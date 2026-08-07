import React from 'react';
import { Student } from '../../types/sis';
import { Award, TrendingUp, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export const ExamAnalyticsView: React.FC<{ students: Student[] }> = ({ students }) => {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <Award className="w-10 h-10 text-amber-500" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Class Topper Score</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">96.4%</p>
            <p className="text-xs text-slate-500">Aarav Sharma (Class 10-A)</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <TrendingUp className="w-10 h-10 text-emerald-500" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Overall Pass Rate</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">98.2%</p>
            <p className="text-xs text-emerald-600 font-medium">+2.1% from previous term</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <Users className="w-10 h-10 text-indigo-500" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Evaluated Students</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{students.length}</p>
            <p className="text-xs text-slate-500">Class 10 Batch</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <CheckCircle className="w-10 h-10 text-purple-500" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Distinction Rate (A1)</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">42.5%</p>
            <p className="text-xs text-purple-600 font-medium">High Performers</p>
          </div>
        </div>
      </div>

      {/* Class Topper Merit List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Class 10 Official Merit List & Toppers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">House Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    🏆 Rank #1
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Aarav Sharma</td>
                <td className="py-3 px-4">Class 10-A</td>
                <td className="py-3 px-4 font-bold">367 / 400</td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">91.75%</td>
                <td className="py-3 px-4 text-xs font-medium">Red House #1</td>
              </tr>

              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    🥈 Rank #2
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Ananya Verma</td>
                <td className="py-3 px-4">Class 10-A</td>
                <td className="py-3 px-4 font-bold">358 / 400</td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">89.50%</td>
                <td className="py-3 px-4 text-xs font-medium">Blue House #1</td>
              </tr>

              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    🥉 Rank #3
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Rohan Patel</td>
                <td className="py-3 px-4">Class 10-B</td>
                <td className="py-3 px-4 font-bold">342 / 400</td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">85.50%</td>
                <td className="py-3 px-4 text-xs font-medium">Green House #1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
