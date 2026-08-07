import React from 'react';
import { Home, Users } from 'lucide-react';

export const HostelModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Hostel & Dormitory Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hostel blocks, room allocations, mess menu, warden logs, and boarder attendance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { block: 'Tagore Block (Boys)', rooms: '40 Rooms', occupied: '75 / 80 Beds', warden: 'Mr. Ramesh Kumar' },
          { block: 'Sarojini Block (Girls)', rooms: '40 Rooms', occupied: '68 / 80 Beds', warden: 'Mrs. Anita Sharma' }
        ].map((h, i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{h.block}</h3>
            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p><strong>Capacity:</strong> {h.occupied}</p>
              <p><strong>Total Rooms:</strong> {h.rooms}</p>
              <p><strong>Chief Warden:</strong> {h.warden}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
