import React from 'react';
import { AdmissionApplication } from '../../types/admission';
import { X, Printer, Shield, QrCode, UserCheck, Phone, Briefcase, Calendar, Award, Building2 } from 'lucide-react';

interface ParentIdCardModalProps {
  application: AdmissionApplication;
  onClose: () => void;
}

export const ParentIdCardModal: React.FC<ParentIdCardModalProps> = ({ application, onClose }) => {
  const gatePassCode = application.emergencyPassCode || `PASS-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8 space-y-6 border border-slate-200 dark:border-slate-800">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold">Parent ID Card & Short Leave Pickup Pass</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print ID Card
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PARENT ID CARD CANVAS */}
        <div className="mx-auto max-w-md bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-2xl border-2 border-amber-400/60 relative overflow-hidden space-y-5">
          
          {/* WATERMARK BACKGROUND DECORATION */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <Building2 className="w-64 h-64 text-white" />
          </div>

          {/* CARD TOP HEADER */}
          <div className="text-center border-b border-white/20 pb-3 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow">
              <Award className="w-3 h-3" /> PARENT SHORT LEAVE / HALF-DAY PICKUP CARD
            </div>
            <h2 className="text-lg font-black tracking-wider text-white">ST. XAVIER HIGHER SECONDARY SCHOOL</h2>
            <p className="text-[10px] text-indigo-200">10, Institutional Area, Sector 15, New Delhi • Session 2026-2027</p>
          </div>

          {/* CARD BODY CONTENT */}
          <div className="grid grid-cols-3 gap-4 items-center">
            
            {/* PARENT AVATAR / PHOTO */}
            <div className="space-y-2 text-center col-span-1">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-white/10 border-2 border-amber-400 p-1 overflow-hidden shadow-inner flex items-center justify-center">
                {application.parentPhotoUrl ? (
                  <img src={application.parentPhotoUrl} alt={application.parentName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-indigo-800 flex items-center justify-center font-black text-2xl text-amber-300 rounded-xl">
                    {application.parentName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-white uppercase">
                VERIFIED PARENT
              </span>
            </div>

            {/* PARENT & STUDENT DETAILS */}
            <div className="col-span-2 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase block">Parent / Guardian Name</span>
                <strong className="text-base text-amber-300 font-extrabold block truncate">{application.parentName}</strong>
              </div>

              <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{application.parentOccupation || 'Doctor / Professional'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{application.contactNumber}</span>
              </div>

              <div className="pt-2 border-t border-white/20">
                <span className="text-[10px] font-bold text-indigo-300 uppercase block">Authorized Student</span>
                <p className="font-extrabold text-white text-sm">
                  {application.studentName} <span className="text-amber-300">({application.applyingClass})</span>
                </p>
                <p className="text-[10px] text-indigo-200">App No: {application.applicationNo}</p>
              </div>
            </div>

          </div>

          {/* FOOTER BAR WITH QR CODE & PERMISSIONS */}
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-between gap-3 text-[10px]">
            <div className="space-y-0.5">
              <p className="text-emerald-300 font-extrabold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Short Leave Gate Security Clear
              </p>
              <p className="text-slate-300 font-mono">Pass Code: {gatePassCode}</p>
            </div>

            <div className="w-12 h-12 bg-white rounded-lg p-1 text-slate-950 flex items-center justify-center shrink-0">
              <QrCode className="w-full h-full" />
            </div>
          </div>

        </div>

        {/* MODAL FOOTER ACTION BAR WITH BACK / CANCEL / CLOSE / PRINT BUTTONS */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-all"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl cursor-pointer transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Parent Card
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
