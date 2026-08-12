import React, { useState } from 'react';
import { useSisStore } from '../sis/sisStore';
import { useOtherModulesStore } from '../otherModules/otherStore';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Filter,
  BarChart2
} from 'lucide-react';
import { PrintModal } from '../../components/PrintModal';

export interface StudentAttendanceCalendarProps {
  initialStudentId?: string;
}

export const StudentAttendanceCalendarView: React.FC<StudentAttendanceCalendarProps> = ({ initialStudentId }) => {
  const { students } = useSisStore();
  const { attendance, markAttendance } = useOtherModulesStore();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [selectedClass, setSelectedClass] = useState<string>('Class 10-A');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed: 7 = August

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Selected student object
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Month navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon...

  // Class filtered students
  const filteredStudents = students.filter(
    (s) => `${s.currentClass}-${s.section}` === selectedClass || selectedClass === 'All'
  );

  // Attendance lookup for selected student in current month
  const getAttendanceForDay = (day: number) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!selectedStudent) return null;
    return attendance.find(
      (a) => a.studentId === selectedStudent.id && a.date === formattedDate
    );
  };

  // Toggle or mark day status on click
  const handleDayClick = (day: number) => {
    if (!selectedStudent) return;
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = attendance.find(
      (a) => a.studentId === selectedStudent.id && a.date === formattedDate
    );

    let nextStatus: 'Present' | 'Absent' | 'Late' = 'Present';
    if (!existing || existing.status === 'Absent') {
      nextStatus = 'Present';
    } else if (existing.status === 'Present') {
      nextStatus = 'Absent';
    } else {
      nextStatus = 'Present';
    }

    const newRecord = {
      id: `att-${selectedStudent.id}-${formattedDate}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      classSection: `${selectedStudent.currentClass}-${selectedStudent.section}`,
      rollNo: selectedStudent.rollNo,
      date: formattedDate,
      status: nextStatus,
      remarks: `Updated via Monthly Calendar (${nextStatus})`
    };

    markAttendance([newRecord as any]);
  };

  // Monthly stats calculations
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dayOfWeek = dateObj.getDay();
    // Exclude Sundays as holidays
    if (dayOfWeek !== 0) {
      workingDays++;
      const att = getAttendanceForDay(d);
      if (att) {
        if (att.status === 'Present') presentDays++;
        else if (att.status === 'Absent') absentDays++;
        else if (att.status === 'Late') lateDays++;
      } else {
        // Default assuming present if no record yet
        presentDays++;
      }
    }
  }

  const attendancePercentage = workingDays > 0 ? ((presentDays + lateDays * 0.5) / workingDays) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR & CONTROLS */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Student Monthly Attendance Calendar
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Green = Present • Red = Absent • Click any calendar day box to switch status.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const first = students.find((s) => `${s.currentClass}-${s.section}` === e.target.value);
                if (first) setSelectedStudentId(first.id);
              }}
              className="bg-transparent text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 10-B">Class 10-B</option>
              <option value="Class 11-A">Class 11-A</option>
              <option value="All">All Classes</option>
            </select>
          </div>

          {/* Student Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer max-w-[180px]"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  Roll #{s.rollNo} - {s.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Print Calendar Button */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Calendar
          </button>
        </div>
      </div>

      {/* MONTH NAVIGATION & STATS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Active Student Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md flex items-center gap-3">
          {selectedStudent && (
            <>
              <img
                src={selectedStudent.photoUrl}
                alt={selectedStudent.fullName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 shrink-0"
              />
              <div className="truncate">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">
                  Roll #{selectedStudent.rollNo} • {selectedStudent.currentClass}-{selectedStudent.section}
                </span>
                <h4 className="font-black text-sm truncate">{selectedStudent.fullName}</h4>
                <p className="text-[11px] text-slate-300">Adm: {selectedStudent.admissionNo}</p>
              </div>
            </>
          )}
        </div>

        {/* Present Days Count */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-extrabold uppercase">
              Present Days (Green)
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {presentDays} <span className="text-xs font-normal text-slate-500">/ {workingDays} days</span>
            </div>
          </div>
        </div>

        {/* Absent Days Count */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xs">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-rose-800 dark:text-rose-300 font-extrabold uppercase">
              Absent Days (Red)
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {absentDays} <span className="text-xs font-normal text-slate-500">days absent</span>
            </div>
          </div>
        </div>

        {/* Percentage Gauge */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-extrabold uppercase">
              Attendance %
            </span>
            <div className={`text-2xl font-black ${
              attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {attendancePercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID CONTAINER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Month Selector Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* DAYS OF WEEK HEADER */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500 uppercase tracking-wider pb-2">
          <div className="text-rose-500">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* CALENDAR DAYS MATRIX */}
        <div className="grid grid-cols-7 gap-2">
          {/* Blank Padding Cells before Day 1 */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`blank-${idx}`} className="h-20 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 opacity-40" />
          ))}

          {/* Actual Calendar Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateObj = new Date(currentYear, currentMonth, dayNum);
            const isSunday = dateObj.getDay() === 0;

            const att = getAttendanceForDay(dayNum);
            const status = isSunday ? 'Sunday' : att?.status || 'Present';

            const isPresent = status === 'Present';
            const isAbsent = status === 'Absent';
            const isLate = status === 'Late';

            return (
              <div
                key={dayNum}
                onClick={() => !isSunday && handleDayClick(dayNum)}
                className={`h-24 p-2 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between relative group ${
                  isSunday
                    ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                    : isPresent
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md hover:scale-105'
                    : isAbsent
                    ? 'bg-rose-950 text-white border-rose-800 shadow-md hover:scale-105'
                    : isLate
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md hover:scale-105'
                    : 'bg-emerald-500 text-white border-emerald-600'
                }`}
              >
                <div className="flex items-center justify-between font-black text-sm">
                  <span>{dayNum}</span>
                  {isSunday && <span className="text-[10px] font-bold uppercase opacity-60">Off</span>}
                  {isPresent && <CheckCircle2 className="w-4 h-4 text-emerald-100" />}
                  {isAbsent && <XCircle className="w-4 h-4 text-rose-300" />}
                  {isLate && <Clock className="w-4 h-4 text-amber-900" />}
                </div>

                <div className="text-center font-extrabold text-xs uppercase tracking-tight">
                  {isSunday ? (
                    <span className="text-[10px] text-slate-400">Sunday</span>
                  ) : isPresent ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-700/80 text-emerald-100 text-[10px]">
                      PRESENT
                    </span>
                  ) : isAbsent ? (
                    <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px] border border-rose-700 font-black">
                      ABSENT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px]">
                      LATE
                    </span>
                  )}
                </div>

                {!isSunday && (
                  <div className="text-[9px] text-center opacity-0 group-hover:opacity-100 transition-opacity font-bold underline">
                    Click to Change
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* PRINT MODAL FOR ATTENDANCE CALENDAR */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Monthly Attendance Register - ${selectedStudent?.fullName || 'Student'}`}
        subtitle={`Session 2026 • ${monthNames[currentMonth]} ${currentYear}`}
      >
        <div className="space-y-4 text-slate-900">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-lg font-black uppercase text-indigo-950">
                Monthly Student Attendance Report
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                Student: {selectedStudent?.fullName} • Class: {selectedStudent?.currentClass}-{selectedStudent?.section} • Roll #{selectedStudent?.rollNo}
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-black text-xs rounded-lg border border-emerald-300">
                Score: {attendancePercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold bg-slate-100 p-2 rounded">
            <div>Total Working Days: <strong>{workingDays}</strong></div>
            <div className="text-emerald-700">Present Days: <strong>{presentDays}</strong></div>
            <div className="text-rose-700">Absent Days: <strong>{absentDays}</strong></div>
          </div>

          <table className="w-full text-center border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-200 font-black">
                <th className="p-2 border border-slate-300">Date</th>
                <th className="p-2 border border-slate-300">Day</th>
                <th className="p-2 border border-slate-300">Status</th>
                <th className="p-2 border border-slate-300">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateObj = new Date(currentYear, currentMonth, dayNum);
                const isSunday = dateObj.getDay() === 0;
                const att = getAttendanceForDay(dayNum);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <tr key={dayNum} className={isSunday ? 'bg-slate-100' : ''}>
                    <td className="p-1.5 border border-slate-300 font-bold">{dayNum} {monthNames[currentMonth]}</td>
                    <td className="p-1.5 border border-slate-300 font-bold">{dayName}</td>
                    <td className="p-1.5 border border-slate-300 font-black">
                      {isSunday ? (
                        <span className="text-slate-400">HOLIDAY</span>
                      ) : att?.status === 'Absent' ? (
                        <span className="text-rose-600 font-black uppercase">ABSENT (RED)</span>
                      ) : (
                        <span className="text-emerald-600 font-black uppercase">PRESENT (GREEN)</span>
                      )}
                    </td>
                    <td className="p-1.5 border border-slate-300 text-[11px] text-slate-600">
                      {isSunday ? 'Weekly Off' : att?.remarks || 'Regular Attendance'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrintModal>

    </div>
  );
};
