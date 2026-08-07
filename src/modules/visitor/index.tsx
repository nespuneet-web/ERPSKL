import React from 'react';
import { Shield, Clock, UserCheck } from 'lucide-react';

export const VisitorModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Visitor Gate Pass & Security Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gate visitor registration, instant parent OTP verification, photo capture, and check-out tracking.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Pass No</th>
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Meeting Staff / Student</th>
              <th className="py-3 px-4">Check-In Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {[
              { pass: 'GP-901', name: 'Rajesh Sharma', purpose: 'Parent Teacher Meeting', person: 'Aarav Sharma (10-A)', time: '09:30 AM' },
              { pass: 'GP-902', name: 'Suresh Kumar', purpose: 'Vendor Delivery', person: 'Admin Office', time: '10:15 AM' }
            ].map((v, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{v.pass}</td>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{v.name}</td>
                <td className="py-3 px-4 text-xs">{v.purpose}</td>
                <td className="py-3 px-4 text-xs font-medium">{v.person}</td>
                <td className="py-3 px-4 text-xs font-mono">{v.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
