import React, { useState } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { useSisStore } from '../sis/sisStore';
import { Calendar, CheckCircle2, XCircle, Clock, Bus, ShieldCheck, UserCheck, Save, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { BusSeatingView } from './BusSeatingView';
import { GateScanView } from './GateScanView';

export const AttendanceModule: React.FC = () => {
  const { attendance, markAttendance, routes } = useOtherModulesStore();
  const { students } = useSisStore();

  const [activeMode, setActiveMode] = useState<'classroom' | 'bus_guardian' | 'gate_entry'>('classroom');
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || 'rt-1');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter students for selected class
  const classStudents = students.filter(
    (s) => `${s.currentClass}-${s.section}` === selectedClass || selectedClass === 'All'
  );

  // Local state for classroom grid checkboxes (studentId -> isPresent)
  const [classGridState, setClassGridState] = useState<Record<string, { present: boolean; status: 'Present' | 'Absent' | 'Late'; verifiedSource?: 'Bus' | 'Gate' | 'Manual' }>>(() => {
    const init: Record<string, { present: boolean; status: 'Present' | 'Absent' | 'Late'; verifiedSource?: 'Bus' | 'Gate' | 'Manual' }> = {};
    students.forEach((s) => {
      // Find existing record or default to Present
      const existing = attendance.find((a) => a.studentId === s.id && a.date === attendanceDate);
      if (existing) {
        init[s.id] = {
          present: existing.status === 'Present' || existing.status === 'Late',
          status: existing.status as any,
          verifiedSource: existing.verificationSource || 'Manual'
        };
      } else {
        // Default: Initially all students are marked as Present
        init[s.id] = {
          present: true,
          status: 'Present',
          verifiedSource: s.transportRequired ? 'Bus' : 'Gate'
        };
      }
    });
    return init;
  });

  // Local state for Bus Guardian marking
  const [busAttendanceState, setBusAttendanceState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    students.filter((s) => s.transportRequired).forEach((s) => {
      init[s.id] = true; // Default all bus students present
    });
    return init;
  });

  // Local state for Gate Entry marking
  const [gateAttendanceState, setGateAttendanceState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    students.filter((s) => !s.transportRequired).forEach((s) => {
      init[s.id] = true; // Default all self-transport students present
    });
    return init;
  });

  const handleToggleClassStudent = (studentId: string) => {
    setClassGridState((prev) => {
      const current = prev[studentId] || { present: true, status: 'Present' };
      const nextPresent = !current.present;
      return {
        ...prev,
        [studentId]: {
          ...current,
          present: nextPresent,
          status: nextPresent ? 'Present' : 'Absent'
        }
      };
    });
  };

  const handleToggleBusStudent = (studentId: string) => {
    setBusAttendanceState((prev) => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleToggleGateStudent = (studentId: string) => {
    setGateAttendanceState((prev) => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveClassroomAttendance = () => {
    const newRecords = classStudents.map((s) => {
      const state = classGridState[s.id] || { present: true, status: 'Present' };
      const isVerifiedGreen = state.present && (state.verifiedSource === 'Bus' || state.verifiedSource === 'Gate');
      
      return {
        id: `att-${s.id}-${attendanceDate}`,
        studentId: s.id,
        studentName: s.fullName,
        classSection: `${s.currentClass}-${s.section}`,
        rollNo: s.rollNo,
        date: attendanceDate,
        status: state.present ? state.status : 'Absent',
        verificationSource: state.verifiedSource || 'Manual',
        verificationStatus: !state.present ? 'Red' : isVerifiedGreen ? 'Green' : 'Yellow',
        remarks: state.present ? 'Marked by Class Teacher' : 'Unchecked - Absent'
      };
    });

    markAttendance(newRecords as any);
    alert('Classroom attendance saved and synced successfully!');
  };

  const handleSaveBusGuardianAttendance = () => {
    const busStudents = students.filter((s) => s.transportRequired);
    const updatedClassGrid = { ...classGridState };

    const records = busStudents.map((s) => {
      const isPresentInBus = busAttendanceState[s.id] ?? true;
      updatedClassGrid[s.id] = {
        present: isPresentInBus,
        status: isPresentInBus ? 'Present' : 'Absent',
        verifiedSource: 'Bus'
      };

      return {
        id: `att-${s.id}-${attendanceDate}`,
        studentId: s.id,
        studentName: s.fullName,
        classSection: `${s.currentClass}-${s.section}`,
        rollNo: s.rollNo,
        date: attendanceDate,
        status: isPresentInBus ? 'Present' : 'Absent',
        verificationSource: 'Bus',
        verificationStatus: isPresentInBus ? 'Green' : 'Red',
        remarks: isPresentInBus ? 'Verified via Bus Guardian' : 'Absent on Bus'
      };
    });

    setClassGridState(updatedClassGrid);
    markAttendance(records as any);
    alert('Bus Guardian attendance saved! Classroom teacher view automatically updated to Green for verified students.');
  };

  const handleSaveGateEntryAttendance = () => {
    const selfStudents = students.filter((s) => !s.transportRequired);
    const updatedClassGrid = { ...classGridState };

    const records = selfStudents.map((s) => {
      const isPresentAtGate = gateAttendanceState[s.id] ?? true;
      updatedClassGrid[s.id] = {
        present: isPresentAtGate,
        status: isPresentAtGate ? 'Present' : 'Absent',
        verifiedSource: 'Gate'
      };

      return {
        id: `att-${s.id}-${attendanceDate}`,
        studentId: s.id,
        studentName: s.fullName,
        classSection: `${s.currentClass}-${s.section}`,
        rollNo: s.rollNo,
        date: attendanceDate,
        status: isPresentAtGate ? 'Present' : 'Absent',
        verificationSource: 'Gate',
        verificationStatus: isPresentAtGate ? 'Green' : 'Red',
        remarks: isPresentAtGate ? 'Verified via Gate Duty' : 'Absent at Gate'
      };
    });

    setClassGridState(updatedClassGrid);
    markAttendance(records as any);
    alert('Gate Entry attendance saved! Class teacher view synced to Green for verified arrivals.');
  };

  // Strength metrics calculation for selected class
  const totalClassStrength = classStudents.length;
  const presentCount = classStudents.filter((s) => classGridState[s.id]?.present ?? true).length;
  const absentCount = totalClassStrength - presentCount;

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Attendance Center
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Classroom & Transport Attendance Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Class teachers view student strength grid. Default state is "Present"; unchecking marks absent. Bus & Gate verification auto-syncs green status.
          </p>
        </div>

        {/* Date & Class Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
          />
          {activeMode === 'classroom' && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-blue-600 dark:text-blue-400"
            >
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 10-B">Class 10-B</option>
              <option value="Class 11 Science">Class 11 Science</option>
              <option value="All">All Classes</option>
            </select>
          )}
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveMode('classroom')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeMode === 'classroom'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Class Teacher Grid View
        </button>

        <button
          onClick={() => setActiveMode('bus_guardian')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeMode === 'bus_guardian'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Bus className="w-4 h-4 text-amber-300" /> Bus Guardian Seat View
        </button>

        <button
          onClick={() => setActiveMode('gate_entry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeMode === 'gate_entry'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" /> Gate Arrival Duty
        </button>
      </div>

      {/* MODE 1: CLASSROOM DAILY ATTENDANCE GRID */}
      {activeMode === 'classroom' && (
        <div className="space-y-6">
          {/* Strength Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Class Strength</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalClassStrength}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Present Strength</p>
                <p className="text-2xl font-black text-emerald-600">{presentCount}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <XCircle className="w-8 h-8 text-rose-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Absent Count</p>
                <p className="text-2xl font-black text-rose-600">{absentCount}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Class Teacher Action</p>
                <button
                  onClick={handleSaveClassroomAttendance}
                  className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Attendance
                </button>
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs font-medium">
            <span className="text-slate-500 font-bold">Status Badges:</span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Green: Verified Present (Bus/Gate)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Yellow: Pending / Manual Present
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Red: Unchecked (Absent)
            </span>
          </div>

          {/* Classroom Student Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStudents.map((st) => {
              const state = classGridState[st.id] || { present: true, status: 'Present' };
              const isPresent = state.present;
              const isVerifiedBusGate = isPresent && (state.verifiedSource === 'Bus' || state.verifiedSource === 'Gate');

              return (
                <div
                  key={st.id}
                  onClick={() => handleToggleClassStudent(st.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
                    !isPresent
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-xs'
                      : isVerifiedBusGate
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.photoUrl}
                      alt={st.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold">
                          Roll #{st.rollNo}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {st.fullName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {st.currentClass}-{st.section} • {st.transportRequired ? `Bus ${st.busRouteNo}` : 'Self Vehicle'}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        {!isPresent ? (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            ● Marked Absent
                          </span>
                        ) : isVerifiedBusGate ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            ● Verified via {state.verifiedSource}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            ● Class Teacher Marked Present
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => {}} // Handled by container click
                      className="w-6 h-6 rounded text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: BUS GUARDIAN SEAT-BASED ATTENDANCE */}
      {activeMode === 'bus_guardian' && (
        <BusSeatingView
          routes={routes}
          students={students}
          selectedRouteId={selectedRouteId}
          setSelectedRouteId={setSelectedRouteId}
          busAttendanceState={busAttendanceState}
          onToggleBusStudent={handleToggleBusStudent}
          onSaveBusAttendance={handleSaveBusGuardianAttendance}
        />
      )}

      {/* MODE 3: GATE ARRIVAL DUTY */}
      {activeMode === 'gate_entry' && (
        <GateScanView
          students={students}
          gateAttendanceState={gateAttendanceState}
          onToggleGateStudent={handleToggleGateStudent}
          onSetAllGateStudents={(isPresent) => {
            const nextState: Record<string, boolean> = {};
            students.forEach((s) => {
              nextState[s.id] = isPresent;
            });
            setGateAttendanceState(nextState);
          }}
          onSaveGateAttendance={handleSaveGateEntryAttendance}
        />
      )}
    </div>
  );
};
