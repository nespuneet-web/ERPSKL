import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Users,
  Bus,
  AlertTriangle,
  FileText,
  Paperclip,
  Eye,
  Check,
  Calendar,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  CreditCard,
  Trophy,
  Megaphone,
  X,
  ChevronRight,
  Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSisStore } from '../sis/sisStore';
import { useOtherModulesStore } from '../otherModules/otherStore';
import {
  CommunicationMessage,
  CommunicationCategory,
  CommunicationPriority,
  TransportAudienceFilter,
  COMMUNICATION_CHANNELS
} from '../../types/communication';
import { INITIAL_COMMUNICATION_MESSAGES } from '../../data/communicationData';

const STORAGE_COMMUNICATION_KEY = 'schoolerp_communication_messages_v2';

export const CommunicationModule: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const { students } = useSisStore();
  const { staff, routes } = useOtherModulesStore();

  const isTeacher = activeRole === 'Teacher' || activeRole === 'Class Teacher';
  const isAdmin = !isTeacher && activeRole !== 'Student' && activeRole !== 'Parent';
  const isStudentOrParent = activeRole === 'Student' || activeRole === 'Parent';

  // Master Communication Messages State (persisted in localStorage)
  const [messages, setMessages] = useState<CommunicationMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMMUNICATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load communication messages:', e);
    }
    return INITIAL_COMMUNICATION_MESSAGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMMUNICATION_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save communication messages:', e);
    }
  }, [messages]);

  // Channel Category Filter
  const [selectedChannel, setSelectedChannel] = useState<CommunicationCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'MY_MESSAGES' | 'TRANSPORT_ONLY'>('ALL');

  // Modal States
  const [isComposeModalOpen, setIsComposeModalOpen] = useState<boolean>(false);
  const [viewingAckMessage, setViewingAckMessage] = useState<CommunicationMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive logged-in teacher assigned classes
  const cleanUserName = (currentUser?.name || '').replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
  const currentStaff = staff.find(
    (s) => s.fullName.trim().toUpperCase() === cleanUserName || `stf-${s.id}` === currentUser?.id
  );

  const teacherAssignedClasses: string[] = [];
  if (currentStaff?.assignedAllocations && currentStaff.assignedAllocations.length > 0) {
    currentStaff.assignedAllocations.forEach((a) => {
      if (!teacherAssignedClasses.includes(a.className)) teacherAssignedClasses.push(a.className);
    });
  } else if (currentStaff?.assignedClasses && currentStaff.assignedClasses.length > 0) {
    teacherAssignedClasses.push(...currentStaff.assignedClasses);
  } else if (currentStaff?.classTeacherOf && currentStaff.classTeacherOf !== 'None') {
    teacherAssignedClasses.push(currentStaff.classTeacherOf);
  } else {
    teacherAssignedClasses.push('Class 10-A', 'Class 10-B');
  }

  // Compose Form State
  const [composeTitle, setComposeTitle] = useState<string>('');
  const [composeContent, setComposeContent] = useState<string>('');
  const [composeCategory, setComposeCategory] = useState<CommunicationCategory>(
    isTeacher ? 'CLASS_SECTION_UPDATE' : 'GENERAL_ANNOUNCEMENT'
  );
  const [composePriority, setComposePriority] = useState<CommunicationPriority>('Normal');
  const [composeTargetType, setComposeTargetType] = useState<'ALL_SCHOOL' | 'SECTION' | 'SPECIFIC_STUDENTS'>(
    isTeacher ? 'SECTION' : 'ALL_SCHOOL'
  );
  const [composeGrade, setComposeGrade] = useState<string>('Class 10');
  const [composeSection, setComposeSection] = useState<string>('A');
  const [composeSelectedStudentIds, setComposeSelectedStudentIds] = useState<string[]>([]);
  const [composeTransportFilter, setComposeTransportFilter] = useState<TransportAudienceFilter>('ALL');
  const [composeBusRouteNo, setComposeBusRouteNo] = useState<string>('ALL');
  const [composeAttachmentName, setComposeAttachmentName] = useState<string>('');

  // Available unique classes and sections
  const allClasses = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const allSections = ['A', 'B', 'C', 'D'];

  // Students in selected section for granular selection
  const sectionStudents = students.filter(
    (s) => s.currentClass === composeGrade && s.section === composeSection
  );

  // Handle Mark as Seen / Acknowledgment
  const handleMarkAsSeen = (msgId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedSeen = `${dateStr}, ${timeStr}`;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const alreadySeen = msg.acknowledgments.some(
            (ack) => ack.userId === currentUser.id || ack.userName.toLowerCase() === currentUser.name.toLowerCase()
          );
          if (alreadySeen) return msg;

          const newAck = {
            userId: currentUser.id || `usr-${Date.now()}`,
            userName: currentUser.name || 'Current User',
            userRole: activeRole || 'User',
            seenAt: formattedSeen,
            timestamp: new Date().toISOString()
          };

          return {
            ...msg,
            acknowledgments: [newAck, ...msg.acknowledgments]
          };
        }
        return msg;
      })
    );

    setToastMessage('✅ Communication marked as Seen & Acknowledged!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Send New Communication Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeContent.trim()) {
      alert('Please fill in both message title and content.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let targetStudentNames: string[] | undefined = undefined;
    if (composeTargetType === 'SPECIFIC_STUDENTS' && composeSelectedStudentIds.length > 0) {
      targetStudentNames = students
        .filter((s) => composeSelectedStudentIds.includes(s.id))
        .map((s) => `${s.fullName} (Roll ${s.rollNo})`);
    }

    const newMessage: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      title: composeTitle.trim(),
      content: composeContent.trim(),
      category: composeCategory,
      priority: composePriority,
      senderId: currentUser.id || 'usr-1',
      senderName: currentUser.name || 'Authorized Staff',
      senderRole: activeRole || 'Staff',
      senderAvatar: currentUser.avatar,
      createdAt: now.toISOString(),
      formattedDate: dateStr,
      formattedTime: timeStr,
      targetType: composeTargetType,
      targetGrade: composeGrade,
      targetSection: composeSection,
      targetSections: composeTargetType === 'SECTION' ? [`${composeGrade}-${composeSection}`] : undefined,
      targetStudentIds: composeTargetType === 'SPECIFIC_STUDENTS' ? composeSelectedStudentIds : undefined,
      targetStudentNames,
      transportFilter: composeTransportFilter,
      busRouteNo: composeBusRouteNo !== 'ALL' ? composeBusRouteNo : undefined,
      attachments: composeAttachmentName.trim()
        ? [{ name: composeAttachmentName.trim(), size: '1.4 MB' }]
        : undefined,
      acknowledgments: [
        {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: activeRole,
          seenAt: `${dateStr}, ${timeStr}`,
          timestamp: now.toISOString()
        }
      ]
    };

    // Prepend to ensure latest communication is always on top
    setMessages((prev) => [newMessage, ...prev]);

    // Reset Form
    setIsComposeModalOpen(false);
    setComposeTitle('');
    setComposeContent('');
    setComposeSelectedStudentIds([]);
    setComposeAttachmentName('');
    setToastMessage(`🚀 Message broadcasted successfully under "${COMMUNICATION_CHANNELS.find(c => c.id === composeCategory)?.name}"!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter messages (Chronologically sorted: latest on top)
  const filteredMessages = messages
    .filter((msg) => {
      // 1. Channel filter
      if (selectedChannel !== 'ALL' && msg.category !== selectedChannel) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = msg.title.toLowerCase().includes(q);
        const matchesContent = msg.content.toLowerCase().includes(q);
        const matchesSender = msg.senderName.toLowerCase().includes(q);
        const matchesTarget = (msg.targetSections || []).some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesSender && !matchesTarget) return false;
      }

      // 3. Audience Filter
      if (audienceFilter === 'TRANSPORT_ONLY') {
        if (msg.transportFilter !== 'WITH_TRANSPORT' && msg.category !== 'TRANSPORT_ALERT') return false;
      } else if (audienceFilter === 'MY_MESSAGES' && isTeacher) {
        if (msg.senderId !== currentUser.id && msg.targetType === 'SECTION' && !teacherAssignedClasses.includes(`${msg.targetGrade}-${msg.targetSection}`)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between text-xs font-black animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80 cursor-pointer font-bold">
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER & ACTION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
              Unified School Communication Hub
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Latest Broadcasts On Top
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-indigo-400" />
            Communication & Digital Noticeboard
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Broadcast class announcements, sectional circulars, bus transport alerts, fee notifications, and exam schedules with real-time student and teacher read acknowledgments.
          </p>
        </div>

        {/* Action Button: Compose New Message */}
        <div className="flex items-center gap-3 shrink-0">
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setIsComposeModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              {isTeacher ? 'Compose Class Message' : 'Compose School Broadcast'}
            </button>
          )}
        </div>
      </div>

      {/* QUICK STATS & CHANNEL OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-lg">
            📬
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Messages</span>
            <strong className="text-xl font-black text-slate-900 dark:text-white">{messages.length}</strong>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg">
            👁️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Seen / Acks</span>
            <strong className="text-xl font-black text-emerald-600">
              {messages.reduce((acc, m) => acc + m.acknowledgments.length, 0)}
            </strong>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-lg">
            🚌
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Transport Alerts</span>
            <strong className="text-xl font-black text-amber-600">
              {messages.filter(m => m.category === 'TRANSPORT_ALERT' || m.transportFilter === 'WITH_TRANSPORT').length}
            </strong>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-lg">
            🚨
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Urgent Broadcasts</span>
            <strong className="text-xl font-black text-rose-600">
              {messages.filter(m => m.priority === 'Urgent').length}
            </strong>
          </div>
        </div>
      </div>

      {/* CHANNEL CATEGORIES TABS & FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search circulars, subjects, sections or senders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium outline-none"
            />
          </div>

          {/* Quick Audience Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAudienceFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                audienceFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Broadcasts
            </button>
            {isTeacher && (
              <button
                onClick={() => setAudienceFilter('MY_MESSAGES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  audienceFilter === 'MY_MESSAGES'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                My Class Updates
              </button>
            )}
            <button
              onClick={() => setAudienceFilter('TRANSPORT_ONLY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                audienceFilter === 'TRANSPORT_ONLY'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bus className="w-3.5 h-3.5" /> Transport Only
            </button>
          </div>
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedChannel('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
              selectedChannel === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🌟 All Channels ({messages.length})
          </button>

          {COMMUNICATION_CHANNELS.map((ch) => {
            const count = messages.filter((m) => m.category === ch.id).length;
            const isSelected = selectedChannel === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? `${ch.bgLightClass} ${ch.colorClass} ring-2 ring-indigo-500 font-extrabold shadow-xs`
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{ch.icon}</span>
                <span>{ch.name}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/70 dark:bg-black/40 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHRONOLOGICAL MESSAGES STREAM (LATEST ON TOP) */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto text-slate-400">
              📭
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No messages found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no notices matching your selected channel filter or search keyword.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const channelMeta = COMMUNICATION_CHANNELS.find((c) => c.id === msg.category) || COMMUNICATION_CHANNELS[0];
            const isSeenByMe = msg.acknowledgments.some(
              (ack) => ack.userId === currentUser.id || ack.userName.toLowerCase() === currentUser.name.toLowerCase()
            );
            const myAck = msg.acknowledgments.find(
              (ack) => ack.userId === currentUser.id || ack.userName.toLowerCase() === currentUser.name.toLowerCase()
            );

            return (
              <div
                key={msg.id}
                className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border shadow-sm transition-all hover:shadow-md space-y-4 ${
                  msg.priority === 'Urgent'
                    ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : msg.priority === 'High'
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Channel, Priority, Timestamp & Audience Target */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${channelMeta.bgLightClass} ${channelMeta.colorClass}`}
                    >
                      <span>{channelMeta.icon}</span>
                      <span>{channelMeta.name}</span>
                    </span>

                    {msg.priority === 'Urgent' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                        🚨 Urgent Broadcast
                      </span>
                    )}

                    {msg.priority === 'High' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                        ⚡ High Priority
                      </span>
                    )}

                    {/* Target Audience Pill */}
                    {msg.targetType === 'ALL_SCHOOL' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-500" /> Entire School
                      </span>
                    )}

                    {msg.targetType === 'SECTION' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-indigo-600" />
                        {msg.targetGrade ? `${msg.targetGrade} - Section ${msg.targetSection || 'A'}` : (msg.targetSections || []).join(', ')}
                      </span>
                    )}

                    {msg.targetType === 'SPECIFIC_STUDENTS' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-600" /> Specific Student(s): {(msg.targetStudentNames || []).join(', ')}
                      </span>
                    )}

                    {msg.transportFilter === 'WITH_TRANSPORT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Bus className="w-3 h-3 text-amber-600" /> {msg.busRouteNo || 'Transport Students'}
                      </span>
                    )}
                  </div>

                  {/* Date and Time (Chronological Badge) */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{msg.formattedDate}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{msg.formattedTime}</span>
                  </div>
                </div>

                {/* Message Title & Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {msg.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>

                {/* Attachments (If Any) */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {msg.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>{att.name}</span>
                        {att.size && <span className="text-[10px] text-slate-400">({att.size})</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Bar: Sender Info & Seen / Acknowledgment Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Sender Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {msg.senderName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Published By</span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        {msg.senderName} <span className="font-normal text-slate-400">• {msg.senderRole}</span>
                      </strong>
                    </div>
                  </div>

                  {/* Seen / Acknowledgment Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Acknowledgments Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setViewingAckMessage(msg)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{msg.acknowledgments.length} Seen</span>
                    </button>

                    {/* Interactive Mark as Seen Button */}
                    {isSeenByMe ? (
                      <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Seen ({myAck?.seenAt || 'Acknowledged'})</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkAsSeen(msg.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Seen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* COMPOSE MESSAGE MODAL                                                      */}
      {/* ========================================================================= */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  ✍️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isTeacher ? 'Compose Class Announcement' : 'Compose Official Broadcast'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Send targeted messages with channel categorization and recipient read acknowledgments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComposeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              {/* Row 1: Channel Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-slate-500 mb-1">
                    Channel Category *
                  </label>
                  <select
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value as CommunicationCategory)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    {COMMUNICATION_CHANNELS.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.icon} {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase text-slate-500 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value as CommunicationPriority)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Normal">🟢 Normal Announcement</option>
                    <option value="High">⚡ High Priority Notice</option>
                    <option value="Urgent">🚨 Urgent Emergency Broadcast</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Target Audience Type */}
              <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block font-black uppercase text-slate-700 dark:text-slate-300">
                  Target Audience Scope *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {isAdmin && (
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-white dark:bg-slate-900 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="targetScope"
                        checked={composeTargetType === 'ALL_SCHOOL'}
                        onChange={() => setComposeTargetType('ALL_SCHOOL')}
                        className="text-indigo-600"
                      />
                      <span>Entire School</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-white dark:bg-slate-900 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="targetScope"
                      checked={composeTargetType === 'SECTION'}
                      onChange={() => setComposeTargetType('SECTION')}
                      className="text-indigo-600"
                    />
                    <span>Specific Section</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-white dark:bg-slate-900 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="targetScope"
                      checked={composeTargetType === 'SPECIFIC_STUDENTS'}
                      onChange={() => setComposeTargetType('SPECIFIC_STUDENTS')}
                      className="text-indigo-600"
                    />
                    <span>Select One / Specific Students</span>
                  </label>
                </div>

                {/* If Section or Specific Students: Select Grade & Section */}
                {(composeTargetType === 'SECTION' || composeTargetType === 'SPECIFIC_STUDENTS') && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Class / Grade *</label>
                      <select
                        value={composeGrade}
                        onChange={(e) => setComposeGrade(e.target.value)}
                        className="w-full px-3 py-2 font-bold bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white cursor-pointer"
                      >
                        {allClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Section *</label>
                      <select
                        value={composeSection}
                        onChange={(e) => setComposeSection(e.target.value)}
                        className="w-full px-3 py-2 font-bold bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white cursor-pointer"
                      >
                        {allSections.map((sec) => (
                          <option key={sec} value={sec}>
                            Section {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* If Specific Students: Pick individual student or multiple students */}
                {composeTargetType === 'SPECIFIC_STUDENTS' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-600 dark:text-slate-300">
                        Choose Student(s) in {composeGrade}-{composeSection} ({sectionStudents.length} available):
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setComposeSelectedStudentIds(sectionStudents.map((s) => s.id))}
                          className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setComposeSelectedStudentIds([])}
                          className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      {sectionStudents.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-1">
                          No students currently registered in {composeGrade}-{composeSection}.
                        </p>
                      ) : (
                        sectionStudents.map((std) => {
                          const isChecked = composeSelectedStudentIds.includes(std.id);
                          return (
                            <label
                              key={std.id}
                              className={`flex items-center justify-between p-1.5 rounded-lg border text-xs cursor-pointer ${
                                isChecked
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 font-bold'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setComposeSelectedStudentIds([...composeSelectedStudentIds, std.id]);
                                    } else {
                                      setComposeSelectedStudentIds(
                                        composeSelectedStudentIds.filter((id) => id !== std.id)
                                      );
                                    }
                                  }}
                                  className="rounded text-indigo-600"
                                />
                                <span>
                                  {std.fullName} (Roll {std.rollNo})
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{std.admissionNo}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Transport Audience Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">
                      Transport Filter (Bus / Non-Bus)
                    </label>
                    <select
                      value={composeTransportFilter}
                      onChange={(e) => setComposeTransportFilter(e.target.value as TransportAudienceFilter)}
                      className="w-full px-3 py-2 font-bold bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="ALL">All Students (With & Without Transport)</option>
                      <option value="WITH_TRANSPORT">🚌 Transport Students Only (Bus Service)</option>
                      <option value="WITHOUT_TRANSPORT">🚶 Non-Transport Students (Walkers/Private)</option>
                    </select>
                  </div>

                  {composeTransportFilter === 'WITH_TRANSPORT' && (
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Specific Bus Route</label>
                      <select
                        value={composeBusRouteNo}
                        onChange={(e) => setComposeBusRouteNo(e.target.value)}
                        className="w-full px-3 py-2 font-bold bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option value="ALL">All Bus Routes</option>
                        {routes.map((r) => (
                          <option key={r.id} value={`${r.routeNumber} - ${r.routeName}`}>
                            {r.routeNumber} ({r.routeName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Title */}
              <div>
                <label className="block font-black uppercase text-slate-500 mb-1">
                  Message Title / Circular Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics Pre-Board Revision Guidelines"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-bold bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white outline-none"
                  required
                />
              </div>

              {/* Message Body Content */}
              <div>
                <label className="block font-black uppercase text-slate-500 mb-1">
                  Message Content / Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type full instructions, circular guidelines, homework details, or time schedules..."
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-medium bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Attachment Name (Optional) */}
              <div>
                <label className="block font-black uppercase text-slate-500 mb-1">
                  Attach Document / PDF File Name (Optional)
                </label>
                <div className="relative">
                  <Paperclip className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g., Class10_Revision_Notice.pdf"
                    value={composeAttachmentName}
                    onChange={(e) => setComposeAttachmentName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium outline-none"
                  />
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  ← Cancel / Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer hover:bg-slate-200"
                  >
                    Close Window
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" /> Broadcast Notice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACKNOWLEDGMENTS / SEEN BY RECIPIENTS AUDIT MODAL                          */}
      {/* ========================================================================= */}
      {viewingAckMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-black">
                  👁️
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Read Acknowledgments ({viewingAckMessage.acknowledgments.length} Seen)
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{viewingAckMessage.title}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingAckMessage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {viewingAckMessage.acknowledgments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center p-4">
                  No recipients have acknowledged this message yet.
                </p>
              ) : (
                viewingAckMessage.acknowledgments.map((ack, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-xs">
                        {ack.userName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white block font-bold">
                          {ack.userName}
                        </strong>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {ack.userRole}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      ✓ {ack.seenAt}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingAckMessage(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200"
              >
                ← Back / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
