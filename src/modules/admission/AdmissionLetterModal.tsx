import React from 'react';
import { AdmissionApplication } from '../../types/admission';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface AdmissionLetterModalProps {
  application: AdmissionApplication;
  onClose: () => void;
}

export const AdmissionLetterModal: React.FC<AdmissionLetterModalProps> = ({ application, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative my-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold">Official Provisional Admission Letter</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              <Printer className="w-4 h-4" /> Print Offer Letter
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offer Letter Body */}
        <div className="p-8 border-2 border-slate-900 rounded-xl space-y-6 text-sm">
          <div className="text-center border-b border-slate-300 pb-4">
            <h1 className="text-2xl font-black tracking-wide text-indigo-900">ST. XAVIER HIGHER SECONDARY SCHOOL</h1>
            <p className="text-xs text-slate-500">10, Institutional Area, Sector 15, New Delhi - 110001</p>
            <p className="text-xs font-bold text-slate-700 mt-2 uppercase tracking-widest">
              OFFICE OF THE ADMISSION COMMITTEE
            </p>
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <p><strong>Ref No:</strong> {application.applicationNo}/2026</p>
            <p><strong>Date:</strong> {application.applicationDate}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">To,</p>
            <p className="font-bold text-base text-slate-900">{application.studentName}</p>
            <p className="text-slate-600">C/o {application.parentName}</p>
            <p className="text-slate-600">Contact: {application.contactNumber} | {application.email}</p>
          </div>

          <p className="leading-relaxed">
            Dear Student & Parents,
            <br /><br />
            We are pleased to inform you that following your entrance examination performance score (<strong>{application.entranceTestScore || 90} / {application.entranceTestMaxMarks || 100}</strong>) and interview evaluation, you have been provisionally selected for admission into <strong>{application.applyingClass}</strong> for the Academic Session 2026-2027.
          </p>

          <div className="p-4 bg-slate-50 border rounded-lg space-y-2 text-xs">
            <p className="font-bold text-slate-900">Next Steps & Payment Deadlines:</p>
            <p>• Admission Confirmation Fee: ₹25,000/- (Adjustable in 1st Term)</p>
            <p>• Registration Fee Paid Status: <span className="text-emerald-600 font-bold">VERIFIED</span></p>
            <p>• Documents Submitted: {application.documentsUploaded.join(', ') || 'TC, Aadhaar, Marksheets'}</p>
          </div>

          <div className="pt-6 flex justify-between items-end text-xs">
            <div>
              <p className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> SEAT ALLOCATED
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-800">Admission Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
