import React, { useState } from 'react';
import { useAdmissionStore } from './admissionStore';
import { useAcademicPermissions } from './academicPermissionStore';
import { useSisStore } from '../sis/sisStore';
import { AdmissionLetterModal } from './AdmissionLetterModal';
import { ParentIdCardModal } from './ParentIdCardModal';
import { AdmissionApplication, PARENT_OCCUPATION_CATEGORIES, AdmissionStage } from '../../types/admission';
import { ALL_SCHOOL_CLASSES, GROUP_A_INDOOR_ACTIVITIES, GROUP_B_OUTDOOR_ACTIVITIES } from '../../data/mockData';
import {
  UserPlus,
  Search,
  CheckCircle,
  Clock,
  FileText,
  Award,
  Layers,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Shield,
  Award as ClubIcon,
  Briefcase,
  QrCode,
  DollarSign,
  Printer,
  ChevronRight,
  Filter,
  CheckSquare,
  Sparkles,
  HelpCircle,
  CreditCard,
  User
} from 'lucide-react';

export const AdmissionModule: React.FC = () => {
  const { applications, seats, syncStatus, addApplication, updateApplicationStatus } = useAdmissionStore();
  const { permissions, globalReportCardActive, setGlobalReportCardActive, toggleStudentPermission, grantAllPermissions, revokeAllPermissions } = useAcademicPermissions();
  const { students, houses, clubs, addStudent } = useSisStore();

  const [activeSection, setActiveSection] = useState<'applications' | 'exam_permissions'>('applications');
  const [pipelineStep, setPipelineStep] = useState<'ALL' | 'Inquiry' | 'Registration' | 'Admission Process'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [occupationFilter, setOccupationFilter] = useState('All');
  
  const [showOfferModal, setShowOfferModal] = useState<AdmissionApplication | null>(null);
  const [showParentIdModal, setShowParentIdModal] = useState<AdmissionApplication | null>(null);
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
  const [parentOccupation, setParentOccupation] = useState<string>('Doctor / Surgeon / Medical Specialist');
  const [motherOccupation, setMotherOccupation] = useState<string>('Teacher / Professor / Educator');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [inquirySource, setInquirySource] = useState<'Walk-in' | 'Website' | 'Referral' | 'Social Media' | 'Newspaper Ad'>('Website');

  // Auto-populate when selecting a registered student
  const handleSelectRegisteredStudent = (stdId: string) => {
    setSelectedStudentId(stdId);
    if (!stdId) return;
    const std = students.find((s) => s.id === stdId);
    if (std) {
      setStudentName(std.fullName);
      setApplyingClass(std.currentClass || 'Class 10');
      setParentName(std.parents?.fatherName || '');
      setParentOccupation(std.parents?.fatherOccupation || 'Doctor / Surgeon / Medical Specialist');
      setMotherOccupation(std.parents?.motherOccupation || 'Teacher / Professor / Educator');
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
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.studentName.toLowerCase().includes(term) ||
      app.applicationNo.toLowerCase().includes(term) ||
      app.parentName.toLowerCase().includes(term) ||
      (app.parentOccupation && app.parentOccupation.toLowerCase().includes(term)) ||
      (app.motherOccupation && app.motherOccupation.toLowerCase().includes(term));

    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    
    const matchesOccupation = occupationFilter === 'All' || (app.parentOccupation && app.parentOccupation === occupationFilter);

    const matchesPipeline =
      pipelineStep === 'ALL' ||
      (pipelineStep === 'Inquiry' && (app.status === 'Inquiry' || app.status === 'Received')) ||
      (pipelineStep === 'Registration' && (app.status === 'Registration' || app.status === 'Test Scheduled' || app.status === 'Interview Scheduled')) ||
      (pipelineStep === 'Admission Process' && (app.status === 'Admission Process' || app.status === 'Offered' || app.status === 'Confirmed'));

    return matchesSearch && matchesStatus && matchesOccupation && matchesPipeline;
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
      parentOccupation,
      motherOccupation,
      contactNumber,
      email,
      previousSchool: previousSchool || 'G D Goenka Public School',
      inquirySource,
      feePaid: true,
      registrationFee: 1500,
      feeBreakdown: {
        registrationFee: 1500,
        admissionFee: 25000,
        tuitionFee: 18000,
        transportFee: 4500,
        commitmentFee: 5000,
        labFee: 3000,
        totalFee: 57000
      },
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
          fatherOccupation: parentOccupation,
          fatherIncome: '18,00,000 PA',
          fatherQualification: 'Graduate',
          motherName: 'Mother',
          motherOccupation: motherOccupation,
          motherMobile: contactNumber,
          motherEmail: email || 'mother@example.com',
          address: 'Main Town, Delhi NCR',
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

  const handleSavedOfferLetterFromModal = (updatedApp: AdmissionApplication) => {
    updateApplicationStatus(updatedApp.id, 'Offered', updatedApp.interviewRemarks);
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
          <span>3-Step Admission Process & Fee Engine</span>
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
          <span>Academic Exam Clearance Panel</span>
        </button>
      </div>

      {activeSection === 'applications' && (
        <>
          {/* TOP HEADER & SEAT AVAILABILITY */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                  Comprehensive Admission CRM & Workflow
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  3-Step Admission Process System
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  1. Inquiry Stage • 2. Registration Stage • 3. Admission Process (Entrance, Fees Calculation & Offer Letters)
                </p>
              </div>

              <button
                onClick={() => setShowNewLeadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition-all shrink-0"
              >
                <UserPlus className="w-4 h-4" /> Register New Inquiry Lead
              </button>
            </div>

            {/* 3-STEP PIPELINE STEPPER NAV BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPipelineStep('ALL')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  pipelineStep === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="text-[10px] font-extrabold uppercase opacity-80">Full Pipeline</p>
                <p className="text-xs font-black">All Stages ({applications.length})</p>
              </button>

              <button
                onClick={() => setPipelineStep('Inquiry')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  pipelineStep === 'Inquiry'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase opacity-80 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Step 1
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/20">Inquiry</span>
                </div>
                <p className="text-xs font-black">Lead Inquiries</p>
              </button>

              <button
                onClick={() => setPipelineStep('Registration')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  pipelineStep === 'Registration'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase opacity-80 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Step 2
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/20">₹1,500 Fee</span>
                </div>
                <p className="text-xs font-black">Registration & Documents</p>
              </button>

              <button
                onClick={() => setPipelineStep('Admission Process')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  pipelineStep === 'Admission Process'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase opacity-80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Step 3
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/20">Final Dues</span>
                </div>
                <p className="text-xs font-black">Admission & Offer Letter</p>
              </button>
            </div>

            {/* Seat Availability Bar */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Class Seat Capacity Tracker</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {seats.map((st) => (
                  <div key={st.className} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400">{st.className}</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-base font-black text-indigo-700 dark:text-indigo-300">{st.availableSeats} Available</span>
                      <span className="text-[10px] text-slate-400 font-mono">Total: {st.totalSeats}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FILTER TOOLBAR & PARENT OCCUPATION SEARCH */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, app no, parent, occupation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Parental Occupation Filter Dropdown */}
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-indigo-600" />
                <select
                  value={occupationFilter}
                  onChange={(e) => setOccupationFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="All">All Parental Occupation Categories</option>
                  {PARENT_OCCUPATION_CATEGORIES.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="All">All Pipeline Stages</option>
                <option value="Inquiry">Step 1: Inquiry</option>
                <option value="Registration">Step 2: Registration</option>
                <option value="Admission Process">Step 3: Admission Process</option>
                <option value="Offered">Offered</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* TABLE OF APPLICATIONS */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Application Details</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Parent Details & Occupation</th>
                    <th className="py-3 px-4">Entrance Score</th>
                    <th className="py-3 px-4">Calculated Fees</th>
                    <th className="py-3 px-4">Status & Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium">
                  {filteredApps.map((app) => {
                    const totalFee = app.feeBreakdown?.totalFee || (app.registrationFee + 25000 + 18000 + 4500);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{app.studentName}</p>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">{app.applicationNo}</p>
                          <p className="text-[10px] text-slate-400">Date: {app.applicationDate}</p>
                        </td>

                        <td className="py-3 px-4 font-extrabold text-slate-800 dark:text-slate-200">
                          {app.applyingClass}
                        </td>

                        {/* PARENT DETAILS & OCCUPATION */}
                        <td className="py-3 px-4">
                          <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-indigo-600" /> {app.parentName}
                          </p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            {app.parentOccupation || 'Doctor / Engineer'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{app.contactNumber}</p>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {app.entranceTestScore ? `${app.entranceTestScore} / ${app.entranceTestMaxMarks || 100}` : 'Pending Test'}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{totalFee.toLocaleString('en-IN')}/-
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value as any)}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                          >
                            <option value="Inquiry">Step 1: Inquiry</option>
                            <option value="Registration">Step 2: Registration</option>
                            <option value="Admission Process">Step 3: Admission Process</option>
                            <option value="Offered">Offered</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Waitlisted">Waitlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setShowOfferModal(app)}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
                            title="Generate & Save Provisional Offer Letter"
                          >
                            <FileText className="w-3.5 h-3.5" /> Offer Letter
                          </button>

                          <button
                            onClick={() => setShowParentIdModal(app)}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
                            title="Generate Parent Short Leave Gate ID Card"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Parent ID
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ACADEMIC EXAM CLEARANCES SECTION */}
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
                  When enabled, the Academic Progress section is active in student/parent logins.
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

      {/* OFFER LETTER MODAL */}
      {showOfferModal && (
        <AdmissionLetterModal
          application={showOfferModal}
          onClose={() => setShowOfferModal(null)}
          onSaveOfferLetter={handleSavedOfferLetterFromModal}
        />
      )}

      {/* PARENT ID CARD MODAL */}
      {showParentIdModal && (
        <ParentIdCardModal
          application={showParentIdModal}
          onClose={() => setShowParentIdModal(null)}
        />
      )}

      {/* REGISTER NEW APPLICATION / INQUIRY LEAD MODAL */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Register New 3-Step Admission Inquiry Lead
              </h3>
              <button onClick={() => setShowNewLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              {/* Registered Student Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  Select Registered Student (Master SIS Database)
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectRegisteredStudent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Applying Class *</label>
                  <select
                    value={applyingClass}
                    onChange={(e) => setApplyingClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    {ALL_SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inquiry Source *</label>
                  <select
                    value={inquirySource}
                    onChange={(e) => setInquirySource(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Walk-in">Walk-in Visit</option>
                    <option value="Website">School Website</option>
                    <option value="Referral">Parent Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Newspaper Ad">Newspaper Ad</option>
                  </select>
                </div>
              </div>

              {/* PARENTAL OCCUPATION FIELD */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father / Primary Parent Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Occupation Category *</label>
                  <select
                    value={parentOccupation}
                    onChange={(e) => setParentOccupation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    {PARENT_OCCUPATION_CATEGORIES.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer"
                >
                  Create Inquiry Lead & Advance Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
