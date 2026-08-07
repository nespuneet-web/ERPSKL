import React, { useState } from 'react';
import { useAdmissionStore } from './admissionStore';
import { AdmissionLetterModal } from './AdmissionLetterModal';
import { AdmissionApplication } from '../../types/admission';
import { UserPlus, Search, CheckCircle, Clock, FileText, Award, Layers } from 'lucide-react';

export const AdmissionModule: React.FC = () => {
  const { applications, seats, addApplication, updateApplicationStatus } = useAdmissionStore();

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
