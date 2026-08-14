import React, { useState, useEffect } from 'react';
import {
  AdmissionApplication,
  AdmissionSiblingRecord,
  StudentCategoryType,
  ALL_SCHOOL_CLASSES,
  PREVIOUS_SCHOOL_CLASSES,
  ACADEMIC_MONTHS,
  PARENT_OCCUPATION_CATEGORIES,
  calculateFeeForStartMonth
} from '../../types/admission';
import { getClassFeeStructure, calculateClassTuitionForMonth } from '../fees/feeStructureStore';
import { checkAgeEligibility, AGE_CRITERIA_MAP } from '../../utils/ageEligibility';
import {
  peekNextNumber,
  SchoolNumberingSettings
} from './admissionNumberConfig';
import {
  X,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Users,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  DollarSign,
  Building,
  UserCheck,
  AlertTriangle,
  Heart,
  FileText,
  Calendar,
  Award,
  Hash,
  Settings,
  Percent,
  Sliders,
  Check,
  Send,
  Eye,
  Edit3
} from 'lucide-react';

/* ==================================================================== */
/* 1. ADD INQUIRY MODAL                                                */
/* ==================================================================== */
interface AddInquiryModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'applicationDate' | 'status' | 'feePaid' | 'registrationFee'>) => void;
}

export const AddInquiryModal: React.FC<AddInquiryModalProps> = ({ onClose, onSubmit }) => {
  const [studentName, setStudentName] = useState('');
  const [applyingClass, setApplyingClass] = useState('Class 1');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2019-05-10');
  const [parentName, setParentName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentOccupation, setParentOccupation] = useState<string>('Doctor / Surgeon / Medical Specialist');
  const [motherOccupation, setMotherOccupation] = useState<string>('Teacher / Professor / Educator');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousSchoolClass, setPreviousSchoolClass] = useState<string>('Playgroup (PG)');
  const [studentCategory, setStudentCategory] = useState<StudentCategoryType>('Day Scholar');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [feeApplicableFromMonth, setFeeApplicableFromMonth] = useState('April');
  const [admissionRemarks, setAdmissionRemarks] = useState('');
  const [inquirySource, setInquirySource] = useState<'Walk-in' | 'Website' | 'Referral' | 'Social Media' | 'Newspaper Ad'>('Walk-in');

  const nextInqNo = peekNextNumber('inquiry');
  const feeCalc = calculateClassTuitionForMonth(applyingClass, feeApplicableFromMonth);

  const ageEligibility = checkAgeEligibility(dob, applyingClass);
  const [forceAdmission, setForceAdmission] = useState(false);
  const [forceAdmissionReason, setForceAdmissionReason] = useState('');
  const [forceAdmissionAuthorizedBy, setForceAdmissionAuthorizedBy] = useState('Principal Dr. S. Radhakrishnan');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentName || !contactNumber) return;

    if (!ageEligibility.isEligible && !forceAdmission) {
      alert('The child is not eligible for the selected class based on the age criteria. Please click "FORCE ADMISSION" to authorize an age override.');
      return;
    }

    onSubmit({
      studentName,
      applyingClass,
      gender,
      dob,
      parentName,
      motherName,
      parentOccupation,
      motherOccupation,
      contactNumber,
      email,
      address,
      previousSchool: previousSchool || 'None',
      previousSchoolClass,
      studentCategory,
      dateOfJoining,
      feeApplicableFromMonth,
      admissionRemarks,
      inquirySource,
      documentsUploaded: [],
      isAgeEligible: ageEligibility.isEligible,
      calculatedAgeYears: ageEligibility.calculatedYears,
      forceAdmission,
      forceAdmissionReason: forceAdmission ? (forceAdmissionReason || 'Authorized by Principal / Management') : undefined,
      forceAdmissionAuthorizedBy: forceAdmission ? forceAdmissionAuthorizedBy : undefined,
      forceAdmissionTimestamp: forceAdmission ? new Date().toISOString() : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">New Inquiry Lead</h3>
              <p className="text-xs text-slate-500">Record candidate inquiry into Central School Admission Pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
              <Lock className="w-3 h-3 text-indigo-500" />
              Auto ID: {nextInqNo}
            </span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AGE ELIGIBILITY BANNER */}
        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
          ageEligibility.isEligible
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center gap-2">
              {ageEligibility.isEligible ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>Age Criteria Check (as of 1 April 2026):</span>
            </div>
            <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {ageEligibility.formattedCalculatedAge}
            </span>
          </div>

          <p className="font-medium text-[11px] leading-relaxed">
            {ageEligibility.message}
          </p>

          {!ageEligibility.isEligible && (
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wide text-[10px]">
                  Age Threshold Conflict
                </span>
                <button
                  type="button"
                  onClick={() => setForceAdmission(!forceAdmission)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    forceAdmission
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {forceAdmission ? 'FORCE ADMISSION ENABLED' : 'FORCE ADMISSION'}
                </button>
              </div>

              {forceAdmission && (
                <div className="space-y-2 p-3 bg-amber-100/70 dark:bg-amber-900/50 rounded-xl border border-amber-300 dark:border-amber-700 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-amber-900 dark:text-amber-200 mb-0.5">
                        Authorizing Official *
                      </label>
                      <input
                        type="text"
                        value={forceAdmissionAuthorizedBy}
                        onChange={(e) => setForceAdmissionAuthorizedBy(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white font-bold"
                        placeholder="Authorized By (e.g. Principal)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-amber-900 dark:text-amber-200 mb-0.5">
                        Reason for Override *
                      </label>
                      <input
                        type="text"
                        value={forceAdmissionReason}
                        onChange={(e) => setForceAdmissionReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white font-bold"
                        placeholder="e.g., Near cutoff date / Management Discretion"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Child Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Applying Class *
              </label>
              <select
                value={applyingClass}
                onChange={(e) => setApplyingClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* STUDENT CATEGORY (Default: Day Scholar) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                Student Category (Default: Day Scholar) *
              </label>
              <select
                value={studentCategory}
                onChange={(e) => setStudentCategory(e.target.value as StudentCategoryType)}
                className="w-full px-3 py-2 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer"
              >
                <option value="Day Scholar">Day Scholar (Normal Standard Fee)</option>
                <option value="Hosteler">Hosteler (Boarding)</option>
                <option value="Staff Ward">Staff Ward (Employee Child)</option>
                <option value="Management Child">Management Child (Discretionary)</option>
                <option value="Government-Funded Student">Government-Funded / RTE Student</option>
                <option value="Normal Child">Normal Child</option>
              </select>
            </div>

            {/* DATE OF JOINING */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Date of Joining *
              </label>
              <input
                type="date"
                required
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Father / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mother's Name *
              </label>
              <input
                type="text"
                required
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="e.g. Sunita Sharma"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Father's Occupation
              </label>
              <select
                value={parentOccupation}
                onChange={(e) => setParentOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {PARENT_OCCUPATION_CATEGORIES.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mother's Occupation
              </label>
              <select
                value={motherOccupation}
                onChange={(e) => setMotherOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {PARENT_OCCUPATION_CATEGORIES.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. parent@example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Previous School Name
              </label>
              <input
                type="text"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                placeholder="e.g. Delhi Public School or None (Fresher)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* PREVIOUS SCHOOL CLASS DROPDOWN MENU */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Previous School Class *
              </label>
              <select
                value={previousSchoolClass}
                onChange={(e) => setPreviousSchoolClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {PREVIOUS_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* FEE APPLICABLE FROM MONTH (Proration Logic) */}
            <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Fee Applicable Start Month
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Tuition is automatically prorated based on admission month (e.g. July/August entries).
                  </p>
                </div>
                <select
                  value={feeApplicableFromMonth}
                  onChange={(e) => setFeeApplicableFromMonth(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {ACADEMIC_MONTHS.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Calculated Tuition for {applyingClass} ({feeCalc.fractionLabel}):
                </span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{feeCalc.tuitionFeeCalculated.toLocaleString()}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                    (Annual base: ₹{feeCalc.structure.tuitionFeeAnnual.toLocaleString()})
                  </span>
                </span>
              </div>
            </div>

            {/* ADMISSION REMARK / SPECIAL DISCOUNT / REFERENCE */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Admission Remarks / Special Reference / Concession Notes
              </label>
              <textarea
                rows={2}
                value={admissionRemarks}
                onChange={(e) => setAdmissionRemarks(e.target.value)}
                placeholder="e.g. Special reference by Director; 10% sibling concession approved; transfer case from Bangalore"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Inquiry Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* 2. ADD REGISTRATION MODAL                                            */
/* ==================================================================== */
interface AddRegistrationModalProps {
  inquiries: AdmissionApplication[];
  onClose: () => void;
  onSubmit: (inquiryId: string, regFee: number, details: Partial<AdmissionApplication>) => void;
}

export const AddRegistrationModal: React.FC<AddRegistrationModalProps> = ({
  inquiries,
  onClose,
  onSubmit
}) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState(inquiries[0]?.id || '');
  const [registrationFee, setRegistrationFee] = useState(1500);
  const [studentCategory, setStudentCategory] = useState<StudentCategoryType>('Day Scholar');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [feeApplicableFromMonth, setFeeApplicableFromMonth] = useState('April');
  const [previousSchoolClass, setPreviousSchoolClass] = useState('Playgroup (PG)');
  const [admissionRemarks, setAdmissionRemarks] = useState('');

  const nextRegNo = peekNextNumber('registration');
  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

  useEffect(() => {
    if (selectedInquiry) {
      const clsFee = getClassFeeStructure(selectedInquiry.applyingClass);
      setRegistrationFee(clsFee.registrationFee);
      if (selectedInquiry.studentCategory) setStudentCategory(selectedInquiry.studentCategory);
      if (selectedInquiry.dateOfJoining) setDateOfJoining(selectedInquiry.dateOfJoining);
      if (selectedInquiry.feeApplicableFromMonth) setFeeApplicableFromMonth(selectedInquiry.feeApplicableFromMonth);
      if (selectedInquiry.previousSchoolClass) setPreviousSchoolClass(selectedInquiry.previousSchoolClass);
      if (selectedInquiry.admissionRemarks) setAdmissionRemarks(selectedInquiry.admissionRemarks);
    }
  }, [selectedInquiryId, selectedInquiry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId) return;

    onSubmit(selectedInquiryId, registrationFee, {
      studentCategory,
      dateOfJoining,
      feeApplicableFromMonth,
      previousSchoolClass,
      admissionRemarks
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Register Inquiry Candidate (Step 2)</h3>
              <p className="text-xs text-slate-500">Collect Registration Fee & Assign Registration No</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
              <Lock className="w-3 h-3 text-indigo-500" />
              Auto Reg: {nextRegNo}
            </span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-extrabold">No Pending Inquiries Found</h4>
            <p className="text-xs text-slate-500">
              Please create an inquiry lead first from Step 1 before issuing a registration.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Inquiry Candidate *
              </label>
              <select
                value={selectedInquiryId}
                onChange={(e) => setSelectedInquiryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
              >
                {inquiries.map((inq) => (
                  <option key={inq.id} value={inq.id}>
                    {inq.studentName} ({inq.applyingClass}) - ID: {inq.applicationNo} - Parent: {inq.parentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Student Category (Default: Day Scholar)
                </label>
                <select
                  value={studentCategory}
                  onChange={(e) => setStudentCategory(e.target.value as StudentCategoryType)}
                  className="w-full px-3 py-2 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold cursor-pointer"
                >
                  <option value="Day Scholar">Day Scholar (Normal Standard Fee)</option>
                  <option value="Hosteler">Hosteler (Boarding)</option>
                  <option value="Staff Ward">Staff Ward (Employee Child)</option>
                  <option value="Management Child">Management Child (Discretionary)</option>
                  <option value="Government-Funded Student">Government-Funded / RTE Student</option>
                  <option value="Normal Child">Normal Child</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Registration Fee (₹) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Previous School Class
                </label>
                <select
                  value={previousSchoolClass}
                  onChange={(e) => setPreviousSchoolClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {PREVIOUS_SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fee Applicable From Month
                </label>
                <select
                  value={feeApplicableFromMonth}
                  onChange={(e) => setFeeApplicableFromMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {ACADEMIC_MONTHS.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admission Remarks / Special Discount / Reference Note
                </label>
                <textarea
                  rows={2}
                  value={admissionRemarks}
                  onChange={(e) => setAdmissionRemarks(e.target.value)}
                  placeholder="Special instructions or discount notes..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Complete Registration (₹{registrationFee})
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ==================================================================== */
/* 3. ADD ADMISSION STEP MODAL (Step 3 - Final Admission Pipeline)      */
/* ==================================================================== */
interface AddAdmissionStepModalProps {
  registrations: AdmissionApplication[];
  onClose: () => void;
  onSubmit: (regId: string, studentCategory: StudentCategoryType, details: Partial<AdmissionApplication>) => void;
  onOpenTestModal?: (app: AdmissionApplication) => void;
}

export const AddAdmissionStepModal: React.FC<AddAdmissionStepModalProps> = ({
  registrations,
  onClose,
  onSubmit,
  onOpenTestModal
}) => {
  const [selectedRegId, setSelectedRegId] = useState(registrations[0]?.id || '');
  const [studentCategory, setStudentCategory] = useState<StudentCategoryType>('Day Scholar');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [feeApplicableFromMonth, setFeeApplicableFromMonth] = useState('April');
  const [admissionRemarks, setAdmissionRemarks] = useState('');
  const [previousSchoolClass, setPreviousSchoolClass] = useState('Playgroup (PG)');

  const nextAdmNo = peekNextNumber('admission');
  const selectedReg = registrations.find((r) => r.id === selectedRegId);

  useEffect(() => {
    if (selectedReg) {
      if (selectedReg.studentCategory) setStudentCategory(selectedReg.studentCategory);
      if (selectedReg.dateOfJoining) setDateOfJoining(selectedReg.dateOfJoining);
      if (selectedReg.feeApplicableFromMonth) setFeeApplicableFromMonth(selectedReg.feeApplicableFromMonth);
      if (selectedReg.previousSchoolClass) setPreviousSchoolClass(selectedReg.previousSchoolClass);
      if (selectedReg.admissionRemarks) setAdmissionRemarks(selectedReg.admissionRemarks);
    }
  }, [selectedRegId, selectedReg]);

  const feeCalc = selectedReg
    ? calculateClassTuitionForMonth(selectedReg.applyingClass, feeApplicableFromMonth)
    : calculateClassTuitionForMonth('Class 1', feeApplicableFromMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId) return;

    onSubmit(selectedRegId, studentCategory, {
      dateOfJoining,
      feeApplicableFromMonth,
      previousSchoolClass,
      admissionRemarks
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Final Admission Process (Step 3)</h3>
              <p className="text-xs text-slate-500">Calculate month-prorated fee, record entrance test, and allocate student</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
              <Lock className="w-3 h-3 text-emerald-500" />
              Auto Adm: {nextAdmNo}
            </span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-extrabold">No Registered Candidates Ready</h4>
            <p className="text-xs text-slate-500">
              Please register an inquiry first from Step 2 before initiating the final admission step.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Registered Candidate *
              </label>
              <select
                value={selectedRegId}
                onChange={(e) => setSelectedRegId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
              >
                {registrations.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.studentName} ({reg.applyingClass}) - Reg: {reg.applicationNo} - Parent: {reg.parentName}
                  </option>
                ))}
              </select>
            </div>

            {/* TEST SCORE BADGE & QUICK TRIGGER */}
            {selectedReg && (
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      Entrance Test Score:{' '}
                      {selectedReg.entranceTestScore !== undefined
                        ? `${selectedReg.entranceTestScore} / ${selectedReg.entranceTestMaxMarks || 40} (${selectedReg.entranceTestStatus || 'Evaluated'})`
                        : 'Not Yet Recorded (Optional / Pending)'}
                    </span>
                  </div>
                </div>
                {onOpenTestModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTestModal(selectedReg);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-extrabold hover:bg-indigo-700 cursor-pointer"
                  >
                    {selectedReg.entranceTestScore !== undefined ? 'Edit Test Marks' : 'Enter Test Score'}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Student Category (Default: Day Scholar) *
                </label>
                <select
                  value={studentCategory}
                  onChange={(e) => setStudentCategory(e.target.value as StudentCategoryType)}
                  className="w-full px-3 py-2 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold cursor-pointer"
                >
                  <option value="Day Scholar">Day Scholar (Normal Standard Fee)</option>
                  <option value="Hosteler">Hosteler (Boarding)</option>
                  <option value="Staff Ward">Staff Ward (Employee Child)</option>
                  <option value="Management Child">Management Child (Discretionary)</option>
                  <option value="Government-Funded Student">Government-Funded / RTE Student</option>
                  <option value="Normal Child">Normal Child</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Date of Joining *
                </label>
                <input
                  type="date"
                  required
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Previous School Class
                </label>
                <select
                  value={previousSchoolClass}
                  onChange={(e) => setPreviousSchoolClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {PREVIOUS_SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Fee Applicable Start Month
                </label>
                <select
                  value={feeApplicableFromMonth}
                  onChange={(e) => setFeeApplicableFromMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {ACADEMIC_MONTHS.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MONTH PRORATION BREAKDOWN DISPLAY */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Prorated Fee Breakdown ({feeApplicableFromMonth} Start):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  ₹{feeCalc.totalAdmissionEstimate.toLocaleString()} Total
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>Registration Fee: <span className="font-bold text-slate-900 dark:text-white">₹{feeCalc.structure.registrationFee}</span></div>
                <div>Admission Fee: <span className="font-bold text-slate-900 dark:text-white">₹{feeCalc.structure.admissionFee}</span></div>
                <div>Prorated Tuition ({feeCalc.monthsCharged}/12 mos): <span className="font-bold text-emerald-600">₹{feeCalc.tuitionFeeCalculated}</span></div>
                <div>Transport: <span className="font-bold text-slate-900 dark:text-white">₹{studentCategory === 'Hosteler' ? 0 : feeCalc.structure.transportFee}</span></div>
                <div>Lab & Dev: <span className="font-bold text-slate-900 dark:text-white">₹{feeCalc.structure.labFee}</span></div>
                <div>Commitment: <span className="font-bold text-slate-900 dark:text-white">₹{feeCalc.structure.commitmentFee}</span></div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admission Remarks / Special Discount / Reference Note
              </label>
              <textarea
                rows={2}
                value={admissionRemarks}
                onChange={(e) => setAdmissionRemarks(e.target.value)}
                placeholder="e.g. Special reference by Director; 10% sibling concession approved; transfer case from Bangalore"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Confirm & Allocate Student
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ==================================================================== */
/* 4. ENTRANCE TEST RESULT MODAL                                        */
/* ==================================================================== */
interface EntranceTestResultModalProps {
  application: AdmissionApplication;
  onClose: () => void;
  onSave: (applicationId: string, testData: {
    score: number;
    maxMarks: number;
    status?: 'Passed' | 'Merit' | 'Needs Improvement' | 'Rejected';
    remarks?: string;
  }) => void;
  onProceedToOfferLetter?: (app: AdmissionApplication) => void;
}

export const EntranceTestResultModal: React.FC<EntranceTestResultModalProps> = ({
  application,
  onClose,
  onSave,
  onProceedToOfferLetter
}) => {
  const isPrimary = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(application.applyingClass);
  const defaultMax = application.entranceTestMaxMarks || (isPrimary ? 40 : 100);

  const [maxMarksPreset, setMaxMarksPreset] = useState<string>(String(defaultMax));
  const [customMaxMarks, setCustomMaxMarks] = useState<number>(defaultMax);
  const [score, setScore] = useState<number>(application.entranceTestScore ?? (isPrimary ? 34 : 82));
  const [remarks, setRemarks] = useState(application.interviewRemarks || 'Demonstrates strong conceptual aptitude and verbal fluency.');

  const effectiveMaxMarks = maxMarksPreset === 'custom' ? customMaxMarks : Number(maxMarksPreset);
  const percentage = effectiveMaxMarks > 0 ? Math.round((score / effectiveMaxMarks) * 100) : 0;

  let testStatus: 'Merit' | 'Passed' | 'Needs Improvement' | 'Rejected' = 'Passed';
  if (percentage >= 85) testStatus = 'Merit';
  else if (percentage >= 40) testStatus = 'Passed';
  else if (percentage >= 33) testStatus = 'Needs Improvement';
  else testStatus = 'Rejected';

  const handleSave = (proceedToOffer = false) => {
    if (score < 0 || score > effectiveMaxMarks) {
      alert(`Score must be between 0 and ${effectiveMaxMarks}`);
      return;
    }

    onSave(application.id, {
      score,
      maxMarks: effectiveMaxMarks,
      status: testStatus,
      remarks
    });

    if (proceedToOffer && onProceedToOfferLetter) {
      onProceedToOfferLetter({
        ...application,
        entranceTestScore: score,
        entranceTestMaxMarks: effectiveMaxMarks,
        entranceTestStatus: testStatus,
        interviewRemarks: remarks
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Entrance Evaluation Score</h3>
              <p className="text-xs text-slate-500">Record entrance test performance before admission confirmation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Candidate</span>
            <h4 className="text-sm font-extrabold">{application.studentName}</h4>
            <p className="text-xs text-slate-500">
              Applying for <span className="font-bold text-slate-700 dark:text-slate-300">{application.applyingClass}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-400">App No</span>
            <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{application.applicationNo}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Maximum Test Marks Scale (Class-Wise Customizable)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['40', '50', '80', '100'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMaxMarksPreset(preset)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    maxMarksPreset === preset
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300 dark:ring-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Out of {preset}
                </button>
              ))}
            </div>
          </div>

          {maxMarksPreset === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Custom Max Marks:
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={customMaxMarks}
                onChange={(e) => setCustomMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Marks Obtained *
              </label>
              <span className="text-xs font-bold text-slate-500">
                Out of {effectiveMaxMarks}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={effectiveMaxMarks}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-extrabold text-slate-900 dark:text-white"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                / {effectiveMaxMarks}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Performance Rating</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  testStatus === 'Merit'
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : testStatus === 'Passed'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : testStatus === 'Needs Improvement'
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-rose-100 text-rose-700 border border-rose-300'
                }`}>
                  {testStatus}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {percentage}% Aggregate
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-slate-400">Offer Status</span>
              <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {percentage >= 40 ? 'Eligible for Offer Letter' : 'Requires Principal Review'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assessment Remarks & Evaluation Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Candidate feedback, academic readiness notes..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl text-xs font-extrabold cursor-pointer"
            >
              Save Result
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Save & Send Offer Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* 5. ADMIN NUMBERING CONFIG MODAL                                      */
/* ==================================================================== */
interface AdminNumberingConfigModalProps {
  onClose: () => void;
  settings: SchoolNumberingSettings;
  onSaveAdmissionSeries: (cfg: Partial<SchoolNumberingSettings['admissionSeries']>) => void;
  onSaveRegistrationSeries: (cfg: Partial<SchoolNumberingSettings['registrationSeries']>) => void;
  onSaveInquirySeries: (cfg: Partial<SchoolNumberingSettings['inquirySeries']>) => void;
  onReset: () => void;
}

export const AdminNumberingConfigModal: React.FC<AdminNumberingConfigModalProps> = ({
  onClose,
  settings,
  onSaveAdmissionSeries,
  onSaveRegistrationSeries,
  onSaveInquirySeries,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'admission' | 'registration' | 'inquiry'>('admission');
  const currentConfig =
    activeTab === 'admission'
      ? settings.admissionSeries
      : activeTab === 'registration'
      ? settings.registrationSeries
      : settings.inquirySeries;

  const [prefix, setPrefix] = useState(currentConfig.prefix);
  const [includeYear, setIncludeYear] = useState(currentConfig.includeYear);
  const [yearFormat, setYearFormat] = useState<'YYYY' | 'YY'>(currentConfig.yearFormat);
  const [yearPosition, setYearPosition] = useState<'Prefix' | 'Middle' | 'Suffix' | 'None'>(currentConfig.yearPosition);
  const [separator, setSeparator] = useState<'-' | '/' | '.' | '' | '_'>(currentConfig.separator);
  const [sequencePadding, setSequencePadding] = useState(currentConfig.sequencePadding);
  const [nextSequence, setNextSequence] = useState(currentConfig.nextSequence);

  useEffect(() => {
    const cfg =
      activeTab === 'admission'
        ? settings.admissionSeries
        : activeTab === 'registration'
        ? settings.registrationSeries
        : settings.inquirySeries;
    setPrefix(cfg.prefix);
    setIncludeYear(cfg.includeYear);
    setYearFormat(cfg.yearFormat);
    setYearPosition(cfg.yearPosition);
    setSeparator(cfg.separator);
    setSequencePadding(cfg.sequencePadding);
    setNextSequence(cfg.nextSequence);
  }, [activeTab, settings]);

  const handleSaveCurrent = () => {
    const updated = {
      prefix,
      includeYear,
      yearFormat,
      yearPosition,
      separator,
      sequencePadding,
      nextSequence
    };

    if (activeTab === 'admission') onSaveAdmissionSeries(updated);
    else if (activeTab === 'registration') onSaveRegistrationSeries(updated);
    else onSaveInquirySeries(updated);

    alert(`Saved custom numbering sequence for ${activeTab.toUpperCase()} series! Standard users cannot edit generated IDs directly.`);
  };

  const currentYear = new Date().getFullYear();
  const yearStr = yearFormat === 'YY' ? String(currentYear).slice(-2) : String(currentYear);
  const paddedSeq = String(nextSequence).padStart(sequencePadding, '0');
  let preview = '';
  if (!includeYear || yearPosition === 'None') {
    preview = prefix ? `${prefix}${separator}${paddedSeq}` : paddedSeq;
  } else if (yearPosition === 'Prefix') {
    preview = prefix ? `${yearStr}${separator}${prefix}${separator}${paddedSeq}` : `${yearStr}${separator}${paddedSeq}`;
  } else if (yearPosition === 'Middle') {
    preview = prefix ? `${prefix}${separator}${yearStr}${separator}${paddedSeq}` : `${yearStr}${separator}${paddedSeq}`;
  } else {
    preview = prefix ? `${prefix}${separator}${paddedSeq}${separator}${yearStr}` : `${paddedSeq}${separator}${yearStr}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Custom ID & Numbering Series Setup</h3>
              <p className="text-xs text-slate-500">Admin-only configuration for Admission, Registration, and Inquiry IDs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Protected Series:</strong> Generated numbers are automatic and non-editable by standard admission operators. Only School Admins can alter format rules.
          </span>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('admission')}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 cursor-pointer transition-all ${
              activeTab === 'admission'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Admission Number Series
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('registration')}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 cursor-pointer transition-all ${
              activeTab === 'registration'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Registration Number Series
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inquiry')}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 cursor-pointer transition-all ${
              activeTab === 'inquiry'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Inquiry Number Series
          </button>
        </div>

        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300">Live Generated ID Preview</span>
            <p className="font-mono text-lg font-black text-indigo-950 dark:text-indigo-100 tracking-wider">
              {preview}
            </p>
          </div>
          <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700 text-xs font-bold text-slate-600 dark:text-slate-300">
            Next: #{nextSequence}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Series Prefix Code (e.g. ADM, SCH, DPS)
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              placeholder="e.g. ADM"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Starting Counter Sequence
            </label>
            <input
              type="number"
              min={1}
              value={nextSequence}
              onChange={(e) => setNextSequence(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Include Academic Year
            </label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={includeYear}
                  onChange={(e) => setIncludeYear(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Embed Year in ID
              </label>
              {includeYear && (
                <select
                  value={yearFormat}
                  onChange={(e) => setYearFormat(e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value="YYYY">4-Digit (2026)</option>
                  <option value="YY">2-Digit (26)</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Year Position
            </label>
            <select
              value={yearPosition}
              disabled={!includeYear}
              onChange={(e) => setYearPosition(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold disabled:opacity-50"
            >
              <option value="Prefix">Year at Start (e.g. 2026-ADM-0001)</option>
              <option value="Middle">Year in Middle (e.g. ADM-2026-0001)</option>
              <option value="Suffix">Year at End (e.g. ADM-0001-2026)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Separator Character
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value="-">Hyphen (-)</option>
              <option value="/">Slash (/)</option>
              <option value=".">Dot (.)</option>
              <option value="_">Underscore (_)</option>
              <option value="">None (No separator)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sequence Digits (Zero Padding)
            </label>
            <select
              value={sequencePadding}
              onChange={(e) => setSequencePadding(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value={3}>3 Digits (e.g. 001)</option>
              <option value={4}>4 Digits (e.g. 0001)</option>
              <option value={5}>5 Digits (e.g. 00001)</option>
              <option value={6}>6 Digits (e.g. 000001)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveCurrent}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
            >
              Save {activeTab.toUpperCase()} Format
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* 6. EDIT APPLICATION MODAL (With Audit Log Approval)                   */
/* ==================================================================== */
interface EditApplicationModalProps {
  application: AdmissionApplication;
  onClose: () => void;
  onSave: (
    applicationId: string,
    logData: {
      requestedBy: string;
      fieldChanged: string;
      previousValue: string;
      newValue: string;
      approvedBy: string;
      reason?: string;
    },
    updatedFields?: Partial<AdmissionApplication>
  ) => void;
}

export const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  application,
  onClose,
  onSave
}) => {
  const [studentName, setStudentName] = useState(application.studentName);
  const [applyingClass, setApplyingClass] = useState(application.applyingClass);
  const [parentName, setParentName] = useState(application.parentName);
  const [contactNumber, setContactNumber] = useState(application.contactNumber);
  const [email, setEmail] = useState(application.email);
  const [studentCategory, setStudentCategory] = useState<StudentCategoryType>(application.studentCategory || 'Day Scholar');
  const [dateOfJoining, setDateOfJoining] = useState(application.dateOfJoining || new Date().toISOString().split('T')[0]);
  const [feeApplicableFromMonth, setFeeApplicableFromMonth] = useState(application.feeApplicableFromMonth || 'April');
  const [previousSchoolClass, setPreviousSchoolClass] = useState(application.previousSchoolClass || 'Playgroup (PG)');
  const [admissionRemarks, setAdmissionRemarks] = useState(application.admissionRemarks || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [approvedBy, setApprovedBy] = useState('Director / Principal');
  const [reason, setReason] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      alert('Please enter Admin Authorization PIN to confirm record update.');
      return;
    }

    onSave(
      application.id,
      {
        requestedBy: 'Admission Desk Operator',
        fieldChanged: 'Student Record & Joining/Fee Parameters',
        previousValue: `${application.studentName} | ${application.studentCategory || 'Day Scholar'} | ${application.dateOfJoining || 'N/A'}`,
        newValue: `${studentName} | ${studentCategory} | ${dateOfJoining}`,
        approvedBy,
        reason: reason || 'Verified by School Admin'
      },
      {
        studentName,
        applyingClass,
        parentName,
        contactNumber,
        email,
        studentCategory,
        dateOfJoining,
        feeApplicableFromMonth,
        previousSchoolClass,
        admissionRemarks
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Edit Admission Record: {application.applicationNo}</h3>
              <p className="text-xs text-slate-500">Protected modification with mandatory audit logging</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class *
              </label>
              <select
                value={applyingClass}
                onChange={(e) => setApplyingClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Category *
              </label>
              <select
                value={studentCategory}
                onChange={(e) => setStudentCategory(e.target.value as StudentCategoryType)}
                className="w-full px-3 py-2 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold"
              >
                <option value="Day Scholar">Day Scholar (Normal Standard Fee)</option>
                <option value="Hosteler">Hosteler (Boarding)</option>
                <option value="Staff Ward">Staff Ward (Employee Child)</option>
                <option value="Management Child">Management Child (Discretionary)</option>
                <option value="Government-Funded Student">Government-Funded / RTE Student</option>
                <option value="Normal Child">Normal Child</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date of Joining *
              </label>
              <input
                type="date"
                required
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Previous School Class
              </label>
              <select
                value={previousSchoolClass}
                onChange={(e) => setPreviousSchoolClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {PREVIOUS_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fee Applicable Start Month
              </label>
              <select
                value={feeApplicableFromMonth}
                onChange={(e) => setFeeApplicableFromMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {ACADEMIC_MONTHS.map((m) => (
                  <option key={m.month} value={m.month}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Mobile *
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admission Remarks / Special Discount Notes
              </label>
              <textarea
                rows={2}
                value={admissionRemarks}
                onChange={(e) => setAdmissionRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* ADMIN APPROVAL SECTION */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-700 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Admin Authorization & Reason for Modification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                  Approving Official *
                </label>
                <input
                  type="text"
                  required
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                  Reason for Change *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Parent requested class change"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                  Admin PIN / Password *
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg font-bold text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Authorized Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* 7. AGE CRITERIA MATRIX MODAL                                         */
/* ==================================================================== */
interface AgeCriteriaMatrixModalProps {
  onClose: () => void;
}

export const AgeCriteriaMatrixModal: React.FC<AgeCriteriaMatrixModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">CBSE & NEP 2020 Age Criteria Matrix</h3>
              <p className="text-xs text-slate-500">Benchmark minimum & maximum age cutoffs as of 1st April 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-2.5 rounded-l-lg">Class / Grade</th>
                <th className="p-2.5">Min Age (Years)</th>
                <th className="p-2.5">Max Age (Years)</th>
                <th className="p-2.5 rounded-r-lg">Eligible Birth Range (2026 Session)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {Object.entries(AGE_CRITERIA_MAP).map(([cls, criteria]) => (
                <tr key={cls} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">{cls}</td>
                  <td className="p-2.5">{criteria.minAgeYears} Years</td>
                  <td className="p-2.5">{criteria.maxAgeYears} Years</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {`Born ${2026 - criteria.maxAgeYears} to ${2026 - criteria.minAgeYears}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl text-xs font-extrabold cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
