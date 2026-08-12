import React, { useState } from 'react';
import { AdmissionApplication } from '../../types/admission';
import { X, Printer, CheckCircle, ShieldCheck, Save, DollarSign, FileCheck, QrCode } from 'lucide-react';

interface AdmissionLetterModalProps {
  application: AdmissionApplication;
  onClose: () => void;
  onSaveOfferLetter?: (updatedApp: AdmissionApplication) => void;
}

export const AdmissionLetterModal: React.FC<AdmissionLetterModalProps> = ({
  application,
  onClose,
  onSaveOfferLetter
}) => {
  const [isSaved, setIsSaved] = useState(application.offerLetterSaved || false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Editable Fee Breakdown heads
  const [feeHeads, setFeeHeads] = useState({
    registrationFee: application.feeBreakdown?.registrationFee || application.registrationFee || 1500,
    admissionFee: application.feeBreakdown?.admissionFee || 25000,
    tuitionFee: application.feeBreakdown?.tuitionFee || 18000,
    transportFee: application.feeBreakdown?.transportFee || 4500,
    commitmentFee: application.feeBreakdown?.commitmentFee || 5000,
    labFee: application.feeBreakdown?.labFee || 3000
  });

  const totalCalculatedFee =
    feeHeads.registrationFee +
    feeHeads.admissionFee +
    feeHeads.tuitionFee +
    feeHeads.transportFee +
    feeHeads.commitmentFee +
    feeHeads.labFee;

  const handleSaveToSystem = () => {
    const updatedApp: AdmissionApplication = {
      ...application,
      status: 'Offered',
      offerLetterSaved: true,
      offerLetterSavedAt: new Date().toLocaleString(),
      feeBreakdown: {
        ...feeHeads,
        totalFee: totalCalculatedFee
      }
    };

    if (onSaveOfferLetter) {
      onSaveOfferLetter(updatedApp);
    }

    setIsSaved(true);
    setSaveBanner('Offer letter successfully saved to school record system!');
    setTimeout(() => setSaveBanner(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative my-8 space-y-6">
        
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Official Admission Offer Letter</h2>
              <p className="text-xs text-slate-500">Ref: {application.applicationNo} • Student: {application.studentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToSystem}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" /> Save Offer Letter
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" /> Print Letter
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
              title="Close Offer Letter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SAVE NOTIFICATION BANNER */}
        {saveBanner && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold rounded-xl flex items-center gap-2 animate-fade-in print:hidden">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveBanner}</span>
          </div>
        )}

        {/* CUSTOMIZABLE FEE HEADS EDITOR (COLLAPSIBLE / EDITABLE FOR ADMIN) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 print:hidden">
          <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Customizable Admission Fee Structure Heads
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Registration Fee (₹)</label>
              <input
                type="number"
                value={feeHeads.registrationFee}
                onChange={(e) => setFeeHeads({ ...feeHeads, registrationFee: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Admission Fee (₹)</label>
              <input
                type="number"
                value={feeHeads.admissionFee}
                onChange={(e) => setFeeHeads({ ...feeHeads, admissionFee: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Tuition Fee 1st Term (₹)</label>
              <input
                type="number"
                value={feeHeads.tuitionFee}
                onChange={(e) => setFeeHeads({ ...feeHeads, tuitionFee: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Transport Fee (₹)</label>
              <input
                type="number"
                value={feeHeads.transportFee}
                onChange={(e) => setFeeHeads({ ...feeHeads, transportFee: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Commitment Charges (₹)</label>
              <input
                type="number"
                value={feeHeads.commitmentFee}
                onChange={(e) => setFeeHeads({ ...feeHeads, commitmentFee: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lab & Activity Fee (₹)</label>
              <input
                type="number"
                value={feeHeads.labFee}
                onChange={(e) => setFeeHeads({ ...feeHeads, labFee: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-600">Total Admission Payable Amount:</span>
            <span className="text-sm font-black text-indigo-700 font-mono">₹{totalCalculatedFee.toLocaleString('en-IN')}/-</span>
          </div>
        </div>

        {/* PRINTABLE OFFER LETTER BODY */}
        <div className="p-8 border-2 border-slate-900 rounded-xl space-y-6 text-sm bg-white">
          
          {/* LETTERHEAD */}
          <div className="text-center border-b-2 border-slate-800 pb-5">
            <h1 className="text-2xl font-black tracking-wide text-indigo-950 uppercase">ST. XAVIER HIGHER SECONDARY SCHOOL</h1>
            <p className="text-xs text-slate-600 font-medium">10, Institutional Area, Sector 15, New Delhi - 110001 • CBSE Affiliated</p>
            <p className="text-xs font-extrabold text-indigo-800 mt-2 uppercase tracking-widest bg-indigo-50 py-1 inline-block px-4 rounded-full border border-indigo-200">
              OFFICE OF THE ADMISSION COMMITTEE • SESSION 2026-2027
            </p>
          </div>

          {/* REF & DATE */}
          <div className="flex justify-between text-xs text-slate-600 font-mono border-b pb-3">
            <p><strong>Ref No:</strong> {application.applicationNo}/2026</p>
            <p><strong>Offer Date:</strong> {application.applicationDate}</p>
          </div>

          {/* CANDIDATE & PARENT OCCUPATION DETAILS */}
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-slate-500 uppercase tracking-wider">To,</p>
            <p className="font-extrabold text-base text-slate-900">{application.studentName}</p>
            <p className="text-slate-700 font-medium">Father / Guardian: <strong>{application.parentName}</strong> ({application.parentOccupation || 'Professional'})</p>
            <p className="text-slate-600">Contact: {application.contactNumber} | Email: {application.email}</p>
            <p className="text-slate-600">Previous Institution: {application.previousSchool}</p>
          </div>

          {/* LETTER TEXT */}
          <p className="leading-relaxed text-slate-800 text-xs sm:text-sm">
            Dear Candidate & Parents,
            <br /><br />
            We are pleased to inform you that following your entrance examination performance score (<strong>{application.entranceTestScore || 90} / {application.entranceTestMaxMarks || 100}</strong>) and interview evaluation, you have been provisionally selected for admission into <strong>{application.applyingClass}</strong> for the Academic Session 2026-2027.
          </p>

          {/* ITEMIZED FEE TABLE */}
          <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
            <p className="font-bold text-slate-900 border-b pb-1">Approved Fee Structure Head Details:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded border">
                <span className="text-slate-500 block text-[10px]">Registration Fee</span>
                <strong className="text-slate-800">₹{feeHeads.registrationFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-2 bg-white rounded border">
                <span className="text-slate-500 block text-[10px]">Admission Fee</span>
                <strong className="text-slate-800">₹{feeHeads.admissionFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-2 bg-white rounded border">
                <span className="text-slate-500 block text-[10px]">Tuition Fee (1st Term)</span>
                <strong className="text-slate-800">₹{feeHeads.tuitionFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-2 bg-white rounded border">
                <span className="text-slate-500 block text-[10px]">Transport Fee</span>
                <strong className="text-slate-800">₹{feeHeads.transportFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-2 bg-white rounded border">
                <span className="text-slate-500 block text-[10px]">Commitment Charges</span>
                <strong className="text-slate-800">₹{feeHeads.commitmentFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-2 bg-white rounded border">
                <span className="text-slate-500 block text-[10px]">Lab / Activity Fee</span>
                <strong className="text-slate-800">₹{feeHeads.labFee.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t font-bold text-slate-900 text-sm">
              <span>Total Payable Dues:</span>
              <span className="text-indigo-900 font-black font-mono">₹{totalCalculatedFee.toLocaleString('en-IN')}/-</span>
            </div>
          </div>

          {/* SIGNATURE & SEAL FOOTER */}
          <div className="pt-6 flex justify-between items-end text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle className="w-4 h-4" /> SEAT PROVISIONALLY ALLOCATED
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Digitally Validated • Offer Passcode: ADM-OFFER-{application.id.slice(-6)}</p>
            </div>

            <div className="text-center">
              <div className="w-36 border-b-2 border-slate-800 mb-1"></div>
              <p className="font-extrabold text-slate-900">Admission Officer</p>
              <p className="text-[10px] text-slate-500">St. Xavier Higher Secondary School</p>
            </div>
          </div>

        </div>

        {/* BOTTOM MODAL CLOSE BUTTON */}
        <div className="flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
