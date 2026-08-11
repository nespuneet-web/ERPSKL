import React, { useState } from 'react';
import { useAdmissionStore } from './admissionStore';
import { useAcademicPermissions } from './academicPermissionStore';
import { useSisStore } from '../sis/sisStore';
import { AdmissionLetterModal } from './AdmissionLetterModal';
import { AdmissionApplication } from '../../types/admission';
import { ALL_SCHOOL_CLASSES, GROUP_A_INDOOR_ACTIVITIES, GROUP_B_OUTDOOR_ACTIVITIES } from '../../data/mockData';
import { UserPlus, Search, CheckCircle, Clock, FileText, Award, Layers, ShieldCheck, Lock, Unlock, CheckCircle2, AlertCircle, UserCheck, Shield, Award as ClubIcon } from 'lucide-react';

export const AdmissionModule: React.FC = () => {
  const { applications, seats, syncStatus, addApplication, updateApplicationStatus } = useAdmissionStore();
  const { permissions, globalReportCardActive, setGlobalReportCardActive, toggleStudentPermission, grantAllPermissions, revokeAllPermissions } = useAcademicPermissions();
  const { students, houses, clubs, addStudent } = useSisStore();

  const [activeSection, setActiveSection] = useState<'applications' | 'exam_permissions'>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showOfferModal, setShowOfferModal] = useState<AdmissionApplication | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  // New lead form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [applyingClass, setApplyingClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedHouse, setSelectedHouse] = useState('Agni (Red)');
  const [selectedClub, setSelectedClub] = useState('Eco & Green Club');
  const [selectedIndoor, setSelectedIndoor] = useState('Chess');
  const [selectedOutdoor, setSelectedOutdoor] = useState('Cricket');
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');


  // Auto-populate when selecting a registered student
  const handleSelectRegisteredStudent = (stdId: string) => {
    setSelectedStudentId(stdId);
    if (!stdId) return;
    const std = students.find((s) => s.id === stdId);
    if (std) {
      setStudentName(std.fullName);
      setApplyingClass(std.currentClass || 'Class 10');
      setParentName(std.parents?.fatherName || '');
      setContactNumber(std.parents?.fatherMobile || '');
      setEmail(std.parents?.fatherEmail || '');
      setPreviousSchool('G D Goenka Public School');
    }
  };

  // Merge permissions with all registered students
  const mergedPermissions = [...permissions];
  students.forEach((s) => {
    if (!mergedPermissions.some((p) => p.studentId === s.id)) {
      mergedPermissions.push({
        studentId: s.id,
        studentName: s.fullName,
        className: `${s.currentClass}-${s.section}`,
        halfYearlyGranted: true,
        annualGranted: true,
        unitTestGranted: true,
        reportCardActive: true,
        updatedAt: new Date().toISOString().split('T')[0],
        grantedBy: 'System Auto-Register'
      });
    }
  });

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentName || !contactNumber) return;

    // Create admission lead
    addApplication({
      studentName,
      applyingClass,
      gender: 'Male',
      dob: '2014-05-10',
      parentName,
      contactNumber,
      email,
      previousSchool: previousSchool || 'G D Goenka Public School',
      feePaid: true,
      registrationFee: 1500,
      documentsUploaded: ['10th Marksheet', 'Transfer Certificate', 'Aadhaar']
    });

    // Check if student exists in SIS, otherwise create student record for inter-module integration
    const exists = students.some((s) => s.fullName.toLowerCase() === studentName.toLowerCase());
    if (!exists) {
      addStudent({
        admissionNo: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
        registrationNo: `REG-${Math.floor(10000 + Math.random() * 90000)}`,
        scholarNo: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
        penNo: `PEN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        apaarId: `APAAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        aadhaarNo: '7812 9012 3456',
        fullName: studentName,
        gender: 'Male',
        dob: '2010-05-10',
        bloodGroup: 'O+',
        religion: 'Hinduism',
        category: 'General',
        nationality: 'Indian',
        motherTongue: 'Hindi',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionClass: applyingClass,
        currentClass: applyingClass,
        section: selectedSection,
        rollNo: students.length + 1,
        house: selectedHouse,
        clubName: selectedClub,
        groupAActivity: selectedIndoor,
        groupBActivity: selectedOutdoor,
        transportRequired: true,
        busRouteNo: 'Route 1 - Civil Lines Metro',
        hostelRequired: false,
        parents: {
          fatherName: parentName,
          fatherMobile: contactNumber,
          fatherEmail: email || 'parent@example.com',
          fatherOccupation: 'Professional',
          fatherIncome: '15,00,000 PA',
          fatherQualification: 'Graduate',
          motherName: 'Mother',
          motherOccupation: 'Home Maker',
          motherMobile: contactNumber,
          motherEmail: email || 'mother@example.com',
          address: 'Main Town, Agra',
          emergencyContact: contactNumber
        },
        medical: { bloodGroup: 'O+', disability: false },
        documents: [],
        siblings: [],
        promotions: [],
        status: 'Active'
      });
    }

    setStudentName('');
    setParentName('');
    setContactNumber('');
    setEmail('');
    setSelectedStudentId('');
    setShowNewLeadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Live Sync Status Banner */}
      {syncStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs rounded-xl shadow-xs animate-fade-in">
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Section Navigation Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSection === 'applications'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Admission Leads & Seats</span>
        </button>

        <button
          onClick={() => setActiveSection('exam_permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSection === 'exam_permissions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Academic Exam Permissions Panel</span>
        </button>
      </div>

      {activeSection === 'applications' && (
        <>
          {/* Seat Availability Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Admission Management System
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage Online Leads, Entrance Exams, Seat Allocation, and Admission Offer Letters.
                </p>
              </div>

              <button
                onClick={() => setShowNewLeadModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Register New Application
              </button>
            </div>

            {/* Seat Allocation Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              {seats.map((st) => (
                <div key={st.className} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500">{st.className}</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{st.availableSeats} Available</span>
                    <span className="text-xs text-slate-400">Total: {st.totalSeats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar & Lead List */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Student Name, Application No, Parent Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="Received">Received</option>
            <option value="Test Scheduled">Test Scheduled</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Offered">Offered</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waitlisted">Waitlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Application Details</th>
                <th className="py-3 px-4">Applying Class</th>
                <th className="py-3 px-4">Parent Info</th>
                <th className="py-3 px-4">Entrance Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{app.studentName}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{app.applicationNo}</p>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{app.applyingClass}</td>

                  <td className="py-3 px-4 text-xs">
                    <p className="font-medium text-slate-900 dark:text-white">{app.parentName}</p>
                    <p className="text-slate-500">{app.contactNumber}</p>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {app.entranceTestScore ? `${app.entranceTestScore} / ${app.entranceTestMaxMarks}` : 'Pending Test'}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => updateApplicationStatus(app.id, e.target.value as any)}
                      className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Received">Received</option>
                      <option value="Test Scheduled">Test Scheduled</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offered">Offered</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setShowOfferModal(app)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg"
                    >
                      Offer Letter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* SECTION 2: ACADEMIC EXAM PERMISSIONS CONTROL PANEL */}
      {activeSection === 'exam_permissions' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-xs font-bold">
                Admission Panel Examination Clearance Control
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Half-Yearly & Annual Exam Report Permissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Grant or restrict permissions for students to view Half-Yearly Exam, Annual Exam, and Academic Progress Report Statements in Student / Parent Portal logins.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={grantAllPermissions}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Grant All Clearances
              </button>
              <button
                onClick={revokeAllPermissions}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" /> Lock All Clearances
              </button>
            </div>
          </div>

          {/* Global Toggle */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Global Report Card Section Active Toggle
                </p>
                <p className="text-xs text-slate-500">
                  When enabled, the Academic Progress section is active in student/parent logins. When disabled, section displays "Section Inactive".
                </p>
              </div>
            </div>

            <button
              onClick={() => setGlobalReportCardActive(!globalReportCardActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                globalReportCardActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {globalReportCardActive ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{globalReportCardActive ? 'Report Card Section: ACTIVE' : 'Report Card Section: LOCKED'}</span>
            </button>
          </div>

          {/* Permission Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Student Info</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Half-Yearly Exam Permission</th>
                  <th className="py-3 px-4">Annual Exam Permission</th>
                  <th className="py-3 px-4">Report Card Active Status</th>
                  <th className="py-3 px-4">Granted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {mergedPermissions.map((p) => (
                  <tr key={p.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{p.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">ID: {p.studentId}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{p.className}</td>
                    
                    {/* Half Yearly Permission */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStudentPermission(p.studentId, 'halfYearlyGranted')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                          p.halfYearlyGranted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {p.halfYearlyGranted ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{p.halfYearlyGranted ? 'GRANTED' : 'PERMISSION PENDING'}</span>
                      </button>
                    </td>

                    {/* Annual Exam Permission */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStudentPermission(p.studentId, 'annualGranted')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                          p.annualGranted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {p.annualGranted ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{p.annualGranted ? 'GRANTED' : 'PERMISSION PENDING'}</span>
                      </button>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStudentPermission(p.studentId, 'reportCardActive')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                          p.reportCardActive
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.reportCardActive ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{p.reportCardActive ? 'ACTIVE' : 'INACTIVE'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-semibold text-[11px]">
                      {p.grantedBy} ({p.updatedAt})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showOfferModal && (
        <AdmissionLetterModal application={showOfferModal} onClose={() => setShowOfferModal(null)} />
      )}

      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Admission Application Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-3">
              {/* Registered Student Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  Select Registered Student (Master SIS Database)
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectRegisteredStudent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  <option value="">-- Create New / Select Registered Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass || s.admissionClass} - {s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Applying Class *</label>
                  <select
                    value={applyingClass}
                    onChange={(e) => setApplyingClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    {ALL_SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Section Assignment *</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              {/* House & Club Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assign House *</label>
                  <select
                    value={selectedHouse}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Club (Mandatory 1) *</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Co-Curricular Activities (Group A Indoor & Group B Outdoor) */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <ClubIcon className="w-3.5 h-3.5" />
                  Co-Curricular Activity Selection Rule (Max 1 Indoor, Max 1 Outdoor)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Group A (Indoor Activity)</label>
                    <select
                      value={selectedIndoor}
                      onChange={(e) => setSelectedIndoor(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="">-- None --</option>
                      {GROUP_A_INDOOR_ACTIVITIES.map((act) => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Group B (Outdoor Activity)</label>
                    <select
                      value={selectedOutdoor}
                      onChange={(e) => setSelectedOutdoor(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="">-- None --</option>
                      {GROUP_B_OUTDOOR_ACTIVITIES.map((act) => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Name *</label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
