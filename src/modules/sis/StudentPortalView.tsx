import React, { useState } from 'react';
import { Student } from '../../types/sis';
import { AcademicProgressView } from './AcademicProgressView';
import { StudentAttendanceCalendarView } from '../attendance/StudentAttendanceCalendarView';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Calendar,
  BookOpen,
  FileCheck,
  DollarSign,
  Bell,
  Award,
  Download,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Ticket,
  Clock,
  Send,
  Upload,
  CheckCircle,
  FileText,
  Building2,
  AlertCircle,
  LogOut,
  Key,
  Bus,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface StudentPortalViewProps {
  student?: Student;
  forcedTab?: 'overview' | 'homework' | 'attendance' | 'report_card' | 'admit_card' | 'timetable' | 'profile';
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student: propStudent,
  forcedTab
}) => {
  const { currentUser, logout, changeUserPassword } = useAuth();

  // Fallback default student mock data if none provided
  const student: Student = propStudent || {
    id: 'std-101',
    admissionNo: 'ADM-2024-001',
    registrationNo: 'REG-88210',
    scholarNo: 'SCH-1001',
    penNo: 'PEN-9821430981',
    apaarId: 'APAAR-771239108234',
    aadhaarNo: '4812 9012 3412',
    fullName: currentUser?.name || 'Aarav Sharma',
    gender: 'Male',
    dob: '2010-05-14',
    bloodGroup: 'O+',
    religion: 'Hinduism',
    category: 'General',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    admissionDate: '2020-04-01',
    admissionClass: 'Class 10',
    currentClass: 'Class 10',
    section: 'A',
    rollNo: 46,
    house: 'Yellow (Jal)',
    previousSchool: 'GDGPS Agra',
    tcNumber: 'TC-2020-412',
    transportRequired: true,
    busRouteNo: 'Route 4 - Sector 15, Agra',
    hostelRequired: false,
    parents: {
      fatherName: 'Mr. Rajesh Sharma',
      fatherOccupation: 'Senior Executive',
      fatherMobile: '+91 98765 43210',
      fatherEmail: 'rajesh.sharma@example.com',
      fatherIncome: '18,00,000 PA',
      fatherQualification: 'B.Tech',
      motherName: 'Mrs. Sunita Sharma',
      motherOccupation: 'Educator',
      motherMobile: '+91 98765 43211',
      motherEmail: 'sunita.sharma@example.com',
      address: 'House No. 42, Civil Lines, Agra, Uttar Pradesh',
      emergencyContact: '+91 98765 43210'
    },
    medical: {
      bloodGroup: 'O+',
      disability: false,
      allergies: 'None',
      doctorContact: 'Dr. V. K. Gupta (+91 98111 22233)'
    },
    documents: []
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'homework' | 'attendance' | 'report_card' | 'admit_card' | 'timetable' | 'profile'>(
    forcedTab || 'overview'
  );

  // Homework State & Submission
  const [homeworkList, setHomeworkList] = useState([
    {
      id: 'hw-1',
      subject: 'Mathematics',
      title: 'Quadratic Equations Exercise 4.2 & Word Problems',
      teacher: 'Mr. Rajesh Namboodiri',
      dueDate: 'Tomorrow at 8:00 AM',
      status: 'Pending',
      description: 'Solve problems 1 to 15 from NCERT Chapter 4. Ensure step-by-step discriminant calculations.',
      submissionNote: '',
      submittedAt: null as string | null
    },
    {
      id: 'hw-2',
      subject: 'Science (Physics)',
      title: 'Ray Optics Lab Practical File & Diagram Annotations',
      teacher: 'Dr. Priya Nambiar',
      dueDate: 'Friday at 2:00 PM',
      status: 'Submitted',
      description: 'Complete focal length calculations for convex lens experiment and plot graph in record book.',
      submissionNote: 'Record file completed and uploaded with graph copy.',
      submittedAt: 'Yesterday, 4:30 PM'
    },
    {
      id: 'hw-3',
      subject: 'English Literature',
      title: 'Essay: Themes of Resilience in "The First Flight"',
      teacher: 'Mrs. Ananya Sen',
      dueDate: 'Monday at 9:00 AM',
      status: 'Pending',
      description: 'Write a 400-word analytical essay discussing symbolism and character motivation.',
      submissionNote: '',
      submittedAt: null
    },
    {
      id: 'hw-4',
      subject: 'Social Science',
      title: 'Map Work: Major River Systems and Dams of India',
      teacher: 'Mr. Vikram Rathore',
      dueDate: 'Last Wednesday',
      status: 'Graded',
      description: 'Mark Bhakra Nangal, Hirakud, Sardar Sarovar and Tehri Dam on the political outline map.',
      submissionNote: 'Map pasted in geography notebook.',
      submittedAt: '08 Feb 2026',
      grade: 'Grade A+ (10/10)',
      feedback: 'Excellent cartographic precision and neatness.'
    }
  ]);

  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<string | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmitHomework = (hwId: string) => {
    if (!submissionText.trim() && !submissionFile) {
      alert('Please write an answer or attach your assignment file before submitting.');
      return;
    }
    setHomeworkList((prev) =>
      prev.map((item) =>
        item.id === hwId
          ? {
              ...item,
              status: 'Submitted',
              submissionNote: submissionText,
              submittedAt: 'Just now'
            }
          : item
      )
    );
    setSubmittingHwId(null);
    setSubmissionText('');
    setSubmissionFile(null);
    alert('Homework submitted successfully to your subject teacher!');
  };

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Both old and new passwords are required.' });
      return;
    }
    const res = changeUserPassword(currentUser?.username || 'student1', oldPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Password successfully updated! Use your new password on next login.' });
      setOldPassword('');
      setNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  const handlePrintAdmitCard = () => {
    window.print();
  };

  // Today's schedule data
  const todaySchedule = [
    { period: 1, time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. Rajesh Namboodiri', room: 'Room 204' },
    { period: 2, time: '08:45 - 09:30', subject: 'Physics', teacher: 'Dr. Priya Nambiar', room: 'Physics Lab 1' },
    { period: 3, time: '09:30 - 10:15', subject: 'English', teacher: 'Mrs. Ananya Sen', room: 'Room 204' },
    { period: 4, time: '10:15 - 11:00', subject: 'Social Studies', teacher: 'Mr. Vikram Rathore', room: 'Room 204' },
    { period: 'Break', time: '11:00 - 11:30', subject: 'Recess / Lunch Interval', teacher: '-', room: 'Cafeteria' },
    { period: 5, time: '11:30 - 12:15', subject: 'Chemistry', teacher: 'Dr. Amit Trivedi', room: 'Chemistry Lab' },
    { period: 6, time: '12:15 - 01:00', subject: 'Computer Science', teacher: 'Mr. S. K. Gupta', room: 'IT Lab 2' },
    { period: 7, time: '01:00 - 01:45', subject: 'Hindi / Sanskrit', teacher: 'Dr. Meena Pandey', room: 'Room 204' },
    { period: 8, time: '01:45 - 02:30', subject: 'Physical Education / Games', teacher: 'Coach R. Singh', room: 'Sports Complex' }
  ];

  return (
    <div className="space-y-5 select-none">
      {/* 1. Student Portal Official Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={student.photoUrl}
                alt={student.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400 object-cover shadow-md bg-indigo-950"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-emerald-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider border border-white/30">
                Active
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-extrabold text-amber-300 border border-white/10">
                  GOENKA PUBLIC SCHOOL AGRA
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-700/80 rounded-full text-[10px] font-bold text-indigo-200">
                  CBSE Affiliated • Session 2025-2026
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{student.fullName}</h1>
              <p className="text-xs sm:text-sm text-indigo-200 font-semibold mt-0.5">
                {student.currentClass} - Section {student.section} &nbsp;|&nbsp; Roll No: <span className="text-amber-300 font-bold">{student.rollNo}</span> &nbsp;|&nbsp; House: <span className="text-white font-bold">{student.house}</span>
              </p>
              <p className="text-[11px] text-indigo-300 mt-1 font-mono">
                PEN: {student.penNo} &nbsp;•&nbsp; Admission No: {student.admissionNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Portal Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Dashboard & Classes', icon: BookOpen },
          { id: 'homework', label: 'Homework & Tasks', icon: FileText, count: homeworkList.filter(h => h.status === 'Pending').length },
          { id: 'attendance', label: 'Attendance Log', icon: Calendar },
          { id: 'report_card', label: 'Academic Progress', icon: Award },
          { id: 'admit_card', label: 'Exam Permit & Admit Card', icon: Ticket },
          { id: 'timetable', label: 'Class Timetable', icon: Clock },
          { id: 'profile', label: 'My Profile & Security', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: STUDENT DASHBOARD & TODAY'S CLASSES
         ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">Attendance</span>
                <Calendar className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">96.4%</p>
              <span className="text-[10px] text-emerald-600 font-bold">Compliant (&gt;75% CBSE req.)</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">Active Homework</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {homeworkList.filter((h) => h.status === 'Pending').length} Pending
              </p>
              <span className="text-[10px] text-indigo-600 font-bold">Due this week</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">Term Grade</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">A1 (94.2%)</p>
              <span className="text-[10px] text-amber-600 font-bold">#1 in Section 10-A</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">Fee Status</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-emerald-600">Cleared</p>
              <span className="text-[10px] text-slate-400 font-semibold">Q4 Paid (No Dues)</span>
            </div>
          </div>

          {/* Today's Live Schedule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Today's Class Schedule (8 Periods)</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">Class {student.currentClass}-{student.section}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {todaySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    item.period === 'Break'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                      {item.period}
                    </span>
                    <div>
                      <p className="font-extrabold">{item.subject}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.teacher} • {item.room}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* School Announcements for Students */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Official Circulars & Notice Board</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-950 dark:text-indigo-200">
                    Annual CBSE Board Examination Admit Card Released
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold">12 Feb 2026</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  All Class 10 and 12 students are instructed to download and verify their official Admit Cards from the "Exam Permit & Admit Card" tab.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    Inter-House Science Exhibition & Robotics Championship
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">10 Feb 2026</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Entries for working models must be submitted to the Physics Lab Incharge by Friday 3:00 PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: HOMEWORK & ASSIGNMENTS (WITH SUBMISSION)
         ========================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Assigned Homework & Submissions</h2>
              <p className="text-xs text-slate-500">Track pending tasks, submit work online, and view teacher feedback.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                {homeworkList.filter((h) => h.status === 'Pending').length} Pending Tasks
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {homeworkList.map((hw) => (
              <div
                key={hw.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-[11px]">
                      {hw.subject}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{hw.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        hw.status === 'Pending'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : hw.status === 'Submitted'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {hw.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{hw.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <span>Instructor: <strong className="text-slate-800 dark:text-slate-200">{hw.teacher}</strong></span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Due: {hw.dueDate}
                  </span>
                </div>

                {/* Status-specific footer */}
                {hw.status === 'Pending' && (
                  <div>
                    {submittingHwId === hw.id ? (
                      <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                        <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">Submit Your Assignment</h4>
                        <textarea
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Type your notes, solution summary, or submission details here..."
                          className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50">
                            <Upload className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{submissionFile ? submissionFile : 'Attach File (PDF/Image)'}</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSubmissionFile(e.target.files[0].name);
                                }
                              }}
                            />
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSubmittingHwId(null)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitHomework(hw.id)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Homework</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSubmittingHwId(hw.id);
                          setSubmissionText('');
                          setSubmissionFile(null);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work Online</span>
                      </button>
                    )}
                  </div>
                )}

                {hw.status === 'Submitted' && (
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Submitted on: {hw.submittedAt}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Awaiting Teacher Grading</span>
                  </div>
                )}

                {hw.status === 'Graded' && (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span><strong>{hw.grade}</strong>: {hw.feedback}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">Verified & Recorded</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: ATTENDANCE LOG
         ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <StudentAttendanceCalendarView initialStudentId={student.id} />
        </div>
      )}

      {/* =========================================================
          TAB 4: ACADEMIC PROGRESS & REPORT CARD
         ========================================================= */}
      {activeTab === 'report_card' && (
        <div className="space-y-5">
          <AcademicProgressView student={student} />
        </div>
      )}

      {/* =========================================================
          TAB 5: EXAM PERMIT & ADMIT CARD
         ========================================================= */}
      {activeTab === 'admit_card' && (
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Examination Allowance Status: <span className="text-emerald-600">OFFICIALLY PERMITTED</span>
                </p>
                <p className="text-xs text-slate-500">
                  Fee clearance, library dues, and 75% minimum attendance verified. Hall ticket is valid for CBSE Annual Examinations 2026.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrintAdmitCard}
              className="px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" /> Print / Save Admit Card Slip
            </button>
          </div>

          {/* Printable Official CBSE Admit Card */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-indigo-900/30 dark:border-indigo-500/30 bg-white dark:bg-slate-900 shadow-xl space-y-6 print:m-0 print:p-4 print:border-none">
            {/* Header with School Crest & Info */}
            <div className="flex items-center justify-between border-b-2 border-indigo-900 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-indigo-950 font-black flex items-center justify-center text-2xl shadow-md border-2 border-indigo-900">
                  G
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-indigo-950 dark:text-white tracking-wide uppercase">
                    GOENKA PUBLIC SCHOOL AGRA
                  </h2>
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    Affiliated to Central Board of Secondary Education (CBSE), New Delhi
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    School Code: 60312 &nbsp;•&nbsp; Affiliation No: 2130882 &nbsp;•&nbsp; Agra, Uttar Pradesh
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-lg bg-indigo-900 text-white text-xs font-black uppercase tracking-wider">
                  Official Admit Card
                </span>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Session: 2025-2026</p>
              </div>
            </div>

            {/* Candidate & Center Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="space-y-2 sm:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Full Name</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{student.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll Number</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-mono font-black">{student.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Class & Section</span>
                    <strong className="text-slate-900 dark:text-white">{student.currentClass} - {student.section}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">PEN Number</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{student.penNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Father's Name</span>
                    <strong className="text-slate-900 dark:text-white">{student.parents?.fatherName || 'Mr. Rajesh Sharma'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mother's Name</span>
                    <strong className="text-slate-900 dark:text-white">{student.parents?.motherName || 'Mrs. Sunita Sharma'}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Examination Center</span>
                  <strong className="text-slate-900 dark:text-white">
                    Main Block Examination Hall B, GOENKA Public School, Agra Campus
                  </strong>
                </div>
              </div>

              {/* Photo & Barcode Block */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <img
                  src={student.photoUrl}
                  alt={student.fullName}
                  className="w-24 h-24 rounded-xl border-2 border-indigo-600 object-cover shadow-sm"
                />
                <span className="text-[9px] font-mono text-slate-400 font-bold">DIGITAL VERIFIED</span>
                {/* Barcode visual */}
                <div className="font-mono text-xs tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded font-black">
                  ||||| {student.penNo?.slice(0, 10) || '9821430981'} |||||
                </div>
              </div>
            </div>

            {/* Examination Timetable / Date Sheet */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Authorized Subject Schedule & Date Sheet
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-2.5 border-b">Sub Code</th>
                      <th className="p-2.5 border-b">Subject Name</th>
                      <th className="p-2.5 border-b">Date</th>
                      <th className="p-2.5 border-b">Time</th>
                      <th className="p-2.5 border-b">Room</th>
                      <th className="p-2.5 border-b text-center">Candidate Initial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    <tr>
                      <td className="p-2.5 font-mono font-bold">041</td>
                      <td className="p-2.5 font-bold">Mathematics Standard</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">02 March 2026</td>
                      <td className="p-2.5 font-mono">09:00 AM - 12:00 PM</td>
                      <td className="p-2.5">Hall B-12</td>
                      <td className="p-2.5 text-center text-slate-400">___________</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">086</td>
                      <td className="p-2.5 font-bold">Science (Physics/Chem/Bio)</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">06 March 2026</td>
                      <td className="p-2.5 font-mono">09:00 AM - 12:00 PM</td>
                      <td className="p-2.5">Hall B-12</td>
                      <td className="p-2.5 text-center text-slate-400">___________</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">184</td>
                      <td className="p-2.5 font-bold">English Language & Literature</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">11 March 2026</td>
                      <td className="p-2.5 font-mono">09:00 AM - 12:00 PM</td>
                      <td className="p-2.5">Hall B-12</td>
                      <td className="p-2.5 text-center text-slate-400">___________</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">087</td>
                      <td className="p-2.5 font-bold">Social Science</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">16 March 2026</td>
                      <td className="p-2.5 font-mono">09:00 AM - 12:00 PM</td>
                      <td className="p-2.5">Hall B-12</td>
                      <td className="p-2.5 text-center text-slate-400">___________</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">002</td>
                      <td className="p-2.5 font-bold">Hindi Course A</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">20 March 2026</td>
                      <td className="p-2.5 font-mono">09:00 AM - 12:00 PM</td>
                      <td className="p-2.5">Hall B-12</td>
                      <td className="p-2.5 text-center text-slate-400">___________</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">165</td>
                      <td className="p-2.5 font-bold">Computer Applications</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">24 March 2026</td>
                      <td className="p-2.5 font-mono">09:00 AM - 11:00 AM</td>
                      <td className="p-2.5">IT Lab 2</td>
                      <td className="p-2.5 text-center text-slate-400">___________</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signatures & Seal */}
            <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[11px] font-bold border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-indigo-900 dark:text-indigo-300">R. Namboodiri</span>
                </div>
                <span>Class Teacher Signature</span>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-indigo-900 dark:text-indigo-300">Prof. Alok Mathur</span>
                </div>
                <span>Controller of Examinations</span>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-black text-indigo-900 dark:text-indigo-300">Dr. V. K. Sharma</span>
                </div>
                <span>Principal & Director</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: CLASS TIMETABLE
         ========================================================= */}
      {activeTab === 'timetable' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Class Weekly Timetable</h2>
              <p className="text-xs text-slate-500">Regular academic session 2025-2026 • Class {student.currentClass}-{student.section}</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
              Room 204
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{day}</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-[10px]">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P1 (08:00)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Maths</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P2 (08:45)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Physics</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P3 (09:30)</span>
                    <strong className="text-slate-800 dark:text-slate-200">English</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P4 (10:15)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Social St.</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P5 (11:30)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Chemistry</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P6 (12:15)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Computers</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P7 (01:00)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Hindi</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-slate-400 block">P8 (01:45)</span>
                    <strong className="text-slate-800 dark:text-slate-200">Sports/Art</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: MY PROFILE & SECURITY
         ========================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Official Student Record (Read-Only)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">FULL NAME</span>
                <strong className="text-slate-900 dark:text-white">{student.fullName}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">ADMISSION NUMBER</span>
                <strong className="text-slate-900 dark:text-white">{student.admissionNo}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">PEN (UDISE+)</span>
                <strong className="text-slate-900 dark:text-white font-mono">{student.penNo}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">DATE OF BIRTH</span>
                <strong className="text-slate-900 dark:text-white">{student.dob}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">BLOOD GROUP</span>
                <strong className="text-slate-900 dark:text-white">{student.bloodGroup}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">HOUSE</span>
                <strong className="text-amber-600 font-bold">{student.house}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">FATHER'S NAME & PHONE</span>
                <strong className="text-slate-900 dark:text-white">
                  {student.parents?.fatherName} ({student.parents?.fatherMobile})
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">MOTHER'S NAME</span>
                <strong className="text-slate-900 dark:text-white">{student.parents?.motherName}</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">TRANSPORT ROUTE</span>
                <strong className="text-slate-900 dark:text-white">{student.busRouteNo || 'Route 4 - Civil Lines'}</strong>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Change Portal Password</span>
            </h3>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password (e.g. student1)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-extrabold cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
