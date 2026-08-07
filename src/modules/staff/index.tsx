import React from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Users, Briefcase, Award } from 'lucide-react';

export const StaffModule: React.FC = () => {
  const { staff } = useOtherModulesStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Staff & Faculty Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Teacher directory, employee codes, designations, qualifications, and payroll overview.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Employee Code</th>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Designation & Dept</th>
              <th className="py-3 px-4">Qualification</th>
              <th className="py-3 px-4">Monthly Salary</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {staff.map((stf) => (
              <tr key={stf.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{stf.employeeCode}</td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{stf.fullName}</p>
                  <p className="text-xs text-slate-500">{stf.email} | {stf.phone}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{stf.designation}</p>
                  <p className="text-xs text-slate-400">{stf.department}</p>
                </td>
                <td className="py-3 px-4 text-xs">{stf.qualification}</td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{stf.monthlySalary.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {stf.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
