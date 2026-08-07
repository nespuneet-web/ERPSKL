import React from 'react';
import { BarChart3, TrendingUp, Download, PieChart, FileSpreadsheet } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Executive Reports & Decision Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate single-click PDF & Excel reports across Fees, SIS, Exams, Transport, and HR.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Fee Collection Summary Report', desc: 'Daily, Monthly, and Annual revenue breakdown by class & payment mode.' },
          { title: 'Student Demographics & PEN Audit', desc: 'State-wise PEN, APAAR, Aadhaar verification coverage reports.' },
          { title: 'Academic Performance & Pass %', desc: 'Subject-wise class average, toppers list, and fail risk predictions.' },
          { title: 'Attendance & Absenteeism Log', desc: 'Student absenteeism alerts and monthly attendance logs.' },
          { title: 'HR & Payroll Ledger Report', desc: 'Staff salary disbursements, EPF deductions, and tax compliance.' },
          { title: 'Transport Capacity Utilization', desc: 'Route occupancy %, seat shortages, and driver logs.' }
        ].map((item, idx) => (
          <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => alert('Exporting Excel...')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
