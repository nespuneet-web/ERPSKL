import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  User,
  Sparkles,
  Send,
  X,
  Check
} from 'lucide-react';

export interface ExamScheduleEntry {
  id: string;
  examTerm: string; // e.g. "Term 1 Mid-Term", "Annual Final Exam 2025-26", "Unit Test 2"
  date: string; // e.g. "2026-09-15"
  day: string; // e.g. "Monday"
  timeSlot: string; // e.g. "09:00 AM - 12:00 PM"
  className: string; // e.g. "Class 10"
  subject: string; // e.g. "Mathematics (Standard)"
  roomNo: string; // e.g. "Hall 1 / Room 204"
  invigilator: string; // e.g. "Prof. Alok Mathur"
  maxMarks: number;
  isPublished: boolean;
}

const INITIAL_EXAM_SCHEDULE: ExamScheduleEntry[] = [
  {
    id: 'ex-sch-1',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-14',
    day: 'Monday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 10',
    subject: 'Mathematics (Standard / Basic)',
    roomNo: 'Exam Hall A (Ground Floor)',
    invigilator: 'ANIL KUMAR SINGH',
    maxMarks: 80,
    isPublished: true
  },
  {
    id: 'ex-sch-2',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-16',
    day: 'Wednesday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 10',
    subject: 'Science (Physics / Chem / Bio)',
    roomNo: 'Exam Hall A (Ground Floor)',
    invigilator: 'PRATEEK BANSAL',
    maxMarks: 80,
    isPublished: true
  },
  {
    id: 'ex-sch-3',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-18',
    day: 'Friday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 10',
    subject: 'English Language & Literature',
    roomNo: 'Exam Hall B (First Floor)',
    invigilator: 'RAJAT JAIN',
    maxMarks: 80,
    isPublished: true
  },
  {
    id: 'ex-sch-4',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-21',
    day: 'Monday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 10',
    subject: 'Social Science (History / Pol / Geo)',
    roomNo: 'Exam Hall A (Ground Floor)',
    invigilator: 'SUDHIR MISHRA',
    maxMarks: 80,
    isPublished: true
  },
  {
    id: 'ex-sch-5',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-23',
    day: 'Wednesday',
    timeSlot: '09:00 AM - 11:00 AM',
    className: 'Class 10',
    subject: 'Information Technology (Code 402)',
    roomNo: 'Computer Lab 1 & 2',
    invigilator: 'RAKESH SHARMA',
    maxMarks: 50,
    isPublished: true
  },
  {
    id: 'ex-sch-6',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-14',
    day: 'Monday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 12',
    subject: 'Physics / Accountancy',
    roomNo: 'Room 301 & 302',
    invigilator: 'DEEPAK GUPTA',
    maxMarks: 70,
    isPublished: true
  },
  {
    id: 'ex-sch-7',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-16',
    day: 'Wednesday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 12',
    subject: 'Chemistry / Business Studies',
    roomNo: 'Room 301 & 302',
    invigilator: 'POOJA SHARMA',
    maxMarks: 70,
    isPublished: true
  },
  {
    id: 'ex-sch-8',
    examTerm: 'Term 1 Mid-Term Examination 2025-26',
    date: '2026-09-18',
    day: 'Friday',
    timeSlot: '09:00 AM - 12:00 PM',
    className: 'Class 12',
    subject: 'Mathematics / Applied Maths',
    roomNo: 'Room 303',
    invigilator: 'ANIL KUMAR SINGH',
    maxMarks: 80,
    isPublished: true
  }
];

const MASTER_CLASSES = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

export const ExamTimetableDatesheet: React.FC = () => {
  const { isSubSectionAllowed, activeRole, addNotification, logActivity } = useAuth();
  const canEditTimetable = isSubSectionAllowed('exam_timetable') && (activeRole === 'Super Admin' || activeRole === 'School Admin' || activeRole === 'Principal' || activeRole === 'Vice Principal' || activeRole === 'Examination Incharge');

  const [schedules, setSchedules] = useState<ExamScheduleEntry[]>(() => {
    try {
      const saved = localStorage.getItem('schoolerp_exam_timetable_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXAM_SCHEDULE;
  });

  const [selectedTerm, setSelectedTerm] = useState('Term 1 Mid-Term Examination 2025-26');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All Classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExamScheduleEntry | null>(null);

  // New / Edit Form state
  const [formTerm, setFormTerm] = useState('Term 1 Mid-Term Examination 2025-26');
  const [formDate, setFormDate] = useState('2026-09-25');
  const [formDay, setFormDay] = useState('Friday');
  const [formTimeSlot, setFormTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [formClass, setFormClass] = useState('Class 10');
  const [formSubject, setFormSubject] = useState('Hindi Course A');
  const [formRoom, setFormRoom] = useState('Exam Hall A');
  const [formInvigilator, setFormInvigilator] = useState('SUDHIR MISHRA');
  const [formMaxMarks, setFormMaxMarks] = useState<number>(80);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveToStorage = (newSchedules: ExamScheduleEntry[]) => {
    setSchedules(newSchedules);
    try {
      localStorage.setItem('schoolerp_exam_timetable_v1', JSON.stringify(newSchedules));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormTerm(selectedTerm);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDay('Monday');
    setFormTimeSlot('09:00 AM - 12:00 PM');
    setFormClass('Class 10');
    setFormSubject('');
    setFormRoom('Exam Hall A');
    setFormInvigilator('ANIL KUMAR SINGH');
    setFormMaxMarks(80);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (entry: ExamScheduleEntry) => {
    setEditingEntry(entry);
    setFormTerm(entry.examTerm);
    setFormDate(entry.date);
    setFormDay(entry.day);
    setFormTimeSlot(entry.timeSlot);
    setFormClass(entry.className);
    setFormSubject(entry.subject);
    setFormRoom(entry.roomNo);
    setFormInvigilator(entry.invigilator);
    setFormMaxMarks(entry.maxMarks);
    setIsAddModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) {
      alert('Please provide a subject name.');
      return;
    }

    if (editingEntry) {
      const updated = schedules.map((item) =>
        item.id === editingEntry.id
          ? {
              ...item,
              examTerm: formTerm,
              date: formDate,
              day: formDay,
              timeSlot: formTimeSlot,
              className: formClass,
              subject: formSubject.trim(),
              roomNo: formRoom,
              invigilator: formInvigilator,
              maxMarks: Number(formMaxMarks) || 80
            }
          : item
      );
      saveToStorage(updated);
      showToast(`✅ Exam slot for ${formSubject} (${formClass}) successfully updated!`);
      logActivity('UPDATE_EXAM_SCHEDULE', 'Examination', `Updated exam schedule slot for ${formClass} - ${formSubject}`);
    } else {
      const newEntry: ExamScheduleEntry = {
        id: `ex-sch-${Date.now()}`,
        examTerm: formTerm,
        date: formDate,
        day: formDay,
        timeSlot: formTimeSlot,
        className: formClass,
        subject: formSubject.trim(),
        roomNo: formRoom,
        invigilator: formInvigilator,
        maxMarks: Number(formMaxMarks) || 80,
        isPublished: true
      };
      const updated = [...schedules, newEntry];
      saveToStorage(updated);
      showToast(`✨ Added new examination schedule slot: ${formSubject} for ${formClass}!`);
      logActivity('CREATE_EXAM_SCHEDULE', 'Examination', `Created exam datesheet entry for ${formClass} - ${formSubject}`);
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this examination schedule entry?')) {
      const updated = schedules.filter((s) => s.id !== id);
      saveToStorage(updated);
      showToast('🗑️ Exam schedule entry removed.');
    }
  };

  const handlePublishAll = () => {
    const updated = schedules.map((s) => ({ ...s, isPublished: true }));
    saveToStorage(updated);
    addNotification({
      title: 'Exam Datesheet Published',
      message: `Official Exam Datesheet for ${selectedTerm} has been published to teachers and student portals.`,
      type: 'success',
      module: 'Examination'
    });
    showToast(`📢 Official Datesheet for ${selectedTerm} published to all portals!`);
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchTerm = selectedTerm === 'All Terms' || s.examTerm === selectedTerm;
    const matchClass = selectedClassFilter === 'All Classes' || s.className === selectedClassFilter;
    const matchSearch =
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.invigilator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTerm && matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-700/60 shadow-xl text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Examination Control Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                CBSE Compliant Datesheets
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-amber-400" />
              Exam Time Table & Datesheet Schedule
            </h2>
            <p className="text-xs text-indigo-200/90 max-w-2xl">
              Create, manage, and publish centralized examination schedules, invigilation duty rosters, exam timings, and room allocations across all classes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all border border-slate-700"
            >
              <Printer className="w-4 h-4 text-indigo-300" /> Print Datesheet
            </button>

            {canEditTimetable && (
              <>
                <button
                  onClick={handlePublishAll}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" /> Publish to Portals
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Exam Slot
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Meta Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-indigo-800/60">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Scheduled Slots</span>
            <strong className="text-lg font-black text-white">{filteredSchedules.length} Papers</strong>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Active Term</span>
            <strong className="text-xs font-black text-amber-300 truncate block">{selectedTerm}</strong>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Invigilators</span>
            <strong className="text-lg font-black text-emerald-300">
              {new Set(filteredSchedules.map((s) => s.invigilator)).size} Faculty
            </strong>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Access Level</span>
            <strong className="text-xs font-black text-white">
              {canEditTimetable ? '⚡ Full Admin Access' : '🔒 View-Only Schedule'}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          {/* Term Selector */}
          <div className="sm:w-64">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="Term 1 Mid-Term Examination 2025-26">Term 1 Mid-Term Exam</option>
              <option value="Term 2 Annual Examination 2025-26">Term 2 Annual Exam</option>
              <option value="Periodic Unit Test 1">Periodic Unit Test 1</option>
              <option value="Periodic Unit Test 2">Periodic Unit Test 2</option>
              <option value="All Terms">All Examination Terms</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="sm:w-48">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              {MASTER_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by subject, invigilator faculty, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none"
            />
          </div>
        </div>

        {canEditTimetable && (
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400">
              Admin Mode: Create & Reassign Exam Datesheets
            </span>
          </div>
        )}
      </div>

      {/* Datesheet Grid Table */}
      <div id="printable-exam-datesheet" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Official Timetable Schedule
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {selectedTerm} {selectedClassFilter !== 'All Classes' ? `— ${selectedClassFilter}` : ''}
            </h3>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Reporting Time: 08:45 AM | Reading Time: 15 Mins
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No exam slots scheduled for this selection.
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {canEditTimetable
                ? 'Click "Add Exam Slot" above to schedule papers, exam rooms, and faculty invigilation duties.'
                : 'The examination cell has not published dates for this selection yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Date & Day</th>
                  <th className="p-4">Timing Slot</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Subject & Max Marks</th>
                  <th className="p-4">Room / Exam Hall</th>
                  <th className="p-4">Assigned Invigilator</th>
                  <th className="p-4">Status</th>
                  {canEditTimetable && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredSchedules.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span>{item.date}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {item.day}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.timeSlot}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {item.className}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-black text-slate-900 dark:text-white text-sm">
                        {item.subject}
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold">
                        Maximum Marks: {item.maxMarks}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{item.roomNo}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-[10px]">
                          👨‍🏫
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.invigilator}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        <Check className="w-3 h-3" /> Published
                      </span>
                    </td>

                    {canEditTimetable && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl cursor-pointer"
                            title="Edit Exam Slot"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl cursor-pointer"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT EXAM SLOT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
                {editingEntry ? 'Edit Exam Timetable Slot' : 'Create New Exam Schedule Slot'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Term
                </label>
                <select
                  value={formTerm}
                  onChange={(e) => setFormTerm(e.target.value)}
                  className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Term 1 Mid-Term Examination 2025-26">Term 1 Mid-Term Examination 2025-26</option>
                  <option value="Term 2 Annual Examination 2025-26">Term 2 Annual Examination 2025-26</option>
                  <option value="Periodic Unit Test 1">Periodic Unit Test 1</option>
                  <option value="Periodic Unit Test 2">Periodic Unit Test 2</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (e.target.value) {
                        const d = new Date(e.target.value);
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        setFormDay(days[d.getDay()]);
                      }
                    }}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <input
                    type="text"
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Class
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {MASTER_CLASSES.filter((c) => c !== 'All Classes').map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Timing Slot
                  </label>
                  <select
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (3 Hours)</option>
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (2 Hours)</option>
                    <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM (1.5 Hours)</option>
                    <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name & Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics (Standard - 041)"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={formMaxMarks}
                    onChange={(e) => setFormMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Room / Hall
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Invigilator Faculty
                  </label>
                  <select
                    value={formInvigilator}
                    onChange={(e) => setFormInvigilator(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {[
                      'ANIL KUMAR SINGH',
                      'PRATEEK BANSAL',
                      'RAJAT JAIN',
                      'SUDHIR MISHRA',
                      'RAKESH SHARMA',
                      'DEEPAK GUPTA',
                      'POOJA SHARMA',
                      'ALOK MATHUR'
                    ].map((name) => (
                      <option key={name} value={name}>
                        👨‍🏫 {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  {editingEntry ? 'Save Changes' : 'Add to Datesheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
