import React, { useState } from 'react';
import { useAdmissionStore } from './admissionStore';
import { useAcademicPermissions } from './academicPermissionStore';
import { useSisStore } from '../sis/sisStore';
import { getClassFeeStructure } from '../fees/feeStructureStore';
import { AdmissionLetterModal } from './AdmissionLetterModal';
import { ParentIdCardModal } from './ParentIdCardModal';
import { AllocationModal } from './AllocationModal';
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
  User,
  X
} from 'lucide-react';

export const AdmissionModule: React.FC = () => {
  const {
    applications,
    seats,
    syncStatus,
    addInquiry,
    promoteInquiryToRegistration,
    promoteRegistrationToAdmission,
    updateApplicationStatus
  } = useAdmissionStore();
  
  const {
    permissions,
    globalReportCardActive,
    setGlobalReportCardActive,
    toggleStudentPermission,
    grantAllPermissions,
    revokeAllPermissions
  } = useAcademicPermissions();
  const { students, addStudent } = useSisStore();

  const mergedPermissions = students.map((std) => {
    const perm = permissions.find((p) => p.studentId === std.id || p.studentId === std.admissionNo);
    return {
      studentId: std.id,
      studentName: std.fullName,
      className: std.currentClass,
      halfYearlyGranted: perm ? perm.halfYearlyGranted : true,
      annualGranted: perm ? perm.annualGranted : true,
      reportCardActive: perm ? perm.reportCardActive : true,
      grantedBy: perm?.grantedBy || 'Admission Panel',
      updatedAt: perm?.updatedAt || new Date().toISOString().split('T')[0]
    };
  });

  const [activeSection, setActiveSection] = useState<'applications' | 'exam_permissions'>('applications');
  const [pipelineStep, setPipelineStep] = useState<'ALL' | 'Inquiry' | 'Registration' | 'Admission Process'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [occupationFilter, setOccupationFilter] = useState('All');
  
  const [showOfferModal, setShowOfferModal] = useState<AdmissionApplication | null>(null);
  const [showParentIdModal, setShowParentIdModal] = useState<AdmissionApplication | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState<AdmissionApplication | null>(null);
  
  // 3-Step Process Modal States
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAdmissionStepModal, setShowAdmissionStepModal] = useState(false);

  // Inquiry form fields
  const [inqStudentName, setInqStudentName] = useState('');
  const [inqApplyingClass, setInqApplyingClass] = useState('Class 1');
  const [inqGender, setInqGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [inqDob, setInqDob] = useState('2019-05-10');
  const [inqParentName, setInqParentName] = useState('');
  const [inqParentOccupation, setInqParentOccupation] = useState<string>('Doctor / Surgeon / Medical Specialist');
  const [inqMotherOccupation, setInqMotherOccupation] = useState<string>('Teacher / Professor / Educator');
  const [inqContactNumber, setInqContactNumber] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPreviousSchool, setInqPreviousSchool] = useState('');
  const [inqSource, setInqSource] = useState<'Walk-in' | 'Website' | 'Referral' | 'Social Media' | 'Newspaper Ad'>('Walk-in');

  // Registration step form field
  const [selectedInquiryId, setSelectedInquiryId] = useState('');
  const [regClass, setRegClass] = useState('Class 1');
  const [regFeeAmount, setRegFeeAmount] = useState(1500);

  // Admission step form field
  const [selectedRegistrationId, setSelectedRegistrationId] = useState('');

  // Lists filtered by stage
  const inquiryCandidates = applications.filter((app) => app.status === 'Inquiry' || app.status === 'Received');
  const registeredCandidates = applications.filter((app) => app.status === 'Registration' || app.status === 'Test Scheduled' || app.status === 'Interview Scheduled');

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqStudentName || !inqParentName || !inqContactNumber) return;

    addInquiry({
      studentName: inqStudentName,
      applyingClass: inqApplyingClass,
      gender: inqGender,
      dob: inqDob,
      parentName: inqParentName,
      parentOccupation: inqParentOccupation,
      motherOccupation: inqMotherOccupation,
      contactNumber: inqContactNumber,
      email: inqEmail,
      previousSchool: inqPreviousSchool || 'None',
      inquirySource: inqSource,
      documentsUploaded: []
    });

    setInqStudentName('');
    setInqParentName('');
    setInqContactNumber('');
    setInqEmail('');
    setShowInquiryModal(false);
  };

  const handleProcessRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId) return;
    promoteInquiryToRegistration(selectedInquiryId, regFeeAmount);
    setSelectedInquiryId('');
    setShowRegistrationModal(false);
  };

  const handleProcessAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegistrationId) return;
    promoteRegistrationToAdmission(selectedRegistrationId);
    
    const app = applications.find((a) => a.id === selectedRegistrationId);
    if (app) {
      setShowOfferModal(app);
    }
    setSelectedRegistrationId('');
    setShowAdmissionStepModal(false);
  };

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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition-all shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" /> + Step 1: New Inquiry (Free)
                </button>

                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer transition-all shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5" /> + Step 2: Register (₹1,500)
                </button>

                <button
                  onClick={() => setShowAdmissionStepModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow cursor-pointer transition-all shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> + Step 3: Final Admission
                </button>
              </div>
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
                            onClick={() => setShowAllocationModal(app)}
                            className="px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                            title="Allocate Section, House, Club & Activities"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Allocate
                          </button>

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

      {/* POST-ADMISSION ALLOCATION MODAL */}
      {showAllocationModal && (
        <AllocationModal
          application={showAllocationModal}
          onClose={() => setShowAllocationModal(null)}
          onAllocationComplete={(updated) => {
            updateApplicationStatus(updated.id, 'Confirmed');
            setShowAllocationModal(null);
          }}
        />
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

      {/* STEP 1: INQUIRY MODAL (FREE OF CHARGE) */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" /> Step 1: Record New Student Inquiry
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  ✓ Free of charge • No registration or admission fee collected at inquiry
                </p>
              </div>
              <button onClick={() => setShowInquiryModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={inqStudentName}
                  onChange={(e) => setInqStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Applying Class *</label>
                  <select
                    value={inqApplyingClass}
                    onChange={(e) => setInqApplyingClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    {ALL_SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inquiry Source *</label>
                  <select
                    value={inqSource}
                    onChange={(e) => setInqSource(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Walk-in">Walk-in Visit</option>
                    <option value="Website">School Website</option>
                    <option value="Referral">Parent Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Newspaper Ad">Newspaper Ad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={inqParentName}
                    onChange={(e) => setInqParentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father Occupation *</label>
                  <select
                    value={inqParentOccupation}
                    onChange={(e) => setInqParentOccupation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    {PARENT_OCCUPATION_CATEGORIES.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={inqContactNumber}
                    onChange={(e) => setInqContactNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={inqEmail}
                    onChange={(e) => setInqEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer"
                >
                  Save Inquiry (Free)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: REGISTRATION MODAL (CHARGEABLE, RESTRICTED TO INQUIRIES) */}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" /> Step 2: Register Student (Chargeable Stage)
                </h3>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  Select candidate from visited inquiries • Standard Registration Fee: ₹1,500
                </p>
              </div>
              <button onClick={() => setShowRegistrationModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRegistration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  Select Inquiry Candidate * (Strict Rule: Only Inquiry Visited Students Allowed)
                </label>
                {inquiryCandidates.length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold">
                    ⚠️ No pending Inquiry candidates available. Please add an Inquiry first in Step 1.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedInquiryId}
                    onChange={(e) => {
                      setSelectedInquiryId(e.target.value);
                      const selected = inquiryCandidates.find((c) => c.id === e.target.value);
                      if (selected) {
                        setRegClass(selected.applyingClass);
                        const customFee = getClassFeeStructure(selected.applyingClass);
                        setRegFeeAmount(customFee.registrationFee);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="">-- Choose Candidate From Inquiry List ({inquiryCandidates.length} Pending) --</option>
                    {inquiryCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.studentName} ({c.applyingClass}) — Parent: {c.parentName} ({c.contactNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedInquiryId && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">Registration Fee Amount:</span>
                    <span className="font-extrabold text-emerald-600">₹{regFeeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">Target Applying Class:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{regClass}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedInquiryId}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow cursor-pointer"
                >
                  Collect ₹1,500 Fee & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: ADMISSION MODAL (CHARGEABLE, RESTRICTED TO REGISTERED STUDENTS) */}
      {showAdmissionStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" /> Step 3: Process Final Admission
                </h3>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  Select candidate from Registered list • Generate Offer Letter & Dues
                </p>
              </div>
              <button onClick={() => setShowAdmissionStepModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessAdmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                  Select Registered Candidate * (Strict Rule: Only Registered Students Allowed)
                </label>
                {registeredCandidates.length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold">
                    ⚠️ No registered candidates available. Please register an Inquiry candidate in Step 2 first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedRegistrationId}
                    onChange={(e) => setSelectedRegistrationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-purple-50/60 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="">-- Choose Candidate From Registration List ({registeredCandidates.length} Registered) --</option>
                    {registeredCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.studentName} ({c.applyingClass}) — Parent: {c.parentName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedRegistrationId && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Admission Dues Breakdown:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-slate-500">Admission Fee:</span> <span className="font-bold text-right">₹25,000</span>
                    <span className="text-slate-500">Tuition Fee:</span> <span className="font-bold text-right">₹18,000</span>
                    <span className="text-slate-500">Transport & Lab:</span> <span className="font-bold text-right">₹7,500</span>
                    <span className="text-slate-700 font-extrabold border-t pt-1">Total Fee Dues:</span>
                    <span className="font-black text-purple-600 border-t pt-1 text-right">₹50,500</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdmissionStepModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRegistrationId}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow cursor-pointer"
                >
                  Advance to Final Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
