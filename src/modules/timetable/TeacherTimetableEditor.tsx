import React, { useState, useEffect } from 'react';
import {
  TeacherTimetableRecord,
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
  TimetableDay,
  getDepartmentTheme,
  SCHOOL_DEPARTMENTS
} from './timetableData';
import {
  User,
  Search,
  Save,
  RotateCcw,
  Printer,
  Edit2,
  Check,
  X,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Wand2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { PrintModal } from '../../components/PrintModal';
import { useOtherModulesStore } from '../otherModules/otherStore';

interface TeacherTimetableEditorProps {
  teachers: TeacherTimetableRecord[];
  onSaveTeacher: (updatedTeacher: TeacherTimetableRecord) => void;
  onAddNewTeacher: (data: { teacherName: string; subject?: string; department?: string; grade?: string }) => void;
}

const MASTER_CLASSES = [
  'PG', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'Special Activity / Duty'
];

const MASTER_SECTIONS = ['A', 'B', 'C', 'D', 'None'];

export const TeacherTimetableEditor: React.FC<TeacherTimetableEditorProps> = ({
  teachers,
  onSaveTeacher,
  onAddNewTeacher
}) => {
  const { staff } = useOtherModulesStore();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Filtered teachers based on search query
  const filteredTeachers = teachers.filter((t) =>
    t.teacherName.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
    (t.department && t.department.toLowerCase().includes(searchFilter.toLowerCase().trim()))
  );

  // Selected teacher record from Timetable list
  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || filteredTeachers[0] || teachers[0];

  // Matched staff record from central Staff module (for subjects & class allocations)
  const matchedStaff = staff.find((s) =>
    s.fullName.trim().toUpperCase() === currentTeacher?.teacherName.trim().toUpperCase() ||
    `tt-stf-${s.id}` === currentTeacher?.id
  );

  // Derive teacher's registered subjects & classes
  const teacherAllocations: { className: string; subject: string }[] = [];
  if (matchedStaff?.assignedAllocations && matchedStaff.assignedAllocations.length > 0) {
    matchedStaff.assignedAllocations.forEach((item) => {
      teacherAllocations.push({ className: item.className, subject: item.subject });
    });
  } else if (matchedStaff?.assignedClasses && matchedStaff.assignedClasses.length > 0) {
    const subjs = matchedStaff.assignedSubjects || [matchedStaff.department || 'General'];
    matchedStaff.assignedClasses.forEach((c) => {
      subjs.forEach((s) => teacherAllocations.push({ className: c, subject: s }));
    });
  } else if (matchedStaff?.classTeacherOf && matchedStaff.classTeacherOf !== 'None') {
    teacherAllocations.push({ className: matchedStaff.classTeacherOf, subject: matchedStaff.department || 'General' });
  }

  // Editable local state for active teacher's schedule
  const [localSchedule, setLocalSchedule] = useState<Record<string, string>>(
    currentTeacher ? { ...currentTeacher.schedule } : {}
  );

  const [isDirty, setIsDirty] = useState(false);
  const [editingCell, setEditingCell] = useState<{ day: TimetableDay; period: number } | null>(null);
  
  // Cell Structured Input States
  const [selectedClassInput, setSelectedClassInput] = useState('Class 10');
  const [selectedSectionInput, setSelectedSectionInput] = useState('A');
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [tempCellValue, setTempCellValue] = useState('');

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Quick Add New Teacher Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacherNameInput, setNewTeacherNameInput] = useState('');
  const [newTeacherSubjectInput, setNewTeacherSubjectInput] = useState('Mathematics');
  const [newTeacherDeptInput, setNewTeacherDeptInput] = useState('Senior Secondary');
  const [newTeacherGradeInput, setNewTeacherGradeInput] = useState('Class 10');

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync local schedule when active teacher changes
  useEffect(() => {
    if (currentTeacher) {
      setSelectedTeacherId(currentTeacher.id);
      setLocalSchedule({ ...currentTeacher.schedule });
      setIsDirty(false);
      setEditingCell(null);

      // Pre-fill cell input defaults based on teacher allocations
      if (teacherAllocations.length > 0) {
        const firstAlloc = teacherAllocations[0];
        const parts = firstAlloc.className.split('-');
        if (parts[0]) setSelectedClassInput(parts[0].trim());
        if (parts[1]) setSelectedSectionInput(parts[1].trim());
        setCustomSubjectInput(firstAlloc.subject);
      }
    }
  }, [currentTeacher?.id]);

  // When typing search filter, auto-select first matching teacher if current selection lost
  useEffect(() => {
    if (searchFilter.trim() && filteredTeachers.length > 0) {
      const existsInFiltered = filteredTeachers.some((t) => t.id === selectedTeacherId);
      if (!existsInFiltered) {
        setSelectedTeacherId(filteredTeachers[0].id);
      }
    }
  }, [searchFilter]);

  // Switch active teacher
  const handleSelectTeacher = (tId: string) => {
    setSelectedTeacherId(tId);
    const found = teachers.find((t) => t.id === tId);
    if (found) {
      setLocalSchedule({ ...found.schedule });
      setIsDirty(false);
      setEditingCell(null);
    }
  };

  // Open inline cell editor
  const handleCellClick = (day: TimetableDay, period: number) => {
    const key = `${day}_${period}`;
    const rawVal = localSchedule[key] || '';
    setEditingCell({ day, period });
    setTempCellValue(rawVal);

    if (rawVal.includes('-')) {
      const parts = rawVal.split('-');
      const cls = parts[0]?.trim();
      const rest = parts[1]?.trim() || '';
      const sec = rest.split(' ')[0] || 'A';
      if (MASTER_CLASSES.includes(cls)) setSelectedClassInput(cls);
      if (MASTER_SECTIONS.includes(sec)) setSelectedSectionInput(sec);
    }
  };

  // Save inline cell update
  const handleSaveCell = (overrideValue?: string) => {
    if (!editingCell) return;
    const key = `${editingCell.day}_${editingCell.period}`;
    
    let finalVal = '';
    if (overrideValue !== undefined) {
      finalVal = overrideValue.trim();
    } else {
      const clsPart = selectedClassInput;
      const secPart = selectedSectionInput !== 'None' ? `-${selectedSectionInput}` : '';
      const subjPart = customSubjectInput.trim() ? ` (${customSubjectInput.trim()})` : '';
      finalVal = tempCellValue.trim() || `${clsPart}${secPart}${subjPart}`;
    }

    setLocalSchedule((prev) => {
      const next = { ...prev };
      if (finalVal) {
        next[key] = finalVal;
      } else {
        delete next[key];
      }
      return next;
    });

    setIsDirty(true);
    setEditingCell(null);
  };

  // Save all changes for teacher
  const handleSaveChanges = () => {
    if (!currentTeacher) return;
    const updated: TeacherTimetableRecord = {
      ...currentTeacher,
      schedule: localSchedule,
      lastUpdated: new Date().toLocaleString()
    };
    onSaveTeacher(updated);
    setIsDirty(false);
    setToastMessage(`🟢 Timetable for ${currentTeacher.teacherName} successfully saved & synced to Supabase database!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Reset local changes
  const handleReset = () => {
    if (currentTeacher) {
      setLocalSchedule({ ...currentTeacher.schedule });
      setIsDirty(false);
      setEditingCell(null);
    }
  };

  // Smart Auto-Distribute Schedule from Staff Allocations
  const handleSmartAutoDistribute = () => {
    // 1. Determine allocations to use
    let activeAllocations = [...teacherAllocations];

    // Fallback: If no explicit allocations in staff record, derive from department or default subjects
    if (activeAllocations.length === 0) {
      const deptName = currentTeacher?.department || matchedStaff?.department || 'Senior Secondary';
      let defaultSubj = 'Mathematics';
      if (deptName.toLowerCase().includes('sci')) defaultSubj = 'Physics';
      else if (deptName.toLowerCase().includes('eng')) defaultSubj = 'English';
      else if (deptName.toLowerCase().includes('hindi')) defaultSubj = 'Hindi';
      else if (deptName.toLowerCase().includes('comm')) defaultSubj = 'Accountancy';
      else if (deptName.toLowerCase().includes('social')) defaultSubj = 'Social Studies';
      else if (deptName.toLowerCase().includes('prim')) defaultSubj = 'General Science';
      else if (deptName.toLowerCase().includes('sport') || deptName.toLowerCase().includes('phys')) defaultSubj = 'Physical Education';

      const defaultClasses = ['Class 9-A', 'Class 10-A', 'Class 11-A', 'Class 12-A'];
      activeAllocations = defaultClasses.map((cls) => ({ className: cls, subject: defaultSubj }));
    }

    const newSchedule: Record<string, string> = {};
    let allocIdx = 0;

    // Distribute 4 to 5 periods per day evenly across Mon - Sat
    TIMETABLE_DAYS.forEach((day) => {
      const dailyPeriods = [1, 2, 3, 5, 6]; // Standard teaching periods (leaving 0 assembly & 4 lunch free)
      dailyPeriods.forEach((periodNo) => {
        const alloc = activeAllocations[allocIdx % activeAllocations.length];
        newSchedule[`${day}_${periodNo}`] = `${alloc.className} (${alloc.subject})`;
        allocIdx++;
      });
    });

    setLocalSchedule(newSchedule);
    setIsDirty(true);
    setToastMessage(`✨ Auto-distributed ${activeAllocations.length} subjects & classes across the weekly timetable for ${currentTeacher?.teacherName}! Click "Save Timetable" to commit.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Quick Add New Teacher
  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherNameInput.trim()) return;
    onAddNewTeacher({
      teacherName: newTeacherNameInput.trim().toUpperCase(),
      subject: newTeacherSubjectInput.trim(),
      department: newTeacherDeptInput.trim(),
      grade: newTeacherGradeInput.trim()
    });
    setNewTeacherNameInput('');
    setShowAddModal(false);
  };

  // Workload Metrics
  const totalSlotsAssigned = Object.keys(localSchedule).length;
  const maxWeeklySlots = TIMETABLE_DAYS.length * TIMETABLE_PERIODS.length; // 54
  const totalFreeSlots = maxWeeklySlots - totalSlotsAssigned;

  return (
    <div className="space-y-6">
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-black animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* TEACHER SELECTION & TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Search / Select Teacher */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter teacher by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium outline-none"
            />
          </div>

          <div className="flex-1 max-w-md">
            <select
              value={selectedTeacherId}
              onChange={(e) => handleSelectTeacher(e.target.value)}
              className="w-full px-3 py-2 text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-200 cursor-pointer"
            >
              {filteredTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  👨‍🏫 {t.teacherName} {t.department ? `(${t.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" /> Add Teacher
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Discard Edits
            </button>
          )}

          <button
            onClick={handleSaveChanges}
            disabled={!isDirty}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" /> Save Timetable
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </button>
        </div>
      </div>

      {/* ACTIVE TEACHER HEADER & WORKLOAD SUMMARY */}
      {currentTeacher && (() => {
        const deptTheme = getDepartmentTheme(currentTeacher.department);
        return (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${deptTheme.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${deptTheme.dotClass}`}></span>
                  {deptTheme.label}
                </span>

                {/* EDIT DEPARTMENT DROPDOWN ON LOGIN / SELECTION */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
                  <span className="text-[11px] font-bold text-slate-300">Department:</span>
                  <select
                    value={currentTeacher.department || 'Senior Secondary'}
                    onChange={(e) => {
                      const updatedDept = e.target.value;
                      const updated: TeacherTimetableRecord = {
                        ...currentTeacher,
                        department: updatedDept,
                        schedule: localSchedule,
                        lastUpdated: new Date().toLocaleString()
                      };
                      onSaveTeacher(updated);
                      setIsDirty(false);
                    }}
                    className="bg-slate-900 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg border border-slate-700 cursor-pointer focus:outline-none"
                  >
                    {SCHOOL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs text-slate-400">Last updated: {currentTeacher.lastUpdated || 'Recently'}</span>
              </div>

              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-amber-300">
                <User className="w-6 h-6 text-indigo-400" /> {currentTeacher.teacherName}
              </h2>
              <p className="text-xs text-slate-300">
                Active Faculty: <strong>{currentTeacher.teacherName}</strong>. Department: <strong>{currentTeacher.department || 'Senior Secondary'}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-xl border border-white/10 text-center shrink-0">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Weekly Periods</span>
                <strong className="text-xl font-black text-white">{totalSlotsAssigned}</strong>
              </div>
              <div className="p-2 border-x border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Free Periods</span>
                <strong className="text-xl font-black text-emerald-400">{totalFreeSlots}</strong>
              </div>
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Avg / Day</span>
                <strong className="text-xl font-black text-amber-300">{(totalSlotsAssigned / 6).toFixed(1)}</strong>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* CONNECTED STAFF ALLOCATIONS & 1-CLICK TIMETABLE GENERATOR ACTION BAR     */}
      {/* ========================================================================= */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200 dark:border-indigo-900 pb-2.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Allocated Subjects & Classes (From Staff Registry)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSmartAutoDistribute}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              ✨ Auto-Distribute Allocated Schedule
            </button>
          </div>
        </div>

        {teacherAllocations.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No subjects or classes allocated in the Staff module yet. You can still assign any class & subject by clicking any period box below.
          </p>
        ) : (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Click any chip below to set as default input or click period box in table:
            </span>
            <div className="flex flex-wrap gap-2">
              {teacherAllocations.map((item, idx) => {
                const parts = item.className.split('-');
                const cls = parts[0]?.trim() || item.className;
                const sec = parts[1]?.trim() || 'A';

                return (
                  <button
                    key={`${item.className}-${item.subject}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedClassInput(cls);
                      setSelectedSectionInput(sec);
                      setCustomSubjectInput(item.subject);
                      setToastMessage(`Selected "${item.className} (${item.subject})" — Now click any period cell in the grid to assign!`);
                      setTimeout(() => setToastMessage(null), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-xs font-extrabold text-indigo-950 dark:text-indigo-200 shadow-2xs hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer flex items-center gap-1.5 transition-all active:scale-98"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400">⭐ {item.className}</span>
                    <span className="text-slate-400">•</span>
                    <span>{item.subject}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE WEEKLY TIMETABLE MATRIX GRID */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Weekly Timetable Grid (Monday – Saturday, Periods 0 – 8)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            💡 Tip: Click on any period box to assign or change class & subject
          </span>
        </div>

        {/* MATRIX TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              {/* Row 1: Days Header */}
              <tr>
                <th className="p-3 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white w-28 text-center uppercase tracking-wider">
                  Day \ Period
                </th>
                {TIMETABLE_PERIODS.map((pNo) => (
                  <th
                    key={pNo}
                    className="p-2 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 text-center"
                  >
                    Period {pNo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_DAYS.map((day) => {
                // Calculate assigned periods for this day
                const assignedToday = TIMETABLE_PERIODS.filter(
                  (p) => !!localSchedule[`${day}_${p}`]
                ).length;

                return (
                  <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {/* DAY NAME HEADER */}
                    <td className="p-3 bg-slate-50 dark:bg-slate-800/80 border dark:border-slate-700 font-black text-xs text-indigo-950 dark:text-indigo-200 text-center">
                      <div className="uppercase tracking-wider">{day}</div>
                      <span className="text-[10px] font-normal text-slate-500 block">
                        ({assignedToday} Busy, {9 - assignedToday} Free)
                      </span>
                    </td>

                    {/* PERIOD CELLS 0 - 8 */}
                    {TIMETABLE_PERIODS.map((periodNo) => {
                      const key = `${day}_${periodNo}`;
                      const value = localSchedule[key] || '';
                      const isEditing = editingCell?.day === day && editingCell?.period === periodNo;

                      return (
                        <td
                          key={periodNo}
                          onClick={() => !isEditing && handleCellClick(day, periodNo)}
                          className={`p-2 border dark:border-slate-800 text-center align-middle transition-all cursor-pointer relative min-h-[60px] ${
                            isEditing
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 ring-2 ring-indigo-500 z-10'
                              : value
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60'
                              : 'bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-100/40'
                          }`}
                        >
                          {isEditing ? (
                            /* INLINE STRUCTURED CELL EDITOR WITH PRESETS & CLASS/SECTION PULLDOWNS */
                            <div className="space-y-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-400 dark:border-indigo-600 shadow-2xl min-w-[210px]" onClick={(e) => e.stopPropagation()}>
                              {/* 1-Click Allocated Chips inside cell editor */}
                              {teacherAllocations.length > 0 && (
                                <div className="space-y-1 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                                  <span className="text-[9px] font-black uppercase text-indigo-600 block">
                                    Quick 1-Click Fill:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {teacherAllocations.slice(0, 3).map((a, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSaveCell(`${a.className} (${a.subject})`)}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 hover:bg-indigo-600 hover:text-white cursor-pointer"
                                      >
                                        {a.className}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-1 text-[11px]">
                                <div>
                                  <label className="block text-[9px] font-extrabold uppercase text-slate-500">Class *</label>
                                  <select
                                    value={selectedClassInput}
                                    onChange={(e) => setSelectedClassInput(e.target.value)}
                                    className="w-full px-1.5 py-1 font-bold text-xs bg-slate-100 dark:bg-slate-800 border rounded text-slate-900 dark:text-white cursor-pointer"
                                  >
                                    {MASTER_CLASSES.map((cls) => (
                                      <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-extrabold uppercase text-slate-500">Sec *</label>
                                  <select
                                    value={selectedSectionInput}
                                    onChange={(e) => setSelectedSectionInput(e.target.value)}
                                    className="w-full px-1.5 py-1 font-bold text-xs bg-slate-100 dark:bg-slate-800 border rounded text-slate-900 dark:text-white cursor-pointer"
                                  >
                                    {MASTER_SECTIONS.map((sec) => (
                                      <option key={sec} value={sec}>{sec !== 'None' ? `Sec ${sec}` : 'None'}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-0.5">
                                  Subject *
                                </label>
                                <select
                                  value={customSubjectInput}
                                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                                  className="w-full px-1.5 py-1 font-bold text-xs bg-slate-100 dark:bg-slate-800 border rounded text-slate-900 dark:text-white cursor-pointer"
                                >
                                  <option value="">Select Subject...</option>
                                  {teacherAllocations.length > 0 && (
                                    <optgroup label="⭐ ALLOCATED SUBJECTS">
                                      {Array.from(new Set(teacherAllocations.map((a) => a.subject))).map((subj) => (
                                        <option key={`alloc-${subj}`} value={subj}>
                                          ⭐ {subj}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                  <optgroup label="ALL SUBJECTS">
                                    {[
                                      'Mathematics',
                                      'Physics',
                                      'Chemistry',
                                      'Biology',
                                      'Science & Tech',
                                      'English',
                                      'English Core',
                                      'Hindi',
                                      'Sanskrit',
                                      'Social Studies',
                                      'History',
                                      'Geography',
                                      'Political Science',
                                      'Economics',
                                      'Accountancy',
                                      'Business Studies',
                                      'Computer Science',
                                      'Information Practices',
                                      'Physical Education',
                                      'Art & Craft',
                                      'Music',
                                      'Dance',
                                      'General Knowledge',
                                      'Moral Science',
                                      'Library Period',
                                      'Zero Period / Remedial',
                                      'Other'
                                    ].map((sub) => (
                                      <option key={sub} value={sub}>
                                        {sub}
                                      </option>
                                    ))}
                                  </optgroup>
                                </select>
                                {customSubjectInput === 'Other' && (
                                  <input
                                    type="text"
                                    placeholder="Enter custom subject..."
                                    value={tempCellValue}
                                    onChange={(e) => setTempCellValue(e.target.value)}
                                    className="mt-1 w-full px-1.5 py-0.5 font-bold text-[11px] bg-slate-50 dark:bg-slate-800 border rounded text-slate-900 dark:text-white outline-none"
                                  />
                                )}
                              </div>

                              {/* FREE TEXT / CLEAR BUTTON */}
                              <div className="pt-0.5 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleSaveCell('')}
                                  className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[9px] font-bold border border-rose-300 cursor-pointer"
                                >
                                  Clear (Free)
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => handleSaveCell()}
                                  className="flex-1 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center gap-0.5 cursor-pointer shadow-xs"
                                >
                                  <Check className="w-3 h-3" /> Save Box
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCell(null)}
                                  className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : value ? (
                            /* ASSIGNED CELL CONTENT */
                            <div className="group relative space-y-0.5">
                              <span className="px-2 py-1 rounded text-xs font-black text-slate-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/60 inline-block border border-amber-300 dark:border-amber-700 shadow-2xs">
                                {value}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-indigo-600 font-bold flex items-center justify-center gap-0.5">
                                <Edit2 className="w-2.5 h-2.5" /> Edit
                              </div>
                            </div>
                          ) : (
                            /* FREE CELL BADGE */
                            <div className="group relative py-1">
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                FREE
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-slate-400 font-semibold block mt-0.5">
                                + Assign Class
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ADD NEW TEACHER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Add New Teacher to Timetable
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Teacher Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAJESH KUMAR, SUNITA DEVI"
                  value={newTeacherNameInput}
                  onChange={(e) => setNewTeacherNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Physics, English, Science"
                  value={newTeacherSubjectInput}
                  onChange={(e) => setNewTeacherSubjectInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newTeacherDeptInput}
                    onChange={(e) => setNewTeacherDeptInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Pre-Primary (PG-UKG)">Pre-Primary (PG-UKG)</option>
                    <option value="Primary (1-5)">Primary (1-5)</option>
                    <option value="Middle (6-8)">Middle (6-8)</option>
                    <option value="Senior Secondary">Senior Secondary (9-12)</option>
                    <option value="Physical Education / Activity">Physical Education / Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Grade / Class *
                  </label>
                  <select
                    value={newTeacherGradeInput}
                    onChange={(e) => setNewTeacherGradeInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {MASTER_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Faculty Timetable - ${currentTeacher?.teacherName}`}
      >
        <div className="space-y-4 p-4 text-slate-900">
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black">{currentTeacher?.teacherName}</h1>
              <p className="text-sm font-bold text-slate-600">
                Department: {currentTeacher?.department || 'Senior Secondary'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Weekly Schedule</span>
              <p className="text-sm font-black">{totalSlotsAssigned} Periods Assigned</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs text-center">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-900 p-2 font-black">Day</th>
                {TIMETABLE_PERIODS.map((p) => (
                  <th key={p} className="border border-slate-900 p-2 font-black">
                    P{p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_DAYS.map((day) => (
                <tr key={day}>
                  <td className="border border-slate-900 p-2 font-black bg-slate-50">{day}</td>
                  {TIMETABLE_PERIODS.map((p) => (
                    <td key={p} className="border border-slate-900 p-2 font-bold">
                      {localSchedule[`${day}_${p}`] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>
    </div>
  );
};
