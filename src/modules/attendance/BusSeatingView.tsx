import React, { useState } from 'react';
import { Bus, Save, AlertTriangle, RefreshCw, ArrowRight, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Student } from '../../types/sis';
import { TransportRoute } from '../../types/otherModules';

interface BusSeatingViewProps {
  routes: TransportRoute[];
  students: Student[];
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  busAttendanceState: Record<string, boolean>;
  onToggleBusStudent: (studentId: string) => void;
  onSaveBusAttendance: () => void;
}

export const BusSeatingView: React.FC<BusSeatingViewProps> = ({
  routes,
  students,
  selectedRouteId,
  setSelectedRouteId,
  busAttendanceState,
  onToggleBusStudent,
  onSaveBusAttendance
}) => {
  const [gridType, setGridType] = useState<'2x2' | '2x3'>('2x2');
  const [maxSeats, setMaxSeats] = useState<number>(36);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [sourceRouteId, setSourceRouteId] = useState(selectedRouteId);
  const [targetRouteId, setTargetRouteId] = useState(routes[1]?.id || routes[0]?.id || '');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<string>('');
  const [transferTargetRouteId, setTransferTargetRouteId] = useState<string>(routes[1]?.id || '');

  // Local route assignments map (studentId -> routeName/no)
  const [routeAssignments, setRouteAssignments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    students.forEach((s, idx) => {
      // Evenly assign to routes if busRouteNo is missing or generic
      const assignedRoute = s.busRouteNo || routes[idx % routes.length]?.routeName || 'Route 4 - Sector 15';
      init[s.id] = assignedRoute;
    });
    return init;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllBuses, setShowAllBuses] = useState(false);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Bus students assigned to transport
  const allTransportStudents = students.filter((s) => s.transportRequired || routeAssignments[s.id]);

  // Filtered by route or showing all
  const filteredBusStudents = allTransportStudents.filter((s) => {
    const matchesRoute = showAllBuses || (
      routeAssignments[s.id] === selectedRoute?.routeName ||
      routeAssignments[s.id]?.includes(selectedRoute?.routeNumber || '') ||
      s.busRouteNo === selectedRoute?.routeName
    );
    const matchesSearch = !searchQuery || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.toString().includes(searchQuery);
    return matchesRoute && matchesSearch;
  });

  // Ensure every bus student has a default Present state
  const busStudents = filteredBusStudents.length > 0 ? filteredBusStudents : allTransportStudents.slice(0, 36);

  // If bus has fewer students than maxSeats, pad or generate seats
  const totalSeats = Math.min(50, Math.max(maxSeats, busStudents.length));

  // Handle bus breakdown merge
  const handleMergeRoutes = () => {
    const src = routes.find((r) => r.id === sourceRouteId);
    const tgt = routes.find((r) => r.id === targetRouteId);
    if (!src || !tgt) return;

    setRouteAssignments((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (next[s.id] === src.routeName || next[s.id]?.includes(src.routeNumber)) {
          next[s.id] = tgt.routeName;
        }
      });
      return next;
    });

    alert(`Emergency Route Reassignment Complete! All children from Bus ${src.routeNumber} (${src.routeName}) have been merged into Bus ${tgt.routeNumber} (${tgt.routeName}).`);
    setShowBreakdownModal(false);
  };

  // Handle individual child transfer
  const handleTransferChild = () => {
    const st = students.find((s) => s.id === selectedStudentForTransfer);
    const tgt = routes.find((r) => r.id === transferTargetRouteId);
    if (!st || !tgt) return;

    setRouteAssignments((prev) => ({
      ...prev,
      [st.id]: tgt.routeName
    }));

    alert(`Transferred ${st.fullName} to Bus Route ${tgt.routeNumber} (${tgt.routeName}) successfully!`);
    setShowTransferModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Visual Transport Layout
            </span>
            <span className="text-xs text-slate-500">• Max 50 Seats Capacity</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Bus className="w-5 h-5 text-amber-500" />
            Bus Seating Attendance Grid (2x2 / 2x3 Layout)
          </h3>
          <p className="text-xs text-slate-500">
            Real-time bus seating arrangement. Each seat corresponds to a fixed child. Tap seat to toggle present/absent status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Emergency Breakdown Button */}
          <button
            onClick={() => setShowBreakdownModal(true)}
            className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Bus Breakdown & Merge Route
          </button>

          {/* Child Transfer Button */}
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-200 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowRight className="w-4 h-4 text-indigo-600" /> Transfer Child
          </button>

          <button
            onClick={onSaveBusAttendance}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Bus Attendance
          </button>
        </div>
      </div>

      {/* Bus Configuration Controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Bus Route View:</label>
            <div className="flex items-center gap-2">
              <select
                disabled={showAllBuses}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white disabled:opacity-50"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Bus #{r.routeNumber}: {r.routeName} ({r.vehicleNumber})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAllBuses(!showAllBuses)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  showAllBuses
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {showAllBuses ? 'Showing ALL Buses' : 'Show ALL Transport Students'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Search Student:</label>
            <input
              type="text"
              placeholder="Search name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white w-44"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Grid Pattern:</label>
            <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 border rounded-lg">
              <button
                type="button"
                onClick={() => setGridType('2x2')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  gridType === '2x2' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                2x2 Grid
              </button>
              <button
                type="button"
                onClick={() => setGridType('2x3')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  gridType === '2x3' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                2x3 Grid
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Bus Seat Capacity:</label>
            <select
              value={maxSeats}
              onChange={(e) => setMaxSeats(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white"
            >
              <option value={12}>12 Seats (Small Van/Car)</option>
              <option value={24}>24 Seats (Medium Mini Bus)</option>
              <option value={36}>36 Seats (Standard Bus)</option>
              <option value={50}>50 Seats (Large School Bus)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-emerald-600">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Boarded (Present - Green)
          </span>
          <span className="flex items-center gap-1 font-bold text-rose-600">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span> Unboarded (Absent - Red)
          </span>
        </div>
      </div>

      {/* REALISTIC BUS GRAPHICAL CONTAINER */}
      <div className="p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border-4 border-amber-400 dark:border-amber-600 shadow-lg max-w-4xl mx-auto space-y-4">
        {/* BUS CAB / FRONT WINDSHIELD */}
        <div className="bg-amber-400 dark:bg-amber-600 p-4 rounded-t-xl text-amber-950 dark:text-white flex items-center justify-between font-black uppercase tracking-wider text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            <span>BUS FRONT • WINDSHIELD</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-amber-900 text-white text-[10px] font-bold">
              DRIVER SEAT 👨‍✈️
            </span>
            <span className="px-2 py-1 rounded bg-amber-200 text-amber-950 text-[10px] font-bold">
              DOOR 🚪
            </span>
          </div>
        </div>

        {/* SEATING GRID WITH CENTRAL AISLE */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          {Array.from({ length: Math.ceil(totalSeats / (gridType === '2x2' ? 4 : 5)) }).map((_, rowIdx) => {
            const seatsInRow = gridType === '2x2' ? 4 : 5;
            const leftCount = 2;
            const rightCount = gridType === '2x2' ? 2 : 3;

            const startSeatNo = rowIdx * seatsInRow + 1;

            return (
              <div key={rowIdx} className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                {/* Left Side Seats */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  {Array.from({ length: leftCount }).map((_, lIdx) => {
                    const seatNum = startSeatNo + lIdx;
                    if (seatNum > totalSeats) return <div key={lIdx} className="w-28 h-16"></div>;

                    const student = busStudents[seatNum - 1];
                    const isPresent = student ? (busAttendanceState[student.id] ?? true) : false;

                    return (
                      <div
                        key={seatNum}
                        onClick={() => student && onToggleBusStudent(student.id)}
                        className={`w-28 h-16 p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          !student
                            ? 'bg-slate-50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700 opacity-40'
                            : isPresent
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">Seat #{seatNum}</span>
                          {student && (
                            <span className={isPresent ? 'text-emerald-600' : 'text-rose-600'}>
                              {isPresent ? 'P' : 'A'}
                            </span>
                          )}
                        </div>

                        {student ? (
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                              {student.fullName}
                            </p>
                            <p className="text-[9px] text-slate-500">Roll #{student.rollNo} • {student.section}</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-medium italic text-center">Unassigned</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CENTRAL AISLE */}
                <div className="w-12 bg-slate-100 dark:bg-slate-800 rounded py-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                  AISLE
                </div>

                {/* Right Side Seats */}
                <div className="flex items-center gap-2 flex-1 justify-start">
                  {Array.from({ length: rightCount }).map((_, rIdx) => {
                    const seatNum = startSeatNo + leftCount + rIdx;
                    if (seatNum > totalSeats) return <div key={rIdx} className="w-28 h-16"></div>;

                    const student = busStudents[seatNum - 1];
                    const isPresent = student ? (busAttendanceState[student.id] ?? true) : false;

                    return (
                      <div
                        key={seatNum}
                        onClick={() => student && onToggleBusStudent(student.id)}
                        className={`w-28 h-16 p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          !student
                            ? 'bg-slate-50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700 opacity-40'
                            : isPresent
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">Seat #{seatNum}</span>
                          {student && (
                            <span className={isPresent ? 'text-emerald-600' : 'text-rose-600'}>
                              {isPresent ? 'P' : 'A'}
                            </span>
                          )}
                        </div>

                        {student ? (
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                              {student.fullName}
                            </p>
                            <p className="text-[9px] text-slate-500">Roll #{student.rollNo} • {student.section}</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-medium italic text-center">Unassigned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* BUS BACK END */}
        <div className="bg-slate-300 dark:bg-slate-800 p-2 rounded-b-xl text-center text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          BUS REAR ENGINE & EMERGENCY EXIT 🚨
        </div>
      </div>

      {/* MODAL 1: BUS BREAKDOWN & MERGE ROUTE */}
      {showBreakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Emergency Bus Breakdown & Route Merge
            </h3>
            <p className="text-xs text-slate-500">
              If a school bus breaks down, instantly merge all its assigned children into another active bus route.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-rose-600 mb-1">Broken Down Bus Route:</label>
                <select
                  value={sourceRouteId}
                  onChange={(e) => setSourceRouteId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      Bus #{r.routeNumber}: {r.routeName} ({r.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-600 mb-1">Target Bus Route to Receive Children:</label>
                <select
                  value={targetRouteId}
                  onChange={(e) => setTargetRouteId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      Bus #{r.routeNumber}: {r.routeName} ({r.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeRoutes}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow"
              >
                Confirm Route Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER INDIVIDUAL CHILD */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-indigo-600" />
              Transfer Child to Another Bus Route
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Child:</label>
                <select
                  value={selectedStudentForTransfer}
                  onChange={(e) => setSelectedStudentForTransfer(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">Select Student...</option>
                  {students.filter((s) => s.transportRequired).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass}-{s.section}, Roll #{s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-600 mb-1">New Destination Bus Route:</label>
                <select
                  value={transferTargetRouteId}
                  onChange={(e) => setTransferTargetRouteId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      Bus #{r.routeNumber}: {r.routeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferChild}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
              >
                Transfer Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
