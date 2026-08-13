import React, { useState, useEffect } from 'react';
import {
  AdmissionApplication,
  AdmissionSiblingRecord,
  StudentCategoryType,
  ALL_SCHOOL_CLASSES,
  PARENT_OCCUPATION_CATEGORIES
} from '../../types/admission';
import { getClassFeeStructure } from '../fees/feeStructureStore';
import { checkAgeEligibility } from '../../utils/ageEligibility';
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
  FileText
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
  const [inquirySource, setInquirySource] = useState<'Walk-in' | 'Website' | 'Referral' | 'Social Media' | 'Newspaper Ad'>('Walk-in');

  // Age Eligibility & Force Admission state
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
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">New Inquiry Record</h3>
              <p className="text-xs text-slate-500">Add candidate lead into Central Prospect Master</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
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
                  <p className="text-[10px] text-amber-900 dark:text-amber-300 italic font-semibold">
                    ⚠️ Override reason and authorizing official will be permanently logged in the audit trail.
                  </p>
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
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. 9876543210"
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
                placeholder="parent@example.com"
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
                placeholder="e.g. Little Angels Preschool"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Inquiry Source
              </label>
              <select
                value={inquirySource}
                onChange={(e) => setInquirySource(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Newspaper Ad">Newspaper Ad</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House No 42, Sector 15, New Delhi"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Inquiry Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* ==================================================================== */
/* 2. ADD REGISTRATION MODAL                                           */
/* ==================================================================== */
interface AddRegistrationModalProps {
  inquiries: AdmissionApplication[];
  onClose: () => void;
  onSubmit: (inquiryId: string, overrideFee: number, details: Partial<AdmissionApplication>) => void;
}

export const AddRegistrationModal: React.FC<AddRegistrationModalProps> = ({ inquiries, onClose, onSubmit }) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState(inquiries[0]?.id || '');
  const [caste, setCaste] = useState('');
  const [category, setCategory] = useState<'General' | 'SC' | 'ST' | 'OBC' | 'Other'>('General');
  const [religion, setReligion] = useState('Hinduism');
  const [previousSchool, setPreviousSchool] = useState('');
  
  // Sibling info
  const [hasSiblingInSchool, setHasSiblingInSchool] = useState(false);
  const [siblingsList, setSiblingsList] = useState<AdmissionSiblingRecord[]>([
    { name: '', className: 'Class 5-A', admissionNo: '', relation: 'Brother' }
  ]);

  // Other school info
  const [appliedOtherSchool, setAppliedOtherSchool] = useState(false);
  const [otherSchoolDetails, setOtherSchoolDetails] = useState('');

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);
  const applyingClass = selectedInquiry?.applyingClass || 'Class 1';
  const liveClassFee = getClassFeeStructure(applyingClass);
  const [regFeeAmount, setRegFeeAmount] = useState(liveClassFee.registrationFee);

  useEffect(() => {
    if (selectedInquiry) {
      const fees = getClassFeeStructure(selectedInquiry.applyingClass);
      setRegFeeAmount(fees.registrationFee);
      if (selectedInquiry.previousSchool && selectedInquiry.previousSchool !== 'None') {
        setPreviousSchool(selectedInquiry.previousSchool);
      }
    }
  }, [selectedInquiryId, selectedInquiry]);

  const handleAddSibling = () => {
    if (siblingsList.length >= 3) return;
    setSiblingsList([...siblingsList, { name: '', className: 'Class 1-A', admissionNo: '', relation: 'Brother' }]);
  };

  const handleRemoveSibling = (index: number) => {
    setSiblingsList(siblingsList.filter((_, idx) => idx !== index));
  };

  const handleSiblingChange = (index: number, field: keyof AdmissionSiblingRecord, value: string) => {
    const updated = [...siblingsList];
    updated[index] = { ...updated[index], [field]: value };
    setSiblingsList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId) return;

    onSubmit(selectedInquiryId, regFeeAmount, {
      caste,
      category,
      religion,
      previousSchool: previousSchool || selectedInquiry?.previousSchool || 'None',
      hasSiblingInSchool,
      siblingsList: hasSiblingInSchool ? siblingsList.filter((s) => s.name.trim() !== '') : [],
      appliedOtherSchool,
      otherSchoolDetails: appliedOtherSchool ? otherSchoolDetails : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Student Registration Form</h3>
              <p className="text-xs text-slate-500">Capture social, sibling, previous school & centralized fee records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CANDIDATE SELECTION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Inquiry Prospect Candidate *
            </label>
            <select
              value={selectedInquiryId}
              onChange={(e) => setSelectedInquiryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
            >
              {inquiries.map((inq, idx) => (
                <option key={`${inq.id}-${idx}`} value={inq.id}>
                  {inq.studentName} ({inq.applyingClass}) — Parent: {inq.parentName} [{inq.applicationNo}]
                </option>
              ))}
            </select>
          </div>

          {/* SOCIAL / PERSONAL INFO */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-indigo-700 dark:text-indigo-400">
              Social & Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="General">General</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Caste Name</label>
                <input
                  type="text"
                  value={caste}
                  onChange={(e) => setCaste(e.target.value)}
                  placeholder="e.g. General / Brahmin / Yadav"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Religion</label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  placeholder="e.g. Hinduism, Sikhism, Islam"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* PREVIOUS SCHOOL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Previous School Name
            </label>
            <input
              type="text"
              value={previousSchool}
              onChange={(e) => setPreviousSchool(e.target.value)}
              placeholder="e.g. St. Xavier Senior Secondary School"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            />
          </div>

          {/* SIBLING INFORMATION (UP TO 3) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-indigo-700 dark:text-indigo-400">
                  Sibling Information (Up to 3 Siblings)
                </h4>
                <p className="text-[10px] text-slate-500">Is any sibling currently studying in this school?</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="hasSibling"
                    checked={hasSiblingInSchool}
                    onChange={() => setHasSiblingInSchool(true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="hasSibling"
                    checked={!hasSiblingInSchool}
                    onChange={() => setHasSiblingInSchool(false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {hasSiblingInSchool && (
              <div className="space-y-3 pt-2">
                {siblingsList.map((sib, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-400">
                      <span>Sibling #{idx + 1}</span>
                      {siblingsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSibling(idx)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Sibling Full Name"
                        value={sib.name}
                        onChange={(e) => handleSiblingChange(idx, 'name', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Class & Section (e.g. 5-A)"
                        value={sib.className}
                        onChange={(e) => handleSiblingChange(idx, 'className', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Admission / Student No"
                        value={sib.admissionNo}
                        onChange={(e) => handleSiblingChange(idx, 'admissionNo', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold"
                      />
                      <select
                        value={sib.relation}
                        onChange={(e) => handleSiblingChange(idx, 'relation', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold cursor-pointer"
                      >
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                      </select>
                    </div>
                  </div>
                ))}

                {siblingsList.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddSibling}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Sibling (#{siblingsList.length + 1})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* OTHER SCHOOL ADMISSION INFORMATION */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-indigo-700 dark:text-indigo-400">
                  Other School Admission Information
                </h4>
                <p className="text-[10px] text-slate-500">Is the child taking or admitted to admission in another school?</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="appliedOtherSchool"
                    checked={appliedOtherSchool}
                    onChange={() => setAppliedOtherSchool(true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="appliedOtherSchool"
                    checked={!appliedOtherSchool}
                    onChange={() => setAppliedOtherSchool(false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {appliedOtherSchool && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Other School Details & Status
                </label>
                <textarea
                  rows={2}
                  value={otherSchoolDetails}
                  onChange={(e) => setOtherSchoolDetails(e.target.value)}
                  placeholder="Provide school name, branch, class applied for, and status"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>
            )}
          </div>

          {/* CENTRALIZED FEE ASSIGNMENT DISPLAY */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Master Fee Structure for {applyingClass}
              </span>
              <span className="font-mono text-indigo-700 dark:text-indigo-300">
                Annual Tuition: ₹{liveClassFee.tuitionFeeAnnual.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <span className="text-slate-500 block text-[10px]">Registration Fee</span>
                <span className="font-bold">₹{regFeeAmount}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <span className="text-slate-500 block text-[10px]">Admission Fee</span>
                <span className="font-bold">₹{liveClassFee.admissionFee.toLocaleString()}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <span className="text-slate-500 block text-[10px]">Quarterly Tuition</span>
                <span className="font-bold">₹{liveClassFee.tuitionFeeQuarterly.toLocaleString()}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <span className="text-slate-500 block text-[10px]">Transport / Lab</span>
                <span className="font-bold">₹{liveClassFee.transportFee + liveClassFee.labFee}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Registration & Fee Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* ==================================================================== */
/* 3. ADD ADMISSION PROCESS MODAL                                      */
/* ==================================================================== */
interface AddAdmissionStepModalProps {
  registeredCandidates: AdmissionApplication[];
  onClose: () => void;
  onSubmit: (registrationId: string, studentCategory: StudentCategoryType) => void;
}

export const AddAdmissionStepModal: React.FC<AddAdmissionStepModalProps> = ({
  registeredCandidates,
  onClose,
  onSubmit
}) => {
  const [selectedId, setSelectedId] = useState(registeredCandidates[0]?.id || '');
  const [studentCategory, setStudentCategory] = useState<StudentCategoryType>('Normal Child');

  const selectedCandidate = registeredCandidates.find((r) => r.id === selectedId);
  const applyingClass = selectedCandidate?.applyingClass || 'Class 1';
  const liveClassFee = getClassFeeStructure(applyingClass);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    onSubmit(selectedId, studentCategory);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Final Admission Approval</h3>
              <p className="text-xs text-slate-500">Require Mandatory Student Category & Central Fee Schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Registered Candidate *
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
            >
              {registeredCandidates.map((cand, idx) => (
                <option key={`${cand.id}-${idx}`} value={cand.id}>
                  {cand.studentName} ({cand.applyingClass}) — [{cand.applicationNo}]
                </option>
              ))}
            </select>
          </div>

          {/* MANDATORY STUDENT CATEGORY */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <label className="block text-xs font-extrabold uppercase text-indigo-700 dark:text-indigo-400">
              Mandatory Student Category Assignment *
            </label>
            <p className="text-[11px] text-slate-500">
              Stored in Centralized Student Master and available to all modules.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(['Normal Child', 'Staff Ward', 'Management Child', 'Government-Funded Student'] as StudentCategoryType[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setStudentCategory(cat)}
                  className={`p-2.5 rounded-xl text-xs font-extrabold border text-left cursor-pointer transition-all ${
                    studentCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FEE BREAKDOWN SUMMARY */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs space-y-1">
            <span className="font-extrabold text-emerald-950 dark:text-emerald-200">
              Fee Schedule for {applyingClass}:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>Admission Fee: <strong>₹{liveClassFee.admissionFee.toLocaleString()}</strong></div>
              <div>Quarterly Tuition: <strong>₹{liveClassFee.tuitionFeeQuarterly.toLocaleString()}</strong></div>
              <div>Transport Fee: <strong>₹{liveClassFee.transportFee.toLocaleString()}</strong></div>
              <div>Commitment/Lab Fee: <strong>₹{liveClassFee.commitmentFee + liveClassFee.labFee}</strong></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Initiate Admission & Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* ==================================================================== */
/* 4. EDIT RECORD & POST-ADMISSION APPROVAL MODAL                       */
/* ==================================================================== */
interface EditApplicationModalProps {
  application: AdmissionApplication;
  onClose: () => void;
  onSave: (updated: AdmissionApplication, auditLog?: { requestedBy: string; fieldChanged: string; previousValue: string; newValue: string; approvedBy: string; reason?: string }) => void;
}

export const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  application,
  onClose,
  onSave
}) => {
  const isAdmitted = application.status === 'Confirmed' || application.status === 'Offered';

  const [studentName, setStudentName] = useState(application.studentName);
  const [applyingClass, setApplyingClass] = useState(application.applyingClass);
  const [dob, setDob] = useState(application.dob);
  const [gender, setGender] = useState(application.gender);
  const [parentName, setParentName] = useState(application.parentName);
  const [motherName, setMotherName] = useState(application.motherName || '');
  const [contactNumber, setContactNumber] = useState(application.contactNumber);
  const [email, setEmail] = useState(application.email || '');
  const [previousSchool, setPreviousSchool] = useState(application.previousSchool || '');
  const [studentCategory, setStudentCategory] = useState<StudentCategoryType>(application.studentCategory || 'Normal Child');
  const [caste, setCaste] = useState(application.caste || '');
  const [category, setCategory] = useState(application.category || 'General');

  // Post-admission approval fields
  const [approvalRequestedBy, setApprovalRequestedBy] = useState('Admission Officer / Staff');
  const [approverRole, setApproverRole] = useState<'Principal' | 'Super Admin'>('Principal');
  const [approverName, setApproverName] = useState('Principal Dr. S. Radhakrishnan');
  const [approvalReason, setApprovalReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let auditLog: any = undefined;

    if (isAdmitted) {
      if (!approvalReason.trim()) {
        alert('Editing an admitted student requires specifying the reason for change and approval details.');
        return;
      }
      auditLog = {
        requestedBy: approvalRequestedBy,
        fieldChanged: `Full Profile Update (${application.studentName} -> ${studentName}, ${application.applyingClass} -> ${applyingClass})`,
        previousValue: `Name: ${application.parentName}, Class: ${application.applyingClass}, DOB: ${application.dob}`,
        newValue: `Name: ${parentName}, Class: ${applyingClass}, DOB: ${dob}, Cat: ${studentCategory}`,
        approvedBy: `${approverRole}: ${approverName}`,
        reason: approvalReason
      };
    }

    const updated: AdmissionApplication = {
      ...application,
      studentName,
      applyingClass,
      dob,
      gender,
      parentName,
      motherName,
      contactNumber,
      email,
      previousSchool,
      studentCategory,
      caste,
      category
    };

    onSave(updated, auditLog);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Edit Record: {application.studentName}
            </h3>
            <p className="text-xs text-slate-500">
              Stage: <span className="font-bold text-indigo-600">{application.status}</span> • ID: {application.applicationNo}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POST-ADMISSION EDIT CONTROL BANNER */}
        {isAdmitted && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-rose-900 dark:text-rose-200">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>Protected Admitted Record — Authorization Required</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300">
              After a student is admitted, modifying information requires formal authorization from <strong>Principal</strong> or <strong>Super Admin</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-rose-200 dark:border-rose-800">
              <div>
                <label className="block text-[10px] font-black uppercase text-rose-900 dark:text-rose-200 mb-0.5">
                  Approver Authority *
                </label>
                <select
                  value={approverRole}
                  onChange={(e) => {
                    const r = e.target.value as any;
                    setApproverRole(r);
                    setApproverName(r === 'Principal' ? 'Principal Dr. S. Radhakrishnan' : 'Super Admin / Director');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                >
                  <option value="Principal">Principal</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-rose-900 dark:text-rose-200 mb-0.5">
                  Approver Name *
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-rose-900 dark:text-rose-200 mb-0.5">
                  Mandatory Reason for Editing Admitted Record *
                </label>
                <input
                  type="text"
                  required
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="e.g. Corrected spelling per Aadhaar card / Updated contact details"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class</label>
              <select
                value={applyingClass}
                onChange={(e) => setApplyingClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold cursor-pointer"
              >
                {ALL_SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father Name</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mother Name</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Category</label>
              <select
                value={studentCategory}
                onChange={(e) => setStudentCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold cursor-pointer"
              >
                <option value="Normal Child">Normal Child</option>
                <option value="Staff Ward">Staff Ward</option>
                <option value="Management Child">Management Child</option>
                <option value="Government-Funded Student">Government-Funded Student</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Social Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold cursor-pointer"
              >
                <option value="General">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Record Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* ==================================================================== */
/* 5. AGE CRITERIA MATRIX MODAL                                        */
/* ==================================================================== */
interface AgeCriteriaMatrixModalProps {
  onClose: () => void;
}

export const AgeCriteriaMatrixModal: React.FC<AgeCriteriaMatrixModalProps> = ({ onClose }) => {
  const [testDob, setTestDob] = useState('2020-03-15');
  const [testClass, setTestClass] = useState('Class 1');

  const testResult = checkAgeEligibility(testDob, testClass);

  const criteriaList = [
    { class: 'Playgroup (PG)', minAge: '2 Years', birthRange: 'Born on or before 1 April 2024', desc: 'Toddler development & social play' },
    { class: 'Nursery', minAge: '3 Years', birthRange: 'Born on or before 1 April 2023', desc: 'Pre-primary foundational learning' },
    { class: 'Lower KG (LKG)', minAge: '4 Years', birthRange: 'Born on or before 1 April 2022', desc: 'Kindergarten level 1 phonics & numbers' },
    { class: 'Upper KG (UKG)', minAge: '5 Years', birthRange: 'Born on or before 1 April 2021', desc: 'Kindergarten level 2 literacy & math' },
    { class: 'Class 1 (Grade 1)', minAge: '6 Years', birthRange: 'Born on or before 1 April 2020', desc: 'Primary formal education entry' },
    { class: 'Class 2', minAge: '7 Years', birthRange: 'Born on or before 1 April 2019', desc: '5 Years + Class Number rule (5+2=7)' },
    { class: 'Class 3 to 12', minAge: '5 + Class No.', birthRange: 'Increments by 1 year per class', desc: 'e.g. Class 10 requires 15 Years minimum' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Class Age Criteria & Cutoff Matrix</h3>
              <p className="text-xs text-slate-500">Official NEP/ERP Age Rules as of 1 April of Academic Session (2026-04-01)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MATRIX TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Target Class</th>
                <th className="py-2.5 px-3">Min Age Required</th>
                <th className="py-2.5 px-3">Eligibility Cutoff Rule (as of 1 April 2026)</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {criteriaList.map((row, idx) => (
                <tr key={idx} className={row.class.includes('Class 1') ? 'bg-indigo-50/70 dark:bg-indigo-950/50 font-bold' : ''}>
                  <td className="py-2.5 px-3 flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                    {row.class.includes('Class 1') && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    {row.class}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold">
                      {row.minAge}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{row.birthRange}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIMULATOR / TESTER PANEL */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-extrabold uppercase text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Interactive Age Eligibility Tester
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Candidate Birth Date
              </label>
              <input
                type="date"
                value={testDob}
                onChange={(e) => setTestDob(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Applying Class
              </label>
              <select
                value={testClass}
                onChange={(e) => setTestClass(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-bold cursor-pointer"
              >
                {ALL_SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-xs font-bold ${
            testResult.isEligible
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>Status: {testResult.isEligible ? '✅ ELIGIBLE' : '⚠️ AGE DEFICIT (REQUIRES OVERRIDE)'}</span>
              <span className="font-mono">{testResult.formattedCalculatedAge} as of 01-Apr-2026</span>
            </div>
            <p className="text-[11px] font-normal mt-1">{testResult.message}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
          >
            Close Matrix View
          </button>
        </div>
      </div>
    </div>
  );
};
