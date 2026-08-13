import React, { useState } from 'react';
import { useLessonPlanStore, LessonPlan } from './lessonPlanStore';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Eye,
  Check,
  Building,
  GraduationCap,
  Printer
} from 'lucide-react';
import { PrintModal } from '../../components/PrintModal';

export const LessonPlansModule: React.FC = () => {
  const { plans, alerts, updateLessonPlanStatus, updateLessonPlan, addLessonPlan, sendAlertToTeacher } = useLessonPlanStore();
  const { staff } = useOtherModulesStore();
  const { activeRole, currentUser, logActivity } = useAuth();

  const isTeacherOnly = activeRole.toLowerCase().includes('teacher') && !['Super Admin', 'School Admin', 'Principal', 'Supervisor', 'Examination Incharge'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'teacher_entry' | 'principal_view' | 'communication_log'>(
    isTeacherOnly ? 'teacher_entry' : 'principal_view'
  );

  React.useEffect(() => {
    if (isTeacherOnly) {
      setActiveTab('teacher_entry');
    }
  }, [isTeacherOnly]);

  // Teacher Form State
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [teacherName, setTeacherName] = useState('Poonam Singh');
  const [teacherRole, setTeacherRole] = useState('TGT Science');

  const handleSelectTeacher = (name: string) => {
    setTeacherName(name);
    const found = staff.find((s) => s.fullName.toLowerCase() === name.toLowerCase());
    if (found) {
      setTeacherRole(found.designation);
    }
  };
  const [topic, setTopic] = useState('Ray Diagrams & Lens Formula Numerical Exercises');
  const [targetWeek, setTargetWeek] = useState('Week 12 (May Week 1)');
  const [targetDate, setTargetDate] = useState('2026-05-05');
  const [periodsRequired, setPeriodsRequired] = useState(10);
  const [status, setStatus] = useState<'COMPLETED_ON_TIME' | 'NOT_COMPLETED_ON_TIME' | 'IN_PROGRESS'>('NOT_COMPLETED_ON_TIME');
  const [remarks, setRemarks] = useState('Requires 4 additional lab periods to complete numericals.');

  // Search & Filter state for Principal View
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'Pre-Primary' | 'Junior' | 'Middle' | 'Senior'>('ALL');
  const [expandedTileId, setExpandedTileId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Inspector Modal state for Red (Incomplete) Plans or direct alert
  const [inspectingPlan, setInspectingPlan] = useState<LessonPlan | null>(null);
  const [alertMessageText, setAlertMessageText] = useState('Come and meet in the office regarding class syllabus delay.');
  const [alertSuccessToast, setAlertSuccessToast] = useState<string | null>(null);

  // Quick Preset Alerts
  const quickAlertTemplates = [
    'Come and meet in the office regarding syllabus status.',
    'Complete this lesson plan immediately and update periods required.',
    'Please schedule extra zero-period classes to cover the delay.',
    'Submit updated practical logbook by end of day.'
  ];

  const handleTeacherSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a valid lesson topic.');
      return;
    }

    // Determine group based on selected class
    let teacherGroup: 'Pre-Primary' | 'Junior' | 'Middle' | 'Senior' = 'Senior';
    if (selectedClass.startsWith('PG') || selectedClass.startsWith('Nursery') || selectedClass.startsWith('LKG') || selectedClass.startsWith('UKG')) {
      teacherGroup = 'Pre-Primary';
    } else if (selectedClass.includes('1-') || selectedClass.includes('2-') || selectedClass.includes('3-') || selectedClass.includes('4-') || selectedClass.includes('5-')) {
      teacherGroup = 'Junior';
    } else if (selectedClass.includes('6-') || selectedClass.includes('7-') || selectedClass.includes('8-')) {
      teacherGroup = 'Middle';
    }

    // Check if plan exists for this class + subject
    const existing = plans.find((p) => p.className === selectedClass && p.subject === selectedSubject);
    if (existing) {
      updateLessonPlan(existing.id, {
        teacherName,
        teacherRole,
        teacherGroup,
        topic,
        targetWeek,
        targetCompletionDate: targetDate,
        status,
        periodsRequired,
        periodsCompleted: status === 'COMPLETED_ON_TIME' ? periodsRequired : Math.floor(periodsRequired / 2),
        lastUpdatedBy: currentUser.name || teacherName,
        remarks
      });
    } else {
      addLessonPlan({
        className: selectedClass,
        subject: selectedSubject,
        teacherName,
        teacherRole,
        teacherGroup,
        topic,
        targetWeek,
        targetCompletionDate: targetDate,
        status,
        periodsRequired,
        periodsCompleted: status === 'COMPLETED_ON_TIME' ? periodsRequired : Math.floor(periodsRequired / 2),
        lastUpdatedBy: currentUser.name || teacherName,
        remarks
      });
    }

    logActivity(
      'LESSON_PLAN_UPDATE',
      'LessonPlans',
      `Updated lesson plan for ${selectedClass} ${selectedSubject}: ${topic} (${status})`
    );

    setAlertSuccessToast(`🟢 Lesson Plan for ${selectedClass} (${selectedSubject}) saved to Cloud Database!`);
    setTimeout(() => setAlertSuccessToast(null), 5000);
  };

  const handleSendAlert = (plan: LessonPlan) => {
    if (!alertMessageText.trim()) return;

    sendAlertToTeacher(
      plan.id,
      plan.teacherName,
      plan.className,
      plan.subject,
      alertMessageText,
      'Principal'
    );

    logActivity(
      'PRINCIPAL_ALERT_SENT',
      'Communication',
      `Sent alert to ${plan.teacherName} (${plan.className} - ${plan.subject}): "${alertMessageText}"`
    );

    setAlertSuccessToast(`Alert sent to ${plan.teacherName}!`);
    setTimeout(() => setAlertSuccessToast(null), 3500);
  };

  // Filtered plans for Principal Dashboard
  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'GREEN' && p.status === 'COMPLETED_ON_TIME') ||
      (statusFilter === 'RED' && p.status === 'NOT_COMPLETED_ON_TIME') ||
      (statusFilter === 'IN_PROGRESS' && p.status === 'IN_PROGRESS');

    const matchesGroup = groupFilter === 'ALL' || p.teacherGroup === groupFilter;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const completedCount = plans.filter((p) => p.status === 'COMPLETED_ON_TIME').length;
  const delayedCount = plans.filter((p) => p.status === 'NOT_COMPLETED_ON_TIME').length;
  const inProgressCount = plans.filter((p) => p.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Lesson Plans & Syllabus Completion Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Teacher topic scheduling, weekly completion tracking, Principal syllabus oversight, and alert dispatch.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {!isTeacherOnly && (
            <button
              onClick={() => setActiveTab('principal_view')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'principal_view'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Principal Syllabus View
            </button>
          )}

          <button
            onClick={() => setActiveTab('teacher_entry')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'teacher_entry'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Teacher Lesson Entry
          </button>

          {!isTeacherOnly && (
            <button
              onClick={() => setActiveTab('communication_log')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
                activeTab === 'communication_log'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>Alerts Log</span>
              {alerts.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full">
                  {alerts.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {alertSuccessToast && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-100" /> {alertSuccessToast}
          </span>
          <button onClick={() => setAlertSuccessToast(null)} className="text-white hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. PRINCIPAL SYLLABUS OVERVIEW VIEW */}
      {/* ==================================================================== */}
      {activeTab === 'principal_view' && (
        <div className="space-y-6">
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Lesson Topics</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{plans.length}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center gap-4 bg-emerald-50/20">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Completed On Time</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm flex items-center gap-4 bg-red-50/20">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Not Completed / Delayed</span>
                <div className="text-2xl font-black text-red-600 dark:text-red-400">{delayedCount}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-4 bg-amber-50/20">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">In Progress</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</div>
              </div>
            </div>
          </div>

          {/* Teacher Group / Wing Selector Categorization Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500 text-white">
                  Principal Central Oversight Matrix
                </span>
                <h3 className="text-base font-black text-white mt-1 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-400" />
                  All Teachers & Class Sections Syllabus Tile Grid
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Click any section tile to expand syllabus details. 🔴 Red tiles expand for delay inspection & summons.
              </p>
            </div>

            {/* Categorization Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setGroupFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🌟 All Classes (PG to 12th) ({plans.length})</span>
              </button>

              <button
                onClick={() => setGroupFilter('Pre-Primary')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Pre-Primary'
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🧸 Pre-Primary (PG - UKG)</span>
              </button>

              <button
                onClick={() => setGroupFilter('Junior')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Junior'
                    ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🐣 Junior (Classes 1 - 5)</span>
              </button>

              <button
                onClick={() => setGroupFilter('Middle')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Middle'
                    ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🎒 Middle (Classes 6 - 8)</span>
              </button>

              <button
                onClick={() => setGroupFilter('Senior')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Senior'
                    ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🎓 Senior (Classes 9 - 12)</span>
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter section, topic, or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="GREEN">🟢 Green (Syllabus Completed)</option>
                <option value="RED">🔴 Red (Syllabus Incomplete / Delayed)</option>
                <option value="IN_PROGRESS">🟡 Yellow (In Progress)</option>
              </select>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <Printer className="w-4 h-4" /> Print Matrix Report
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              📱 <strong>Matrix View:</strong> Showing <strong>{filteredPlans.length}</strong> class section tiles on screen.
            </p>
          </div>

          {/* Scrollable Small Tile Grid */}
          <div className="max-h-[680px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPlans.map((plan, idx) => {
                const isGreen = plan.status === 'COMPLETED_ON_TIME';
                const isRed = plan.status === 'NOT_COMPLETED_ON_TIME';
                const isExpanded = expandedTileId === plan.id;

                return (
                  <div
                    key={`${plan.id}-${idx}`}
                    onClick={() => setExpandedTileId(isExpanded ? null : plan.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isExpanded
                        ? 'col-span-2 sm:col-span-3 md:col-span-2 ring-2 ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl'
                        : isGreen
                        ? 'bg-[#d4f15d] text-slate-950 border-2 border-[#82cc00] shadow-md hover:shadow-xl hover:scale-[1.02]'
                        : isRed
                        ? 'bg-[#ffe6e8] text-rose-950 border-2 border-pink-300 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-800 shadow-md hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-amber-100 text-amber-950 border-2 border-amber-300 dark:bg-amber-950/80 dark:text-amber-100 dark:border-amber-700 hover:shadow-md'
                    }`}
                  >
                    {/* Compact Tile View */}
                    {!isExpanded ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-black text-xs px-2 py-0.5 rounded-lg border shadow-xs ${
                            isGreen
                              ? 'bg-slate-900 text-[#d4f15d] border-slate-800'
                              : isRed
                              ? 'bg-rose-900 text-pink-100 border-rose-700'
                              : 'bg-amber-900 text-amber-100 border-amber-700'
                          }`}>
                            {plan.className}
                          </span>
                          {isGreen && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
                          {isRed && <XCircle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />}
                          {!isGreen && !isRed && <Clock className="w-5 h-5 text-amber-700 shrink-0" />}
                        </div>

                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-wide ${
                            isGreen ? 'text-emerald-900' : isRed ? 'text-rose-900 dark:text-pink-300' : 'text-amber-900'
                          }`}>
                            {plan.subject}
                          </p>
                          <p className="text-xs font-black truncate mt-0.5">
                            {plan.teacherName}
                          </p>
                        </div>

                        {/* Planning Date (Left) & Target Date (Right) Matching Layout */}
                        <div className="py-1 px-1.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 text-[10px]">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <span className="opacity-70">Plan:</span>
                              <strong className="underline decoration-dotted">{plan.planStartDate || '01 Apr'}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="opacity-70">Target:</span>
                              <strong className="underline">{plan.targetCompletionDate || '15 Apr'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-black/10 flex items-center justify-between text-[10px]">
                          <span className="font-bold opacity-80">
                            {plan.periodsCompleted}/{plan.periodsRequired} Pds
                          </span>
                          <span className={`font-black uppercase px-2 py-0.5 rounded shadow-xs text-[9px] ${
                            isGreen
                              ? 'bg-[#70e000] text-slate-950 font-black border border-[#38b000]'
                              : isRed
                              ? 'bg-rose-300 text-rose-950 font-black border border-rose-400'
                              : 'bg-amber-300 text-amber-950 font-black border border-amber-400'
                          }`}>
                            {isGreen ? 'PARROT GREEN' : isRed ? 'LIGHT PINK' : 'IN PROGRESS'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Expanded Section Tile View */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-indigo-600 text-white font-black text-xs rounded-xl shadow">
                              {plan.className}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              {plan.subject}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTileId(null);
                            }}
                            className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                          >
                            ✕ Close
                          </button>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="w-4 h-4 text-indigo-500" />
                            <span>Faculty: {plan.teacherName}</span>
                            <span className="text-[10px] font-normal text-slate-500">({plan.teacherRole})</span>
                          </p>

                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Complete Topic Syllabus:</span>
                            <p className="font-bold text-slate-900 dark:text-white">{plan.topic}</p>
                            <p className="text-[11px] text-slate-500">Target Week: <strong>{plan.targetWeek}</strong></p>
                          </div>
                        </div>

                        {/* Direct Toggle Status Bar */}
                        <div className="p-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-2">
                          <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase block">
                            Toggle Status Directly:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLessonPlanStatus(plan.id, 'COMPLETED_ON_TIME', plan.periodsRequired, 'Principal', 'Marked completed by Principal');
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                                isGreen ? 'bg-emerald-600 text-white border-emerald-700 shadow' : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Green (Completed)
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLessonPlanStatus(plan.id, 'NOT_COMPLETED_ON_TIME', plan.periodsRequired, 'Principal', 'Marked delayed by Principal');
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                                isRed ? 'bg-red-600 text-white border-red-700 shadow' : 'bg-white text-red-800 border-red-300 hover:bg-red-50'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Red (Incomplete)
                            </button>
                          </div>
                        </div>

                        {/* Send Summons Alert */}
                        {isRed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingPlan(plan);
                            }}
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Summon Teacher / Send Delay Alert</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. TEACHER LESSON ENTRY & STATUS UPDATE (SECTION 1 & SECTION 2) */}
      {/* ==================================================================== */}
      {activeTab === 'teacher_entry' && (
        <div className="space-y-6">
          {/* TEACHER ASSIGNED CLASSES & SUBJECTS CARD MATRIX */}
          {(() => {
            const currentStaff = staff.find((s) => s.fullName.toLowerCase() === teacherName.toLowerCase());
            const assignedList: { className: string; subject: string }[] = [];

            if (currentStaff?.assignedAllocations && currentStaff.assignedAllocations.length > 0) {
              currentStaff.assignedAllocations.forEach((item) => {
                assignedList.push({ className: item.className, subject: item.subject });
              });
            } else if (currentStaff?.assignedClasses && currentStaff.assignedClasses.length > 0) {
              const subjs = currentStaff.assignedSubjects || ['Physics', 'Mathematics'];
              currentStaff.assignedClasses.forEach((c) => {
                subjs.forEach((s) => assignedList.push({ className: c, subject: s }));
              });
            } else if (currentStaff?.classTeacherOf && currentStaff.classTeacherOf !== 'None') {
              assignedList.push({ className: currentStaff.classTeacherOf, subject: 'Science & Tech' });
            } else {
              assignedList.push(
                { className: 'Class 10-A', subject: 'Physics' },
                { className: 'Class 10-B', subject: 'Physics' },
                { className: 'Class 11-A', subject: 'Science & Tech' }
              );
            }

            return (
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-700 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-extrabold text-sm text-white">
                      Assigned Classes & Syllabus Subjects for {teacherName}
                    </h3>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-bold bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700">
                    {assignedList.length} Allocated Class-Subject Pair{assignedList.length > 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-xs text-indigo-200">
                  Click any assigned class card to view syllabus, target dates, and update completion status to the Principal:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {assignedList.map((item, idx) => {
                    const isCurrent = selectedClass === item.className && selectedSubject === item.subject;
                    const matchedPlan = plans.find((p) => p.className === item.className && p.subject === item.subject);
                    const isGreen = matchedPlan?.status === 'COMPLETED_ON_TIME';
                    const isRed = matchedPlan?.status === 'NOT_COMPLETED_ON_TIME';

                    return (
                      <button
                        key={`${item.className}-${item.subject}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedClass(item.className);
                          setSelectedSubject(item.subject);
                          if (matchedPlan) {
                            setTopic(matchedPlan.topic);
                            setTargetWeek(matchedPlan.targetWeek);
                            setTargetDate(matchedPlan.targetCompletionDate || '2026-05-05');
                            setPeriodsRequired(matchedPlan.periodsRequired);
                            setStatus(matchedPlan.status);
                            setRemarks(matchedPlan.remarks || '');
                          }
                          setAlertSuccessToast(`Loaded ${item.className} - ${item.subject} Syllabus Lesson Plan`);
                          setTimeout(() => setAlertSuccessToast(null), 3000);
                        }}
                        className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-white shadow-lg ring-2 ring-indigo-300 scale-[1.02]'
                            : isGreen
                            ? 'bg-emerald-950/80 text-emerald-100 border-emerald-600 hover:bg-emerald-900'
                            : isRed
                            ? 'bg-rose-950/80 text-rose-100 border-rose-600 hover:bg-rose-900'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-black/40 border border-white/20">
                            {item.className}
                          </span>
                          {isGreen ? (
                            <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-900/90 px-1.5 py-0.5 rounded">
                              ✓ Completed
                            </span>
                          ) : isRed ? (
                            <span className="text-[10px] font-black uppercase text-rose-300 bg-rose-900/90 px-1.5 py-0.5 rounded animate-pulse">
                              ✕ Incomplete
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded">
                              ⏳ In Progress
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <h4 className="font-extrabold text-xs">{item.subject}</h4>
                          <p className="text-[10px] opacity-80 truncate mt-0.5">
                            {matchedPlan ? matchedPlan.topic : 'Click to write lesson plan'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* SECTION 1: PLAN LESSON */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  SECTION 1
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Plan Lesson (Chapter, Class, Syllabus & Target Dates)
                </h3>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Interlinked with Staff Directory & Class Allocations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SELECT TEACHER */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  1. Select Teacher
                </label>
                <select
                  value={teacherName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setTeacherName(name);
                    const found = staff.find((s) => s.fullName.toLowerCase() === name.toLowerCase());
                    if (found) {
                      setTeacherRole(found.designation);
                      if (found.assignedClasses && found.assignedClasses.length > 0) {
                        setSelectedClass(found.assignedClasses[0]);
                      }
                      const assignedList = [
                        ...(found.assignedSubjects || []),
                        ...(found.assignedAllocations?.map(a => a.subject) || [])
                      ].filter(Boolean);
                      if (assignedList.length > 0) {
                        setSelectedSubject(assignedList[0]);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  {staff.map((stf, idx) => (
                    <option key={`${stf.id}-${idx}`} value={stf.fullName}>
                      {stf.fullName} {stf.status === 'Absent' ? '🔴 (Absent)' : '🟢'} — [{stf.designation}]
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT CLASS (FILTERS TEACHER) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  2. Select Class & Section
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    const cls = e.target.value;
                    setSelectedClass(cls);
                    const allocTeacher = staff.find(s => s.assignedClasses?.includes(cls) || s.classTeacherOf === cls);
                    if (allocTeacher) {
                      setTeacherName(allocTeacher.fullName);
                      setTeacherRole(allocTeacher.designation);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 10-B">Class 10-B</option>
                  <option value="Class 9-A">Class 9-A</option>
                  <option value="Class 8-A">Class 8-A</option>
                  <option value="Class 7-A">Class 7-A</option>
                  <option value="Class 6-A">Class 6-A</option>
                  <option value="Class 12-A">Class 12-A</option>
                  <option value="Class 11-A">Class 11-A</option>
                  <option value="PG-A">PG-A (Pre-Primary)</option>
                  <option value="Nursery-A">Nursery-A</option>
                  <option value="LKG-A">LKG-A</option>
                  <option value="UKG-A">UKG-A</option>
                </select>
              </div>

              {/* SELECT SUBJECT WITH TEACHER ASSIGNED SUBJECT HIGHLIGHTING */}
              <div>
                {(() => {
                  const currentStaff = staff.find((s) => s.fullName.toLowerCase() === teacherName.toLowerCase());
                  const assignedSubjectsList = Array.from(new Set([
                    ...(currentStaff?.assignedSubjects || []),
                    ...(currentStaff?.assignedAllocations?.map(a => a.subject) || []),
                    'Mathematics', 'Physics', 'Chemistry', 'Science & Tech', 'English', 'Hindi', 'Computer Science', 'Social Studies'
                  ].filter(Boolean)));

                  const teacherDirectlyAssigned = Array.from(new Set([
                    ...(currentStaff?.assignedSubjects || []),
                    ...(currentStaff?.assignedAllocations?.map(a => a.subject) || [])
                  ].filter(Boolean)));

                  return (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        3. Select Subject (Assigned Subjects Highlighted)
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => {
                          const subj = e.target.value;
                          setSelectedSubject(subj);
                          if (subj === 'Mathematics') setTopic('Quadratic Equations, Factorization & Discriminant Formula');
                          else if (subj === 'Physics') setTopic('Light Reflection, Refraction, Ray Diagrams & Lens Formula');
                          else if (subj === 'Chemistry') setTopic('Chemical Reactions, Balancing Equations & Oxidation');
                          else if (subj === 'English') setTopic('Direct-Indirect Speech, Tenses & Letter Writing');
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                      >
                        {teacherDirectlyAssigned.length > 0 && (
                          <optgroup label="⭐ TEACHER ALLOCATED SUBJECTS">
                            {teacherDirectlyAssigned.map((sub) => (
                              <option key={`assigned-${sub}`} value={sub}>
                                ⭐ {sub} (Assigned to {teacherName})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="ALL SCHOOL SUBJECTS">
                          {assignedSubjectsList
                            .filter(sub => !teacherDirectlyAssigned.includes(sub))
                            .map((sub) => (
                              <option key={`all-${sub}`} value={sub}>
                                {sub}
                              </option>
                            ))}
                        </optgroup>
                      </select>

                      {teacherDirectlyAssigned.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-slate-500 font-semibold">Assigned:</span>
                          {teacherDirectlyAssigned.map((sub) => (
                            <button
                              key={`badge-${sub}`}
                              type="button"
                              onClick={() => setSelectedSubject(sub)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold cursor-pointer transition-all ${
                                selectedSubject === sub
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100'
                              }`}
                            >
                              ⭐ {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* LESSON TOPIC & SYLLABUS DETAIL */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>4. Chapter Name & Syllabus Topic (Auto-loaded & Editable)</span>
                <span className="text-[10px] text-indigo-600 font-bold">Auto-suggested from Master Syllabus</span>
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter lesson chapter, topics, and practical scope..."
              />
            </div>

            {/* TARGET DATES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Planning Start Date
                </label>
                <input
                  type="date"
                  value="2026-04-01"
                  onChange={() => {}}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Week
                </label>
                <input
                  type="text"
                  value={targetWeek}
                  onChange={(e) => setTargetWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTeacherSave}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Planned Lesson to Syllabus Engine</span>
            </button>
          </div>

          {/* SECTION 2: STATUS UPDATE WITH INSTANT CLICK RESPONSE */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                SECTION 2
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Lesson Status Update & Principal Reporting (Click Feedback Enabled)
              </h3>
              <p className="text-xs text-slate-500">
                Click status buttons to instantly save feedback and update the Principal's central syllabus matrix.
              </p>
            </div>

            <form onSubmit={handleTeacherSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Completion Status (Clicking button updates status & database)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('COMPLETED_ON_TIME');
                        const existing = plans.find((p) => p.className === selectedClass && p.subject === selectedSubject);
                        if (existing) {
                          updateLessonPlanStatus(existing.id, 'COMPLETED_ON_TIME', periodsRequired, teacherName, remarks);
                        }
                        setAlertSuccessToast(`✓ Marked "${selectedClass} - ${selectedSubject}" as COMPLETED ON TIME! Saved in Database.`);
                        setTimeout(() => setAlertSuccessToast(null), 4000);
                      }}
                      className={`p-3 rounded-xl font-extrabold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        status === 'COMPLETED_ON_TIME'
                          ? 'bg-[#82cc00] text-slate-950 border-emerald-700 shadow-lg ring-4 ring-emerald-300 font-black'
                          : 'bg-slate-50 dark:bg-slate-800 text-emerald-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStatus('NOT_COMPLETED_ON_TIME');
                        const existing = plans.find((p) => p.className === selectedClass && p.subject === selectedSubject);
                        if (existing) {
                          updateLessonPlanStatus(existing.id, 'NOT_COMPLETED_ON_TIME', periodsRequired, teacherName, remarks);
                        }
                        setAlertSuccessToast(`✕ Marked "${selectedClass} - ${selectedSubject}" as NOT COMPLETED / DELAYED! Saved in Database.`);
                        setTimeout(() => setAlertSuccessToast(null), 4000);
                      }}
                      className={`p-3 rounded-xl font-extrabold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        status === 'NOT_COMPLETED_ON_TIME'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-lg ring-4 ring-rose-300 font-black'
                          : 'bg-slate-50 dark:bg-slate-800 text-rose-700 border-slate-200 hover:bg-rose-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Not Completed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStatus('IN_PROGRESS');
                        const existing = plans.find((p) => p.className === selectedClass && p.subject === selectedSubject);
                        if (existing) {
                          updateLessonPlanStatus(existing.id, 'IN_PROGRESS', periodsRequired, teacherName, remarks);
                        }
                        setAlertSuccessToast(`⏳ Marked "${selectedClass} - ${selectedSubject}" as IN PROGRESS! Saved in Database.`);
                        setTimeout(() => setAlertSuccessToast(null), 4000);
                      }}
                      className={`p-3 rounded-xl font-extrabold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        status === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-lg ring-4 ring-amber-200 font-black'
                          : 'bg-slate-50 dark:bg-slate-800 text-amber-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>In Progress</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {status === 'NOT_COMPLETED_ON_TIME' ? '🔴 Extra Days / Periods Needed' : 'Periods Required'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={periodsRequired}
                      onChange={(e) => setPeriodsRequired(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-extrabold text-slate-500 whitespace-nowrap">
                      {status === 'NOT_COMPLETED_ON_TIME' ? 'Extra Days Requested' : 'Total Periods'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Remarks / Explanation for Principal
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  placeholder="Explain status update, delay cause, or extra period requirement..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Submit Status Update to Principal Section</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. COMMUNICATION & ALERT LOGS */}
      {/* ==================================================================== */}
      {activeTab === 'communication_log' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Principal & Teacher Communication Log
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of office summons, alerts, and syllabus completion requests sent to teachers.
            </p>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No communication alerts recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alt, idx) => (
                <div
                  key={`${alt.id}-${idx}`}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {alt.sender} → {alt.teacherName}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {alt.className} ({alt.subject})
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      "{alt.message}"
                    </p>

                    <p className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {new Date(alt.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg shrink-0">
                    ✓ Delivered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* INSPECTOR MODAL FOR RED (INCOMPLETE) PLANS */}
      {/* ==================================================================== */}
      {inspectingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-red-300 dark:border-red-800 shadow-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-red-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-100" />
                <h3 className="font-extrabold text-base text-white">
                  Incomplete Syllabus Detail Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectingPlan(null)}
                className="text-white hover:opacity-80 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 space-y-2">
                <div className="flex items-center justify-between border-b border-red-200 dark:border-red-800/80 pb-2">
                  <span className="font-extrabold text-red-900 dark:text-red-200 text-sm">
                    {inspectingPlan.className} - {inspectingPlan.subject}
                  </span>
                  <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">
                    Not Completed On Time
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Topic: {inspectingPlan.topic}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-700 dark:text-slate-300">
                  <div>
                    <strong>Assigned Teacher:</strong> {inspectingPlan.teacherName} ({inspectingPlan.teacherRole})
                  </div>
                  <div>
                    <strong>Target Week:</strong> {inspectingPlan.targetWeek}
                  </div>
                  <div>
                    <strong>Periods Required:</strong> {inspectingPlan.periodsRequired}
                  </div>
                  <div>
                    <strong>Periods Completed:</strong> {inspectingPlan.periodsCompleted}
                  </div>
                </div>
              </div>

              {/* Alert Templates */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  Quick Alert Message to {inspectingPlan.teacherName}:
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {quickAlertTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAlertMessageText(tmpl)}
                      className="text-left p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      • "{tmpl}"
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={alertMessageText}
                  onChange={(e) => setAlertMessageText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setInspectingPlan(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    handleSendAlert(inspectingPlan);
                    setInspectingPlan(null);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Alert / Summons
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* PRINT MODAL FOR LESSON PLANS SYLLABUS MATRIX */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Syllabus Completion & Lesson Plan Progress Matrix"
        subtitle="Academic Session 2026-2027 • Principal & Coordinator Review"
      >
        <div className="space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase text-slate-900">
                School-Wide Syllabus Completion Status
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                Total Classes Tracked: {plans.length} • Green = Completed • Red = Incomplete / Delayed
              </p>
            </div>
            <div className="text-right text-xs font-bold">
              <span className="text-emerald-700">Completed: {plans.filter(p => p.status === 'COMPLETED_ON_TIME').length}</span> •{' '}
              <span className="text-rose-700">Incomplete: {plans.filter(p => p.status === 'NOT_COMPLETED_ON_TIME').length}</span>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 font-black">
                <th className="p-2 border border-slate-300">Class & Section</th>
                <th className="p-2 border border-slate-300">Subject</th>
                <th className="p-2 border border-slate-300">Assigned Teacher</th>
                <th className="p-2 border border-slate-300">Plan & Target Date</th>
                <th className="p-2 border border-slate-300">Periods (Done/Req)</th>
                <th className="p-2 border border-slate-300">Syllabus Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p, idx) => {
                const isGreen = p.status === 'COMPLETED_ON_TIME';
                const isRed = p.status === 'NOT_COMPLETED_ON_TIME';
                return (
                  <tr key={`${p.id}-${idx}`} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 font-black">{p.className}</td>
                    <td className="p-2 border border-slate-300 font-bold">{p.subject}</td>
                    <td className="p-2 border border-slate-300">{p.teacherName}</td>
                    <td className="p-2 border border-slate-300 font-mono text-[11px]">{p.planStartDate || '01 Apr'} - {p.targetCompletionDate || '15 Apr'}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{p.periodsCompleted} / {p.periodsRequired}</td>
                    <td className="p-2 border border-slate-300 text-center font-black uppercase">
                      {isGreen ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">GREEN (COMPLETED)</span>
                      ) : isRed ? (
                        <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold">RED (INCOMPLETE)</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">IN PROGRESS</span>
                      )}
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
