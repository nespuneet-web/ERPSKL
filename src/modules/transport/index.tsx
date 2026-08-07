import React from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Bus, MapPin, Phone, Users } from 'lucide-react';

export const TransportModule: React.FC = () => {
  const { routes } = useOtherModulesStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bus className="w-6 h-6 text-amber-500" />
            Transport & Route Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            School bus routes, driver emergency contacts, stop allocation, and seat capacity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((rt) => (
          <div key={rt.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {rt.routeNumber}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">{rt.routeName}</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">{rt.vehicleNumber}</span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p><strong>Driver:</strong> {rt.driverName} ({rt.driverPhone})</p>
              <p><strong>Capacity Occupancy:</strong> {rt.allocatedStudents} / {rt.totalCapacity} Seats</p>
            </div>

            <div className="space-y-2 border-t pt-3 border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase">Stops & Fees</p>
              {rt.stops.map((stp, i) => (
                <div key={i} className="flex justify-between text-xs p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span>{stp.stopName} ({stp.pickupTime})</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{stp.fee} / Mo</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
