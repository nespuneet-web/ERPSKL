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
  GraduationCap,
  ShieldCheck,
  Zap,
  QrCode,
  Smartphone,
  MapPin,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Camera,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { PrintModal } from '../../components/PrintModal';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { useAuth } from '../../context/AuthContext';
import { RoundDutyRecord, RoundObservationRecord } from './index';
import { TimetableArrangement } from '../../types/otherModules';

interface TeacherTimetableEditorProps {
  teachers: TeacherTimetableRecord[];
  roundDuties?: RoundDutyRecord[];
  arrangements?: TimetableArrangement[];
  onSaveTeacher: (updatedTeacher: TeacherTimetableRecord) => void;
  onAddNewTeacher: (data: { teacherName: string; subject?: string; department?: string; grade?: string }) => void;
  onUpdateRoundDuty?: (updatedDuty: RoundDutyRecord) => void;
}

const MASTER_CLASSES = [
  'PG', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'Special Activity / Duty'
];

const MASTER_SECTIONS = ['A', 'B', 'C', 'D', 'None'];

// Non-teaching roles to exclude from teacher section
const NON_TEACHING_DEPTS = ['Transport', 'Security', 'Housekeeping', 'Maintenance', 'Pantry', 'Accounts', 'Reception'];
const NON_TEACHING_KEYWORDS = ['driver', 'guard', 'helper', 'sweeper', 'peon', 'accountant', 'receptionist', 'conductor', 'bus incharge'];

export const TeacherTimetableEditor: React.FC<TeacherTimetableEditorProps> = ({
  teachers,
  roundDuties = [],
  arrangements = [],
  onSaveTeacher,
  onAddNewTeacher,
  onUpdateRoundDuty
}) => {
  const { staff } = useOtherModulesStore();
  const { activeRole, currentUser } = useAuth();
  const isTeacher = activeRole === 'Teacher' || activeRole === 'Class Teacher';

  // Automatically find teacher matching current logged-in user if role is Teacher
  const cleanUserName = (currentUser?.name || '').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
  const matchedTeacherRecord = teachers.find((t) => {
    const tName = t.teacherName.toLowerCase().trim();
    return (
      tName === cleanUserName ||
      (cleanUserName.length > 2 && tName.includes(cleanUserName)) ||
      (tName.length > 2 && cleanUserName.includes(tName)) ||
      t.id === `tt-${currentUser?.id}` ||
      t.id === `tt-stf-${currentUser?.id}`
    );
  });

  // Filter only teaching staff (exclude non-teaching faculty like transport, security, housekeeping)
  const academicTeachers = teachers.filter((t) => {
    const nameLower = t.teacherName.toLowerCase();
    const deptLower = (t.department || '').toLowerCase();
    
    // Check if non-teaching
    const isNonTeachingDept = NON_TEACHING_DEPTS.some((d) => deptLower.includes(d.toLowerCase()));
    const isNonTeachingRole = NON_TEACHING_KEYWORDS.some((k) => nameLower.includes(k) || deptLower.includes(k));
    
    if (isNonTeachingDept || isNonTeachingRole) {
      // Keep only if they have actual timetable slots assigned
      const hasSlots = Object.keys(t.schedule || {}).length > 0;
      return hasSlots;
    }
    return true;
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    isTeacher && matchedTeacherRecord ? matchedTeacherRecord.id : academicTeachers[0]?.id || teachers[0]?.id || ''
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  useEffect(() => {
    if (isTeacher && matchedTeacherRecord) {
      setSelectedTeacherId(matchedTeacherRecord.id);
    }
  }, [isTeacher, matchedTeacherRecord?.id]);

  // Filtered teachers for Admin mode (filtered by search and academic department)
  const filteredTeachers = isTeacher
    ? [matchedTeacherRecord || teachers.find((t) => t.id === selectedTeacherId) || teachers[0]].filter(Boolean)
    : academicTeachers.filter((t) => {
        const matchesSearch =
          t.teacherName.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
          (t.department && t.department.toLowerCase().includes(searchFilter.toLowerCase().trim()));
        const matchesDept = selectedDeptFilter === 'ALL' || t.department === selectedDeptFilter;
        return matchesSearch && matchesDept;
      });

  // Selected teacher record from Timetable list
  const currentTeacher = isTeacher && matchedTeacherRecord
    ? matchedTeacherRecord
    : teachers.find((t) => t.id === selectedTeacherId) || filteredTeachers[0] || teachers[0];

  // Matched staff record from central Staff module (for subjects & class allocations)
  const matchedStaff = staff.find(
    (s) =>
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

  // Active Teacher's Assigned Round Duties (from Timetable department)
  const teacherRoundDuties = roundDuties.filter((r) => {
    if (!currentTeacher) return false;
    const rName = r.teacherName.trim().toUpperCase();
    const cName = currentTeacher.teacherName.trim().toUpperCase();
    return rName === cName || (cName.length > 3 && rName.includes(cName)) || (rName.length > 3 && cName.includes(rName));
  });

  // Active Teacher's Assigned Substitutions (from Timetable department)
  const teacherSubstitutions = arrangements.filter((a) => {
    if (!currentTeacher) return false;
    const subName = a.substituteTeacherName.trim().toUpperCase();
    const cName = currentTeacher.teacherName.trim().toUpperCase();
    return subName === cName || (cName.length > 3 && subName.includes(cName)) || (subName.length > 3 && cName.includes(subName));
  });

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

  // Mobile QR Scanner Modal state
  const [activeQrScanDuty, setActiveQrScanDuty] = useState<RoundDutyRecord | null>(null);
  const [qrScanStep, setQrScanStep] = useState<'SCANNING' | 'ACTION_CHOICE' | 'REMARK_FORM'>('SCANNING');
  const [selectedObsClass, setSelectedObsClass] = useState<string>('Class 10-A');
  const [selectedDelayType, setSelectedDelayType] = useState<string>('Teacher Delayed (>10 mins)');
  const [customObsMessage, setCustomObsMessage] = useState<string>('');

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Timetable Permission Request & Admin Lock Workflow State
  const [showRequestPermissionModal, setShowRequestPermissionModal] = useState(false);
  const [permissionReasonInput, setPermissionReasonInput] = useState('');
  const [showAdminPermissionManagerModal, setShowAdminPermissionManagerModal] = useState(false);

  // Check if current timetable is editable
  // BY DEFAULT: Teacher timetables are EDITABLE.
  // BUT: Admin department can freeze/block (isLocked === true or editPermissionStatus === 'LOCKED' / 'FROZEN').
  // If frozen/blocked by Admin, teachers see locked status and can request unlock permission from Admin.
  const isTimetableLockedForUser = (() => {
    if (!isTeacher) return false; // Admin has master edit rights
    // If explicitly locked/frozen by Admin
    if (currentTeacher?.isLocked === true || currentTeacher?.editPermissionStatus === 'LOCKED') {
      return true;
    }
    // Default is EDITABLE (unfrozen)
    return false;
  })();

  const canTeacherEdit = isTeacher && !isTimetableLockedForUser;

  // Sync local schedule when active teacher changes
  useEffect(() => {
    if (currentTeacher) {
      setLocalSchedule({ ...currentTeacher.schedule });
      setIsDirty(false);
      setEditingCell(null);
    }
  }, [currentTeacher?.id]);

  const handleSelectTeacher = (id: string) => {
    if (isDirty) {
      const confirmChange = window.confirm('You have unsaved timetable changes. Discard and switch faculty?');
      if (!confirmChange) return;
    }
    setSelectedTeacherId(id);
    setIsDirty(false);
  };

  // Submit edit permission request to Admin
  const handleTeacherSubmitPermissionRequest = () => {
    if (!currentTeacher) return;
    if (!permissionReasonInput.trim()) {
      alert('Please state the reason why you need to update your timetable.');
      return;
    }

    const updated: TeacherTimetableRecord = {
      ...currentTeacher,
      isLocked: true,
      editPermissionStatus: 'REQUEST_PENDING',
      permissionRequestReason: permissionReasonInput.trim(),
      permissionRequestedAt: new Date().toLocaleString(),
      lastUpdated: new Date().toLocaleString()
    };

    onSaveTeacher(updated);
    setShowRequestPermissionModal(false);
    setPermissionReasonInput('');
    setToastMessage('📩 Edit Permission Request submitted to School Admin & Timetable Incharge for approval.');
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Admin action: Grant or Lock Teacher Timetable
  const handleAdminToggleLockStatus = (targetTeacher: TeacherTimetableRecord, grantAccess: boolean) => {
    const updated: TeacherTimetableRecord = {
      ...targetTeacher,
      isLocked: !grantAccess,
      editPermissionStatus: grantAccess ? 'EDIT_GRANTED' : 'LOCKED',
      permissionGrantedBy: grantAccess ? (currentUser?.name || 'Administrator') : undefined,
      editAllowedUntil: grantAccess ? new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString() : undefined,
      lastUpdated: new Date().toLocaleString()
    };

    onSaveTeacher(updated);
    setToastMessage(
      grantAccess
        ? `🔓 Edit permission granted for ${targetTeacher.teacherName} (Unlocked for 24 hours).`
        : `🔒 Timetable locked for ${targetTeacher.teacherName}. Teacher can view only.`
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleCellClick = (day: TimetableDay, period: number) => {
    if (isTeacher && isTimetableLockedForUser) {
      setToastMessage('🔒 Timetable is locked by School Admin. Click "Request Edit Permission" to request update access.');
      setTimeout(() => setToastMessage(null), 4000);
      return; // Locked for teachers
    }

    const key = `${day}_${period}`;
    const currentValue = localSchedule[key] || '';

    let cls = 'Class 10';
    let sec = 'A';
    let subj = '';

    if (currentValue) {
      const match = currentValue.match(/^([A-Za-z0-9\s]+?)(?:-([A-D]))?\s*\((.+)\)$/);
      if (match) {
        cls = match[1]?.trim() || 'Class 10';
        sec = match[2]?.trim() || 'A';
        subj = match[3]?.trim() || '';
      } else {
        subj = currentValue;
      }
    } else if (teacherAllocations.length > 0) {
      const first = teacherAllocations[0];
      const parts = first.className.split('-');
      cls = parts[0]?.trim() || first.className;
      sec = parts[1]?.trim() || 'A';
      subj = first.subject;
    }

    setSelectedClassInput(cls);
    setSelectedSectionInput(sec);
    setCustomSubjectInput(subj);
    setTempCellValue(currentValue);
    setEditingCell({ day, period });
  };

  const handleSaveCell = (overrideValue?: string) => {
    if (!editingCell) return;
    const { day, period } = editingCell;
    const key = `${day}_${period}`;

    let finalValue = '';
    if (overrideValue !== undefined) {
      finalValue = overrideValue.trim();
    } else {
      if (tempCellValue.trim() && customSubjectInput === 'Other') {
        finalValue = `${selectedClassInput}${selectedSectionInput !== 'None' ? `-${selectedSectionInput}` : ''} (${tempCellValue.trim()})`;
      } else if (customSubjectInput.trim()) {
        finalValue = `${selectedClassInput}${selectedSectionInput !== 'None' ? `-${selectedSectionInput}` : ''} (${customSubjectInput.trim()})`;
      } else {
        finalValue = tempCellValue.trim();
      }
    }

    setLocalSchedule((prev) => {
      const updated = { ...prev };
      if (!finalValue) {
        delete updated[key];
      } else {
        updated[key] = finalValue;
      }
      return updated;
    });

    setIsDirty(true);
    setEditingCell(null);
  };

  const handleSmartAutoDistribute = () => {
    if (teacherAllocations.length === 0) {
      alert('No allocated subjects found for this teacher in the Staff Module.');
      return;
    }

    const newSchedule = { ...localSchedule };
    let allocIdx = 0;

    TIMETABLE_DAYS.forEach((day) => {
      [1, 2, 3, 4, 5, 6].forEach((p) => {
        const key = `${day}_${p}`;
        if (!newSchedule[key]) {
          const alloc = teacherAllocations[allocIdx % teacherAllocations.length];
          newSchedule[key] = `${alloc.className} (${alloc.subject})`;
          allocIdx++;
        }
      });
    });

    setLocalSchedule(newSchedule);
    setIsDirty(true);
    setToastMessage('✨ Smart timetable distributed evenly across 6 working days!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveChanges = () => {
    if (!currentTeacher) return;
    const updated: TeacherTimetableRecord = {
      ...currentTeacher,
      schedule: localSchedule,
      lastUpdated: new Date().toLocaleString()
    };
    onSaveTeacher(updated);
    setIsDirty(false);
    setToastMessage(`✅ Timetable for "${currentTeacher.teacherName}" saved successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReset = () => {
    if (!currentTeacher) return;
    setLocalSchedule({ ...currentTeacher.schedule });
    setIsDirty(false);
    setEditingCell(null);
  };

  // Perform QR Check-in for Round Duty
  const handleOpenQrScanner = (duty: RoundDutyRecord) => {
    setActiveQrScanDuty(duty);
    setQrScanStep('SCANNING');
    // Simulate camera lock
    setTimeout(() => {
      setQrScanStep('ACTION_CHOICE');
    }, 1200);
  };

  const handleConfirmQrCheckIn = (duty: RoundDutyRecord, isObservation: boolean = false) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine on-time status vs period schedule
    // Start time benchmark: 08:00 AM (P1), 08:45 AM (P2), etc.
    const isDelayed = isObservation; // Or delayed after tolerance

    const updatedDuty: RoundDutyRecord = {
      ...duty,
      status: 'Completed',
      checkInTime: timeStr,
      checkInMethod: 'QR Code',
      remarks: isObservation
        ? `⚠️ Observation Reported: ${customObsMessage || `${selectedObsClass} delayed (${selectedDelayType})`}`
        : `✓ Round duty completed on time at ${duty.location}. Faculty present.`
    };

    if (onUpdateRoundDuty) {
      onUpdateRoundDuty(updatedDuty);
    }

    setActiveQrScanDuty(null);
    setToastMessage(`📱 Mobile QR Check-In Verified for ${duty.location} at ${timeStr}! Principal notified.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

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
        {/* Left Section: Personal View Banner (Teacher) or Filtered Teacher Selector (Admin) */}
        {isTeacher ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  Faculty Personal Schedule
                </span>
                {isTimetableLockedForUser ? (
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                    🔒 Frozen / Blocked by Admin
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✏️ Editable Mode Active
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {currentTeacher?.teacherName} {currentTeacher?.department ? `• ${currentTeacher.department}` : ''}
              </h3>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 flex-wrap">
            {/* Search filter */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter teacher by name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium outline-none"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Teaching Depts ({academicTeachers.length})</option>
              {SCHOOL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Teacher Dropdown */}
            <div className="flex-1 min-w-[220px] max-w-sm">
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
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Teacher Request Permission Workflow Button */}
          {isTeacher && (
            <div>
              {isTimetableLockedForUser ? (
                currentTeacher?.editPermissionStatus === 'REQUEST_PENDING' ? (
                  <div className="px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Unlock Request Pending Admin Approval</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRequestPermissionModal(true)}
                    className="px-4 py-2 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Request Unlock from Admin</span>
                  </button>
                )
              ) : (
                <div className="px-3.5 py-2 text-xs font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-1.5">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Timetable Editable (Click any cell to edit)</span>
                </div>
              )}
            </div>
          )}

          {/* Admin Timetable Lock/Unlock Control Button */}
          {!isTeacher && (
            <button
              onClick={() => setShowAdminPermissionManagerModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Lock / Unlock Approvals</span>
              {teachers.some((t) => t.editPermissionStatus === 'REQUEST_PENDING') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          )}

          {/* Discard changes button (for Admin OR Teacher with edit access) */}
          {(!isTeacher || canTeacherEdit) && isDirty && (
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Discard
            </button>
          )}

          {/* Save timetable button (for Admin OR Teacher with edit access) */}
          {(!isTeacher || canTeacherEdit) && (
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
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
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

                {!isTeacher && (
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
                )}

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
      {/* TODAY'S ACTIVE DUTIES & TIMETABLE ARRANGEMENTS SECTION                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Assigned Round Duties & Mobile QR Check-In */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center font-bold text-sm">
                🛡️
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Assigned Round Duty (Campus Patrol)
                </h4>
                <p className="text-[10px] text-slate-400">Scheduled by Timetable & Discipline In-Charge</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
              {teacherRoundDuties.length} Duty Assigned
            </span>
          </div>

          {teacherRoundDuties.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-500 italic">
              No round duty assigned for this teacher today.
            </div>
          ) : (
            <div className="space-y-2">
              {teacherRoundDuties.map((duty) => (
                <div
                  key={duty.id}
                  className="p-3.5 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-600 text-white">
                        Period {duty.periodNumber} ({duty.day})
                      </span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {duty.location}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Time Slot: <strong>{duty.timeSlot}</strong>
                      {duty.checkInTime && (
                        <span className="ml-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Verified at {duty.checkInTime}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* QR Scan Action Button */}
                  <div className="shrink-0">
                    {duty.status === 'Completed' || duty.status === 'Checked In' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Duty Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenQrScanner(duty)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Scan Mobile QR</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Assigned Substitution Arrangements (From Timetable Dept) */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Substitution Arrangements Assigned
                </h4>
                <p className="text-[10px] text-slate-400">Class coverage assigned by Timetable Department</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
              {teacherSubstitutions.length} Active Sub
            </span>
          </div>

          {teacherSubstitutions.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-500 italic">
              No substitution classes assigned to this teacher today.
            </div>
          ) : (
            <div className="space-y-2">
              {teacherSubstitutions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-600 text-white">
                        Period {sub.periodNumber} ({sub.timeSlot})
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        🏫 {sub.classSection} ({sub.subject})
                      </strong>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      In place of: <strong className="text-rose-600">{sub.absentTeacherName}</strong> (Absent / On Leave)
                      {sub.remarks && <span className="text-slate-400 ml-1.5">• {sub.remarks}</span>}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 shrink-0">
                    ✓ {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALLOCATED SUBJECTS ACTION BAR (Staff Registry) */}
      {!isTeacher && (
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
      )}

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
            {isTeacher
              ? isTimetableLockedForUser
                ? '🔒 Read-Only Personal Schedule (Locked by School Admin)'
                : '🔓 Personal Schedule (Edit Permission Active • Unlocked)'
              : '💡 Tip: Click on any period box to assign or change class & subject'}
          </span>
        </div>

        {/* MATRIX TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
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

                      // Check if there is an active round duty or substitution for this cell
                      const activeDutyForCell = teacherRoundDuties.find(
                        (r) => r.day === day && r.periodNumber === periodNo
                      );
                      const activeSubForCell = teacherSubstitutions.find(
                        (s) => s.periodNumber === periodNo
                      );

                      const canClickCell = !isEditing && (!isTeacher || canTeacherEdit);

                      return (
                        <td
                          key={periodNo}
                          onClick={() => canClickCell && handleCellClick(day, periodNo)}
                          className={`p-2 border dark:border-slate-800 text-center align-middle transition-all relative min-h-[65px] ${
                            !canClickCell ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isEditing
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 ring-2 ring-indigo-500 z-10'
                              : activeDutyForCell
                              ? 'bg-amber-50/80 dark:bg-amber-950/30'
                              : activeSubForCell
                              ? 'bg-purple-50/80 dark:bg-purple-950/30'
                              : value
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/60'
                              : 'bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-100/40'
                          }`}
                        >
                          {isEditing ? (
                            /* INLINE STRUCTURED CELL EDITOR */
                            <div
                              className="space-y-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-400 dark:border-indigo-600 shadow-2xl min-w-[210px]"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                              </div>

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
                                  className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 text-[10px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* DISPLAY CELL CONTENT WITH DUTY / SUB BADGES */
                            <div className="space-y-1">
                              {/* Round Duty Overlay Badge */}
                              {activeDutyForCell && (
                                <div className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black tracking-tight shadow-xs flex items-center justify-center gap-0.5">
                                  <span>🛡️ Duty:</span>
                                  <span className="truncate max-w-[80px]">{activeDutyForCell.location}</span>
                                </div>
                              )}

                              {/* Substitution Overlay Badge */}
                              {activeSubForCell && (
                                <div className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black tracking-tight shadow-xs flex items-center justify-center gap-0.5">
                                  <span>⚡ Sub:</span>
                                  <span className="truncate max-w-[80px]">{activeSubForCell.classSection}</span>
                                </div>
                              )}

                              {value ? (
                                <div className="space-y-0.5">
                                  <div className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200 leading-tight break-words">
                                    {value}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                                  FREE
                                </span>
                              )}
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

      {/* ========================================================================= */}
      {/* MOBILE QR SCANNER SIMULATION MODAL (FOR ROUND DUTY CHECK-IN)               */}
      {/* ========================================================================= */}
      {activeQrScanDuty && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Mobile QR Duty Scanner</h3>
                  <p className="text-[11px] text-slate-400">Location: {activeQrScanDuty.location}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveQrScanDuty(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center justify-center cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* SCANNING CAMERA VIEWPORT */}
            <div className="relative bg-slate-950 rounded-2xl border-2 border-indigo-500/50 p-6 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
              {/* Corner Targets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-indigo-400"></div>
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-indigo-400"></div>
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-indigo-400"></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-indigo-400"></div>

              {/* Laser Scan Line Animation */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse"></div>

              <div className="text-center space-y-2 relative z-10">
                <QrCode className="w-16 h-16 text-indigo-400 mx-auto animate-bounce" />
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  Target: [{activeQrScanDuty.location} QR Code]
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Period {activeQrScanDuty.periodNumber} • {activeQrScanDuty.timeSlot}
                </span>
              </div>
            </div>

            {/* ACTION OPTIONS: ON-TIME SCAN VS CLASSROOM OBSERVATION */}
            {qrScanStep === 'ACTION_CHOICE' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleConfirmQrCheckIn(activeQrScanDuty, false)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Scan QR Code (On Time • All Present)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrScanStep('REMARK_FORM')}
                  className="w-full py-2.5 bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl border border-amber-500/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>⚠️ Scan QR & Submit Classroom Observation Remark</span>
                </button>
              </div>
            )}

            {/* REMARK OBSERVATION FORM */}
            {qrScanStep === 'REMARK_FORM' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Observed Class / Room</label>
                  <select
                    value={selectedObsClass}
                    onChange={(e) => setSelectedObsClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    {MASTER_CLASSES.slice(4).map((c) => (
                      <option key={c} value={`${c}-A`}>{c}-A</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Issue / Observation Type</label>
                  <select
                    value={selectedDelayType}
                    onChange={(e) => setSelectedDelayType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="Teacher Delayed (>10 mins)">Teacher Delayed (&gt;10 mins)</option>
                    <option value="Unattended Classroom">Unattended Classroom / Teacher Absent</option>
                    <option value="Discipline / Corridor Noise">Discipline / Corridor Noise</option>
                    <option value="Other">Other Specific Observation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Custom Note for Principal</label>
                  <input
                    type="text"
                    placeholder="Enter observation details..."
                    value={customObsMessage}
                    onChange={(e) => setCustomObsMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQrScanStep('ACTION_CHOICE')}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmQrCheckIn(activeQrScanDuty, true)}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRINT TIMETABLE MODAL */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Faculty Timetable - ${currentTeacher?.teacherName}`}
      >
        <div className="p-6 space-y-6 text-slate-900 bg-white">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-black">G.D. GOENKA PUBLIC SCHOOL</h2>
            <p className="text-xs text-slate-600">Official Teacher Weekly Schedule</p>
            <div className="mt-2 text-sm font-bold text-indigo-950">
              Teacher: {currentTeacher?.teacherName} • Department: {currentTeacher?.department || 'Academics'}
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs border">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-2 border font-black text-center">Day</th>
                {TIMETABLE_PERIODS.map((p) => (
                  <th key={p} className="p-2 border font-black text-center">P{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_DAYS.map((d) => (
                <tr key={d} className="border-b">
                  <td className="p-2 border font-black bg-slate-50 text-center">{d}</td>
                  {TIMETABLE_PERIODS.map((p) => {
                    const key = `${d}_${p}`;
                    const val = localSchedule[key] || '';
                    return (
                      <td key={p} className="p-2 border text-center font-semibold">
                        {val || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* TEACHER REQUEST EDIT PERMISSION MODAL */}
      {showRequestPermissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Request Timetable Edit Permission
                  </h3>
                  <p className="text-[11px] text-slate-400">Admin Approval Required for Modifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestPermissionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-900 dark:text-amber-200 text-xs">
                🔒 <strong>Notice:</strong> Timetables are locked by default to prevent scheduling conflicts. Submitting this request sends an immediate notification to the Principal and Timetable Admin.
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Timetable Modification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={permissionReasonInput}
                  onChange={(e) => setPermissionReasonInput(e.target.value)}
                  placeholder="e.g. Swapping Friday Period 3 with Class 10 Physics practical, or room reassignment..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowRequestPermissionModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTeacherSubmitPermissionRequest}
                className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-98 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PERMISSION APPROVAL & LOCK MANAGEMENT MODAL */}
      {showAdminPermissionManagerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  🛡️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Faculty Timetable Lock & Approval Manager
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control individual teacher editing permissions or enforce institute-wide timetable lock
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminPermissionManagerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Faculty</span>
                  <strong className="text-lg font-black text-slate-900 dark:text-white">{academicTeachers.length}</strong>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending Requests</span>
                  <strong className="text-lg font-black text-amber-600">
                    {teachers.filter((t) => t.editPermissionStatus === 'REQUEST_PENDING').length}
                  </strong>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Unlocked / Granted</span>
                  <strong className="text-lg font-black text-emerald-600">
                    {teachers.filter((t) => t.editPermissionStatus === 'EDIT_GRANTED' || t.isLocked === false).length}
                  </strong>
                </div>
              </div>

              {/* Faculty Permission List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Faculty Timetable Permissions & Access Requests
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {academicTeachers.map((tch) => {
                    const isPending = tch.editPermissionStatus === 'REQUEST_PENDING';
                    const isGranted = tch.editPermissionStatus === 'EDIT_GRANTED' || tch.isLocked === false;

                    return (
                      <div
                        key={tch.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                          isPending ? 'bg-amber-50/60 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-slate-900 dark:text-white font-bold text-sm">
                              👨‍🏫 {tch.teacherName}
                            </strong>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {tch.department || 'Academics'}
                            </span>
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 animate-pulse">
                                ⚠️ Request Pending Approval
                              </span>
                            )}
                            {isGranted && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                🔓 Unlocked
                              </span>
                            )}
                          </div>

                          {tch.permissionRequestReason && isPending && (
                            <p className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded-xl border border-amber-200/60 dark:border-amber-800/50">
                              <strong>Reason:</strong> "{tch.permissionRequestReason}"
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Requested at: {tch.permissionRequestedAt || 'Recently'}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Lock / Unlock Toggle Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isGranted ? (
                            <button
                              type="button"
                              onClick={() => handleAdminToggleLockStatus(tch, false)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Lock Timetable
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAdminToggleLockStatus(tch, true)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              Grant Edit Access (24 hrs)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAdminPermissionManagerModal(false)}
                className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
