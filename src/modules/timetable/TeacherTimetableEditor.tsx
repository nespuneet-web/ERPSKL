import React, { useState } from 'react';
import { TeacherTimetableRecord, TIMETABLE_DAYS, TIMETABLE_PERIODS, TimetableDay, getDepartmentTheme, SCHOOL_DEPARTMENTS } from './timetableData';
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
  AlertCircle
} from 'lucide-react';

interface TeacherTimetableEditorProps {
  teachers: TeacherTimetableRecord[];
  onSaveTeacher: (updatedTeacher: TeacherTimetableRecord) => void;
  onAddNewTeacher: (data: { teacherName: string; subject?: string; department?: string; grade?: string }) => void;
}

export const TeacherTimetableEditor: React.FC<TeacherTimetableEditorProps> = ({
  teachers,
  onSaveTeacher,
  onAddNewTeacher
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Selected teacher
  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  // Editable local state for the active teacher's schedule
  const [localSchedule, setLocalSchedule] = useState<Record<string, string>>(
    currentTeacher ? { ...currentTeacher.schedule } : {}
  );
  const [isDirty, setIsDirty] = useState(false);
  const [editingCell, setEditingCell] = useState<{ day: TimetableDay; period: number } | null>(null);
  const [tempCellValue, setTempCellValue] = useState('');

  // Quick Add New Teacher Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacherNameInput, setNewTeacherNameInput] = useState('');
  const [newTeacherSubjectInput, setNewTeacherSubjectInput] = useState('Mathematics');
  const [newTeacherDeptInput, setNewTeacherDeptInput] = useState('Senior Secondary');
  const [newTeacherGradeInput, setNewTeacherGradeInput] = useState('Class 10');

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
    setEditingCell({ day, period });
    setTempCellValue(localSchedule[key] || '');
  };

  // Save inline cell update
  const handleSaveCell = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}_${editingCell.period}`;
    const trimmed = tempCellValue.trim();

    setLocalSchedule((prev) => {
      const next = { ...prev };
      if (trimmed) {
        next[key] = trimmed;
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
    alert(`Timetable for ${currentTeacher.teacherName} successfully updated and saved!`);
  };

  // Reset local changes
  const handleReset = () => {
    if (currentTeacher) {
      setLocalSchedule({ ...currentTeacher.schedule });
      setIsDirty(false);
      setEditingCell(null);
    }
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

  const filteredTeachers = teachers.filter((t) =>
    t.teacherName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Workload Metrics
  const totalSlotsAssigned = Object.keys(localSchedule).length;
  const maxWeeklySlots = TIMETABLE_DAYS.length * TIMETABLE_PERIODS.length; // 54
  const totalFreeSlots = maxWeeklySlots - totalSlotsAssigned;

  return (
    <div className="space-y-6">
      
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
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="flex-1 max-w-md">
            <select
              value={selectedTeacherId}
              onChange={(e) => handleSelectTeacher(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-200 cursor-pointer"
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
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
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
                Logged in as <strong>{currentTeacher.teacherName}</strong>. Department is set to <strong>{currentTeacher.department || 'Senior Secondary'}</strong> for smart substitution matching.
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
            💡 Tip: Click on any period box to edit class or subject
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
                            /* INLINE EDIT CELL INPUT */
                            <div className="space-y-2 p-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                autoFocus
                                value={tempCellValue}
                                onChange={(e) => setTempCellValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveCell();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                placeholder="e.g. XII A, X B, FACULTY CLUB..."
                                className="w-full px-2 py-1 text-xs font-bold border rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-indigo-500"
                              />
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={handleSaveCell}
                                  className="p-1 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 rounded bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold cursor-pointer"
                                >
                                  <X className="w-3 h-3" /> Cancel
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pre-Primary (PG-UKG)">Pre-Primary (PG-UKG)</option>
                    <option value="Primary (1-5)">Primary (1-5)</option>
                    <option value="Middle (6-8)">Middle (6-8)</option>
                    <option value="Senior Secondary">Senior Secondary (9-12)</option>
                    <option value="Sports & PE">Sports & PE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Grade / Class *
                  </label>
                  <select
                    value={newTeacherGradeInput}
                    onChange={(e) => setNewTeacherGradeInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PG">PG</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-300">
                ✨ <strong>Note:</strong> Initial timetable will be created <strong>completely free/blank</strong>. You can then assign periods according to master class & section schedules.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer"
                >
                  Create & Show Free Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
