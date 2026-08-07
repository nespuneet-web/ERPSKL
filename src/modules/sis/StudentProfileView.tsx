import React, { useState } from 'react';
import { Student } from '../../types/sis';
import { ArrowLeft, User, Users, GraduationCap, Heart, FileText, Bus, Home, ShieldCheck, Download, CheckCircle, Upload } from 'lucide-react';

interface StudentProfileViewProps {
  student: Student;
  onBack: () => void;
  onUploadDocument: (studentId: string, doc: { title: string; type: any; fileName: string; url: string }) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student, onBack, onUploadDocument }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'parents' | 'academic' | 'medical' | 'documents' | 'services'>('personal');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<any>('Birth Certificate');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleDocUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    onUploadDocument(student.id, {
      title: docTitle,
      type: docType,
      fileName: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      url: '#'
    });
    setDocTitle('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Student Directory
      </button>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={student.photoUrl}
              alt={student.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {student.status}
                </span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {student.currentClass} - Section {student.section} | Roll No: <span className="font-semibold text-slate-900 dark:text-white">{student.rollNo}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                <span>Admission No: <strong className="text-slate-800 dark:text-slate-200">{student.admissionNo}</strong></span>
                <span>•</span>
                <span>PEN: <strong className="text-indigo-600 dark:text-indigo-400">{student.penNo}</strong></span>
                <span>•</span>
                <span>APAAR ID: <strong className="text-indigo-600 dark:text-indigo-400">{student.apaarId}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              House: <strong className="text-indigo-600 dark:text-indigo-400">{student.house}</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mt-6 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal & Demographics', icon: User },
            { id: 'parents', label: 'Parents & Guardian', icon: Users },
            { id: 'academic', label: 'Academic & Promotion', icon: GraduationCap },
            { id: 'medical', label: 'Medical Info', icon: Heart },
            { id: 'documents', label: 'Documents Vault', icon: FileText },
            { id: 'services', label: 'Transport & Hostel', icon: Bus }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium">Full Name</p>
              <p className="text-slate-900 dark:text-white font-medium mt-0.5">{student.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Gender</p>
              <p className="text-slate-900 dark:text-white font-medium mt-0.5">{student.gender}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Date of Birth</p>
              <p className="text-slate-900 dark:text-white font-medium mt-0.5">{student.dob}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Aadhaar Number</p>
              <p className="text-slate-900 dark:text-white font-mono mt-0.5">{student.aadhaarNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Permanent Education Number (PEN)</p>
              <p className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold mt-0.5">{student.penNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">APAAR ID</p>
              <p className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold mt-0.5">{student.apaarId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Category</p>
              <p className="text-slate-900 dark:text-white font-medium mt-0.5">{student.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Religion</p>
              <p className="text-slate-900 dark:text-white font-medium mt-0.5">{student.religion}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Mother Tongue</p>
              <p className="text-slate-900 dark:text-white font-medium mt-0.5">{student.motherTongue}</p>
            </div>
          </div>
        )}

        {activeTab === 'parents' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Father's Details</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-slate-400">Name:</span> {student.parents.fatherName}</p>
                  <p><span className="text-slate-400">Occupation:</span> {student.parents.fatherOccupation}</p>
                  <p><span className="text-slate-400">Mobile:</span> {student.parents.fatherMobile}</p>
                  <p><span className="text-slate-400">Email:</span> {student.parents.fatherEmail}</p>
                  <p><span className="text-slate-400">Annual Income:</span> {student.parents.fatherIncome}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Mother's Details</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-slate-400">Name:</span> {student.parents.motherName}</p>
                  <p><span className="text-slate-400">Occupation:</span> {student.parents.motherOccupation}</p>
                  <p><span className="text-slate-400">Mobile:</span> {student.parents.motherMobile}</p>
                  <p><span className="text-slate-400">Email:</span> {student.parents.motherEmail}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Residential Address & Emergency</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{student.parents.address}</p>
              <p className="text-xs text-rose-500 font-medium mt-2">Emergency Contact: {student.parents.emergencyContact}</p>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Admission Class</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">{student.admissionClass}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Current Class & Sec</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">{student.currentClass} - {student.section}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Scholar Number</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">{student.scholarNo}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Promotion History</h3>
              {student.promotions.length === 0 ? (
                <p className="text-sm text-slate-500">No previous promotion history recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {student.promotions.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{p.academicYear}: {p.fromClassSection} → {p.toClassSection}</p>
                        <p className="text-xs text-slate-500">{p.remarks}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Blood Group</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{student.medical.bloodGroup}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Disability Information</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{student.medical.disability ? student.medical.disabilityDetails || 'Yes' : 'None Reported'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Allergies / Special Conditions</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{student.medical.allergies || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Doctor Contact</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{student.medical.doctorContact || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Verified Documents Vault</h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Custom Document
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {student.documents.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.type} • Uploaded {doc.uploadDate}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Bus className="w-6 h-6 text-amber-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Transport Service</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Status: {student.transportRequired ? <span className="text-emerald-600 font-semibold">Subscribed</span> : 'Not Subscribed'}
              </p>
              {student.transportRequired && (
                <p className="text-xs text-slate-500 mt-1">Route: {student.busRouteNo}</p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-purple-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Hostel Facility</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Status: {student.hostelRequired ? <span className="text-purple-600 font-semibold">Allocated</span> : 'Day Scholar'}
              </p>
              {student.hostelRequired && (
                <p className="text-xs text-slate-500 mt-1">Room: {student.hostelRoomNo}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Custom Document</h3>
            <form onSubmit={handleDocUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration Certificate"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Transfer Certificate">Transfer Certificate</option>
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="Category Certificate">Category Certificate</option>
                  <option value="Custom">Custom Document</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Upload & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
