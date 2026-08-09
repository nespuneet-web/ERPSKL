import React, { useState } from 'react';
import { useLessonPlanStore, LessonPlan } from './lessonPlanStore';
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
  GraduationCap
} from 'lucide-react';

export const LessonPlansModule: React.FC = () => {
  const { plans, alerts, updateLessonPlanStatus, addLessonPlan, sendAlertToTeacher } = useLessonPlanStore();
  const { activeRole, currentUser, logActivity } = useAuth();

  const [activeTab, setActiveTab] = useState<'teacher_entry' | 'principal_view' | 'communication_log'>('principal_view');

  // Teacher Form State
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [teacherName, setTeacherName] = useState('POONAM SINGH');
  const [teacherRole, setTeacherRole] = useState('PGT Physics');
  const [topic, setTopic] = useState('Ray Diagrams & Lens Formula Numerical Exercises');
  const [targetWeek, setTargetWeek] = useState('Week 12 (May Week 1)');
  const [targetDate, setTargetDate] = useState('2026-05-05');
  const [periodsRequired, setPeriodsRequired] = useState(10);
  const [status, setStatus] = useState<'COMPLETED_ON_TIME' | 'NOT_COMPLETED_ON_TIME' | 'IN_PROGRESS'>('NOT_COMPLETED_ON_TIME');
  const [remarks, setRemarks] = useState('Requires 4 additional lab periods to complete numericals.');

  // Search & Filter state for Principal View
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'Junior' | 'Middle' | 'Senior'>('ALL');
  const [expandedTileId, setExpandedTileId] = useState<string | null>(null);

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
    let teacherGroup: 'Junior' | 'Middle' | 'Senior' = 'Senior';
    if (selectedClass.includes('1-') || selectedClass.includes('2-') || selectedClass.includes('3-') || selectedClass.includes('4-') || selectedClass.includes('5-')) {
      teacherGroup = 'Junior';
    } else if (selectedClass.includes('6-') || selectedClass.includes('7-') || selectedClass.includes('8-')) {
      teacherGroup = 'Middle';
    }

    // Check if plan exists for this class + subject
    const existing = plans.find((p) => p.className === selectedClass && p.subject === selectedSubject);
    if (existing) {
      updateLessonPlanStatus(
        existing.id,
        status,
        periodsRequired,
        currentUser.name || teacherName,
        remarks
      );
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

    alert(`✅ Lesson Plan for ${selectedClass} (${selectedSubject}) saved successfully!`);
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
                <span>🌟 All Teachers ({plans.length})</span>
              </button>

              <button
                onClick={() => setGroupFilter('Junior')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Junior'
                    ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🐣 Junior Teachers (Classes 1 - 5)</span>
              </button>

              <button
                onClick={() => setGroupFilter('Middle')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Middle'
                    ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🎒 Middle Teachers (Classes 6 - 8)</span>
              </button>

              <button
                onClick={() => setGroupFilter('Senior')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  groupFilter === 'Senior'
                    ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🎓 Senior Teachers (Classes 9 - 12)</span>
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
                <option value="GREEN">🟢 Completed On Time (Green)</option>
                <option value="RED">🔴 Not Completed On Time (Red)</option>
                <option value="IN_PROGRESS">🟡 In Progress</option>
              </select>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              📱 <strong>Matrix View:</strong> Showing <strong>{filteredPlans.length}</strong> class section tiles on screen.
            </p>
          </div>

          {/* Scrollable Small Tile Grid */}
          <div className="max-h-[680px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPlans.map((plan) => {
                const isGreen = plan.status === 'COMPLETED_ON_TIME';
                const isRed = plan.status === 'NOT_COMPLETED_ON_TIME';
                const isExpanded = expandedTileId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setExpandedTileId(isExpanded ? null : plan.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isExpanded
                        ? 'col-span-2 sm:col-span-3 md:col-span-2 ring-2 ring-indigo-500 bg-white dark:bg-slate-900 shadow-xl'
                        : isGreen
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 hover:shadow-md hover:border-emerald-500'
                        : isRed
                        ? 'bg-red-50/80 dark:bg-red-950/40 border-red-400 dark:border-red-700 shadow-sm hover:shadow-lg hover:border-red-600 animate-pulse'
                        : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 hover:shadow-md'
                    }`}
                  >
                    {/* Compact Tile View */}
                    {!isExpanded ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                            {plan.className}
                          </span>
                          {isGreen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isRed && <XCircle className="w-4 h-4 text-red-600 shrink-0 animate-bounce" />}
                          {!isGreen && !isRed && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                            {plan.subject}
                          </p>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                            {plan.teacherName}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-500">
                            {plan.periodsCompleted}/{plan.periodsRequired} Pds
                          </span>
                          <span className={`font-black uppercase px-1.5 py-0.5 rounded ${
                            isGreen ? 'bg-emerald-200 text-emerald-900' : isRed ? 'bg-red-200 text-red-900 font-extrabold' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {isGreen ? 'Green' : isRed ? 'Red' : 'In Prog'}
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
      {/* 2. TEACHER LESSON PLAN ENTRY & UPDATE FORM */}
      {/* ==================================================================== */}
      {activeTab === 'teacher_entry' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Teacher Lesson Plan Submission & Status Update
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your assigned class, pre-populate the syllabus topic, and submit completion status with periods required.
            </p>
          </div>

          <form onSubmit={handleTeacherSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 9-B">Class 9-B</option>
                  <option value="Class 12-A">Class 12-A</option>
                  <option value="Class 8-C">Class 8-C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science & Tech">Science & Tech</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={teacherRole}
                  onChange={(e) => setTeacherRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lesson Topic Name (Pre-populated / Customizable)
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                placeholder="Enter topic name and scope..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Week
                </label>
                <input
                  type="text"
                  value={targetWeek}
                  onChange={(e) => setTargetWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* THREE MANDATORY BUTTONS REQUIREMENT */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                Select Lesson Completion Status (Select One):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Button 1: On time completed */}
                <button
                  type="button"
                  onClick={() => setStatus('COMPLETED_ON_TIME')}
                  className={`p-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    status === 'COMPLETED_ON_TIME'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
                      : 'bg-white dark:bg-slate-800 text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>On time completed</span>
                </button>

                {/* Button 2: Not completed on time */}
                <button
                  type="button"
                  onClick={() => setStatus('NOT_COMPLETED_ON_TIME')}
                  className={`p-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    status === 'NOT_COMPLETED_ON_TIME'
                      ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                      : 'bg-white dark:bg-slate-800 text-red-700 border-red-300 hover:bg-red-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Not completed on time</span>
                </button>
              </div>

              {/* Button 3: Periods Required */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Specify Number of Periods Required to Cover Lesson:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={periodsRequired}
                  onChange={(e) => setPeriodsRequired(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Delay Explanation
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="Explain extra period requirement or lab needs..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit & Save Lesson Plan Status</span>
            </button>
          </form>
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
              {alerts.map((alt) => (
                <div
                  key={alt.id}
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
    </div>
  );
};
