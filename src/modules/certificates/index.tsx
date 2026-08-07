import React, { useState } from 'react';
import { Award, Printer, ShieldCheck } from 'lucide-react';

export const CertificatesModule: React.FC = () => {
  const [certType, setCertType] = useState('Transfer Certificate (TC)');
  const [studentName, setStudentName] = useState('Aarav Sharma');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Certificates & Official Documents Generator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instantly generate Transfer Certificate (TC), Character Certificate, Bonafide, and Sports Certificates.
          </p>
        </div>

        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
          <Printer className="w-4 h-4" /> Print Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Certificate Controls</h3>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Document Type</label>
            <select value={certType} onChange={(e) => setCertType(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white">
              <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
              <option value="Character Certificate">Character Certificate</option>
              <option value="Bonafide Certificate">Bonafide Certificate</option>
              <option value="Sports Merit Certificate">Sports Merit Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white" />
          </div>
        </div>

        <div className="md:col-span-2 bg-white text-slate-900 p-8 rounded-xl border-4 border-indigo-900 shadow-xl space-y-6">
          <div className="text-center border-b border-indigo-900 pb-4">
            <h1 className="text-2xl font-black uppercase text-indigo-950">ST. XAVIER HIGHER SECONDARY SCHOOL</h1>
            <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-widest">{certType.toUpperCase()}</p>
          </div>

          <p className="text-sm leading-relaxed">
            This is to certify that <strong>{studentName}</strong>, Son/Daughter of <strong>Mr. Rajesh Sharma</strong>, was a bonafide student of this institution studying in <strong>Class 10</strong> during the Academic Session 2025-2026. He/She bears a good moral character and has cleared all school fee dues.
          </p>

          <div className="flex justify-between items-end pt-8 text-xs font-bold">
            <p>Date of Issue: {new Date().toISOString().split('T')[0]}</p>
            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <p>Principal Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
