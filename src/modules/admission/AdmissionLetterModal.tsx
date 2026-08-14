import React, { useState } from 'react';
import { AdmissionApplication, ACADEMIC_MONTHS } from '../../types/admission';
import { useSisStore } from '../sis/sisStore';
import { autoSyncAppToSis } from './admissionStore';
import { calculateClassTuitionForMonth } from '../fees/feeStructureStore';
import {
  X,
  Printer,
  CheckCircle,
  ShieldCheck,
  Save,
  DollarSign,
  FileCheck,
  QrCode,
  UserPlus,
  Calendar,
  BookOpen,
  Award,
  FileText,
  UserCheck
} from 'lucide-react';

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
  const { addStudent, students } = useSisStore();
  const [isSaved, setIsSaved] = useState(application.offerLetterSaved || false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [enrollInDirectory, setEnrollInDirectory] = useState(true);
  const [startMonth, setStartMonth] = useState(application.feeApplicableFromMonth || 'April');

  // Prorated fee calculations
  const feeCalc = calculateClassTuitionForMonth(application.applyingClass, startMonth);

  // Editable Fee Breakdown heads initialized from application or class fee calculation
  const [feeHeads, setFeeHeads] = useState({
    registrationFee: application.feeBreakdown?.registrationFee || application.registrationFee || feeCalc.structure.registrationFee,
    admissionFee: application.feeBreakdown?.admissionFee || feeCalc.structure.admissionFee,
    tuitionFee: application.feeBreakdown?.tuitionFee || feeCalc.tuitionFeeCalculated,
    transportFee: application.feeBreakdown?.transportFee || (application.studentCategory === 'Hosteler' ? 0 : feeCalc.structure.transportFee),
    commitmentFee: application.feeBreakdown?.commitmentFee || feeCalc.structure.commitmentFee,
    labFee: application.feeBreakdown?.labFee || feeCalc.structure.labFee
  });

  // Recalculate tuition if startMonth changes
  const handleStartMonthChange = (newMonth: string) => {
    setStartMonth(newMonth);
    const updatedCalc = calculateClassTuitionForMonth(application.applyingClass, newMonth);
    setFeeHeads((prev) => ({
      ...prev,
      tuitionFee: updatedCalc.tuitionFeeCalculated
    }));
  };

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
      feeApplicableFromMonth: startMonth,
      offerLetterSaved: true,
      offerLetterSavedAt: new Date().toLocaleString(),
      feeBreakdown: {
        ...feeHeads,
        totalFee: totalCalculatedFee
      }
    };

    // If "Enroll in Student Information Directory" is checked, ensure candidate is directly in SIS
    if (enrollInDirectory) {
      autoSyncAppToSis(updatedApp);
    }

    if (onSaveOfferLetter) {
      onSaveOfferLetter(updatedApp);
    }

    setIsSaved(true);
    setSaveBanner(
      enrollInDirectory
        ? 'Offer letter saved & candidate enrolled directly into Student Information Directory (SIS)!'
        : 'Offer letter saved to school admission records!'
    );
    setTimeout(() => setSaveBanner(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative my-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Official Admission Offer Letter</h2>
              <p className="text-xs text-slate-500">Ref: {application.applicationNo} • Student: {application.studentName} ({application.applyingClass})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToSystem}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" /> Save & Send Offer Letter
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

        {/* DIRECTORY SYNC OPTION BANNER (Triggered when sending offer letter) */}
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between print:hidden text-xs">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="font-bold text-indigo-950">Student Information Directory (SIS) Synchronization</span>
              <p className="text-[11px] text-slate-600">
                Instantly populate this student into the Master Student Directory upon issuing the Offer Letter.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-900">
            <input
              type="checkbox"
              checked={enrollInDirectory}
              onChange={(e) => setEnrollInDirectory(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            Add to SIS Directory
          </label>
        </div>

        {/* CUSTOMIZABLE FEE HEADS & MONTH PRORATION EDITOR */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Customizable Admission Fee Structure & Proration
            </h4>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Fee Applicable From:</span>
              <select
                value={startMonth}
                onChange={(e) => handleStartMonthChange(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              >
                {ACADEMIC_MONTHS.map((m) => (
                  <option key={m.month} value={m.month}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
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
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                Tuition Fee ({feeCalc.monthsCharged}/12 mos) (₹)
              </label>
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

          {/* CANDIDATE & ADMISSION DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider">Candidate Name</p>
              <p className="font-extrabold text-base text-slate-900">{application.studentName}</p>
              <p className="text-slate-700 font-medium">
                Father / Guardian: <strong>{application.parentName}</strong> ({application.parentOccupation || 'Professional'})
              </p>
              <p className="text-slate-600">Contact: {application.contactNumber} | Email: {application.email}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-slate-700">
                <strong>Category:</strong> {application.studentCategory || 'Day Scholar'}
              </p>
              <p className="text-slate-700">
                <strong>Date of Joining:</strong> {application.dateOfJoining || '2026-04-01'}
              </p>
              <p className="text-slate-700">
                <strong>Previous School & Class:</strong> {application.previousSchool || 'Fresher'} ({application.previousSchoolClass || 'Playgroup (PG)'})
              </p>
              <p className="text-emerald-700 font-bold">
                <strong>Fee Applicable From:</strong> {startMonth} (Session 2026-27)
              </p>
            </div>
          </div>

          {/* ENTRANCE TEST EVALUATION SUMMARY */}
          {application.entranceTestScore !== undefined && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950">
                  Entrance Evaluation Result: {application.entranceTestScore} / {application.entranceTestMaxMarks || 40} Marks ({application.entranceTestStatus || 'Passed'})
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-600">
                {application.interviewRemarks || 'Aptitude Qualified'}
              </span>
            </div>
          )}

          {/* SPECIAL ADMISSION REMARKS / DISCOUNT */}
          {application.admissionRemarks && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-0.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Special Remark / Concession Approved:
              </div>
              <p className="text-amber-800 font-medium italic">{application.admissionRemarks}</p>
            </div>
          )}

          {/* LETTER TEXT */}
          <p className="leading-relaxed text-slate-800 text-xs sm:text-sm">
            Dear Candidate & Parents,
            <br /><br />
            We are pleased to inform you that following your entrance examination performance and admission review, you have been provisionally selected for admission into <strong>{application.applyingClass}</strong> for the Academic Session 2026-2027 as a <strong>{application.studentCategory || 'Day Scholar'}</strong>.
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
                <span className="text-slate-500 block text-[10px]">Prorated Tuition ({startMonth} Start)</span>
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
