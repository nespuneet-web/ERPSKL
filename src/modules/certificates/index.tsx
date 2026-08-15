import React, { useState } from 'react';
import { Award, Printer, ShieldCheck, UserCheck, FileText, CheckCircle2, Search, GraduationCap } from 'lucide-react';
import { useSisStore } from '../sis/sisStore';
import { useSettingsStore } from '../settings/settingsStore';

export const CertificatesModule: React.FC = () => {
  const { students } = useSisStore();
  const { profile } = useSettingsStore();

  const [certType, setCertType] = useState<'Transfer Certificate (TC)' | 'Character Certificate' | 'Bonafide Certificate' | 'Sports Merit Certificate'>('Transfer Certificate (TC)');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [conduct, setConduct] = useState('Exemplary & Good');
  const [reasonForLeaving, setReasonForLeaving] = useState('Parent Relocation / Higher Studies');
  const [remarks, setRemarks] = useState('All school dues cleared. Sincere and hardworking student.');
  const [certificateNo, setCertificateNo] = useState(`CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.currentClass}-${s.section}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0] || {
    fullName: 'Aarav Sharma',
    admissionNo: 'ADM-2024-001',
    currentClass: 'Class 10',
    section: 'A',
    gender: 'Male',
    dob: '2010-05-15',
    admissionDate: '2020-04-01',
    parents: {
      fatherName: 'Mr. Rajesh Sharma',
      motherName: 'Mrs. Sunita Sharma',
      address: 'Civil Lines, Green Park'
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            Official Document & Certification Engine
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Certificates & Official Records Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Instantly generate verified Transfer Certificates (TC), Character Certificates, Bonafide Letters, and Sports Accolades connected directly to SIS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-indigo-600" /> Certificate Parameters
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Type</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
              <option value="Character Certificate">Character Certificate</option>
              <option value="Bonafide Certificate">Bonafide Certificate</option>
              <option value="Sports Merit Certificate">Sports Merit Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Search & Select Student</label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNo}) — {s.currentClass}-{s.section}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate No</label>
              <input
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Issue</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Conduct & Character</label>
            <input
              type="text"
              value={conduct}
              onChange={(e) => setConduct(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {certType === 'Transfer Certificate (TC)' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Leaving</label>
              <input
                type="text"
                value={reasonForLeaving}
                onChange={(e) => setReasonForLeaving(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">General Remarks / Dues</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Live Certificate Preview Document */}
        <div className="lg:col-span-2 bg-white text-slate-900 p-8 sm:p-10 rounded-2xl border-4 border-indigo-950 shadow-2xl space-y-6 relative print:border-none print:shadow-none">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <GraduationCap className="w-80 h-80 text-indigo-950" />
          </div>

          {/* School Header */}
          <div className="text-center border-b-2 border-indigo-950 pb-5 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-indigo-950 tracking-wide">
              {profile.schoolName || 'ST. XAVIER HIGHER SECONDARY SCHOOL'}
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              {profile.address || 'Affiliated to CBSE, New Delhi • School Code: ' + (profile.schoolCode || 'SCH-9921')}
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded-full bg-indigo-950 text-white font-extrabold text-xs tracking-widest uppercase shadow">
                {certType}
              </span>
            </div>
          </div>

          {/* Certificate Metadata Bar */}
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700 border-b border-slate-200 pb-2">
            <span>Certificate No: <strong>{certificateNo}</strong></span>
            <span>Date: <strong>{issueDate}</strong></span>
          </div>

          {/* Certificate Body */}
          <div className="text-sm leading-relaxed space-y-4 py-2">
            {certType === 'Transfer Certificate (TC)' && (
              <>
                <p>
                  This is to certify that <strong>{selectedStudent.fullName}</strong>, bearing Admission Number <strong>{selectedStudent.admissionNo}</strong>, was admitted to this institution on <strong>{selectedStudent.admissionDate || '01-04-2020'}</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p><strong>Father's Name:</strong> {selectedStudent.parents?.fatherName || 'N/A'}</p>
                  <p><strong>Mother's Name:</strong> {selectedStudent.parents?.motherName || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {selectedStudent.dob || '15-05-2010'}</p>
                  <p><strong>Class in which studying:</strong> {selectedStudent.currentClass} - Section {selectedStudent.section}</p>
                  <p><strong>Category:</strong> {selectedStudent.category || 'General'}</p>
                  <p><strong>School Dues Status:</strong> Cleared till date</p>
                </div>
                <p>
                  Reason for leaving the school: <strong>{reasonForLeaving}</strong>.
                </p>
                <p>
                  General Conduct and Character: <strong>{conduct}</strong>.
                </p>
                <p className="text-xs text-slate-600 italic">
                  Remarks: {remarks}
                </p>
              </>
            )}

            {certType === 'Character Certificate' && (
              <>
                <p>
                  This is to certify that <strong>{selectedStudent.fullName}</strong>, Son/Daughter of <strong>{selectedStudent.parents?.fatherName || 'Parent'}</strong>, is/was a bonafide student of this institution studying in <strong>{selectedStudent.currentClass} - Section {selectedStudent.section}</strong> (Admission No: <strong>{selectedStudent.admissionNo}</strong>).
                </p>
                <p>
                  To the best of our knowledge and belief, he/she bears an <strong>{conduct}</strong> moral character, demonstrates leadership, and has not shown any misconduct during his/her tenure at this school.
                </p>
                <p className="text-xs text-slate-600 italic">
                  Remarks: {remarks} We wish him/her all the best in future endeavors.
                </p>
              </>
            )}

            {certType === 'Bonafide Certificate' && (
              <>
                <p>
                  This is to certify that <strong>{selectedStudent.fullName}</strong>, Son/Daughter of <strong>{selectedStudent.parents?.fatherName || 'Parent'}</strong>, residing at <strong>{selectedStudent.parents?.address || 'City Center'}</strong>, is a bonafide student of this institution currently enrolled in <strong>{selectedStudent.currentClass} - Section {selectedStudent.section}</strong> for the Academic Session 2025-2026.
                </p>
                <p>
                  His/Her registered Admission Number is <strong>{selectedStudent.admissionNo}</strong> and Date of Birth as per school records is <strong>{selectedStudent.dob || '15-05-2010'}</strong>.
                </p>
                <p className="text-xs text-slate-600">
                  This certificate is issued upon the request of the student/parent for official administrative purposes.
                </p>
              </>
            )}

            {certType === 'Sports Merit Certificate' && (
              <>
                <p>
                  This certificate of sports excellence is proudly awarded to <strong>{selectedStudent.fullName}</strong> of <strong>{selectedStudent.currentClass}-{selectedStudent.section}</strong> in recognition of outstanding performance and dedication in Inter-School Sports & Athletics Competitions.
                </p>
                <p>
                  General Sportsmanship & Conduct: <strong>{conduct}</strong>.
                </p>
                <p className="text-xs text-slate-600 italic">
                  Remarks: {remarks}
                </p>
              </>
            )}
          </div>

          {/* Signature Block */}
          <div className="flex justify-between items-end pt-8 text-xs font-bold">
            <div className="text-center">
              <div className="w-32 border-b-2 border-slate-700 mb-1"></div>
              <p className="text-slate-700">Class Teacher</p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b-2 border-slate-700 mb-1"></div>
              <p className="text-slate-700">School Seal / Stamp</p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b-2 border-slate-900 mb-1"></div>
              <p className="text-indigo-950 font-black">Principal / Head of Institution</p>
            </div>
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRemarks('All school dues cleared. Sincere and hardworking student.');
                  setReasonForLeaving('Parent Relocation / Higher Studies');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-all flex items-center gap-1"
              >
                ← Reset Defaults
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

