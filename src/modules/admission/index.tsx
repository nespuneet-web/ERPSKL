import React, { useState } from 'react';
import { useAdmissionStore } from './admissionStore';
import { useAcademicPermissions } from './academicPermissionStore';
import { AdmissionLetterModal } from './AdmissionLetterModal';
import { AdmissionApplication } from '../../types/admission';
import { UserPlus, Search, CheckCircle, Clock, FileText, Award, Layers, ShieldCheck, Lock, Unlock, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdmissionModule: React.FC = () => {
  const { applications, seats, syncStatus, addApplication, updateApplicationStatus } = useAdmissionStore();
  const { permissions, globalReportCardActive, setGlobalReportCardActive, toggleStudentPermission, grantAllPermissions, revokeAllPermissions } = useAcademicPermissions();

  const [activeSection, setActiveSection] = useState<'applications' | 'exam_permissions'>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showOfferModal, setShowOfferModal] = useState<AdmissionApplication | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  // New lead form state
  const [studentName, setStudentName] = useState('');
  const [applyingClass, setApplyingClass] = useState('Class 6');
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');

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

    addApplication({
      studentName,
      applyingClass,
      gender: 'Male',
      dob: '2014-05-10',
      parentName,
      contactNumber,
      email,
      previousSchool,
      feePaid: true,
      registrationFee: 1500,
      documentsUploaded: ['10th Marksheet', 'Transfer Certificate', 'Aadhaar']
    });

    setStudentName('');
    setParentName('');
    setContactNumber('');
    setEmail('');
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
                {permissions.map((p) => (
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

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Applying Class</label>
                <select
                  value={applyingClass}
                  onChange={(e) => setApplyingClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Nursery">Nursery</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 11 Science">Class 11 Science</option>
                </select>
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
