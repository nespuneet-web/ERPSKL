export type AdmissionStage = 'Inquiry' | 'Registration' | 'Admission Process' | 'Offered' | 'Confirmed' | 'Waitlisted' | 'Rejected';

export type StudentCategoryType = 'Day Scholar' | 'Hosteler' | 'Normal Child' | 'Staff Ward' | 'Management Child' | 'Government-Funded Student';

export interface AdmissionSiblingRecord {
  name: string;
  className: string;
  admissionNo: string;
  relation: string;
}

export interface ProtectedEditLog {
  id?: string;
  requestedBy: string;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  approvedBy: string;
  approvedAt: string;
  reason?: string;
}

export interface AdmissionFeeBreakdown {
  registrationFee: number;
  admissionFee: number;
  tuitionFee: number;
  transportFee: number;
  commitmentFee: number;
  labFee: number;
  totalFee: number;
  annualTuitionFull?: number;
  feeStartMonth?: string;
  monthsCharged?: number;
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  registrationNo?: string;
  inquiryNo?: string;
  studentName: string;
  applyingClass: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  parentName: string;
  motherName?: string;
  parentOccupation: string;
  motherOccupation?: string;
  contactNumber: string;
  email: string;
  address?: string;
  previousSchool: string;
  previousSchoolClass?: string;
  dateOfJoining?: string;
  feeApplicableFromMonth?: string;
  admissionRemarks?: string;
  specialDiscountNotes?: string;
  applicationDate: string;
  inquirySource?: 'Walk-in' | 'Website' | 'Referral' | 'Social Media' | 'Newspaper Ad';
  status: AdmissionStage;
  entranceTestScore?: number;
  entranceTestMaxMarks?: number;
  entranceTestStatus?: 'Pending' | 'Passed' | 'Merit' | 'Needs Improvement' | 'Rejected';
  interviewRemarks?: string;
  feePaid: boolean;
  registrationFee: number;
  feeBreakdown?: AdmissionFeeBreakdown;
  documentsUploaded: string[];
  offerLetterSaved?: boolean;
  offerLetterSavedAt?: string;
  parentPhotoUrl?: string;
  emergencyPassCode?: string;

  // Optional Student Identifiers & Profile
  scholarNo?: string;
  penNo?: string;
  apaarId?: string;
  aadhaarNo?: string;
  bloodGroup?: string;
  photoUrl?: string;

  // Additional Registration & Social Fields
  caste?: string;
  category?: 'General' | 'SC' | 'ST' | 'OBC' | 'Other';
  religion?: string;

  // Sibling Information
  hasSiblingInSchool?: boolean;
  siblingsList?: AdmissionSiblingRecord[];

  // Other School Admission Information
  appliedOtherSchool?: boolean;
  otherSchoolDetails?: string;

  // Mandatory Student Category (Default: Day Scholar)
  studentCategory?: StudentCategoryType;

  // Age Eligibility & Force Admission
  isAgeEligible?: boolean;
  calculatedAgeYears?: number;
  forceAdmission?: boolean;
  forceAdmissionReason?: string;
  forceAdmissionAuthorizedBy?: string;
  forceAdmissionTimestamp?: string;

  // Post-Admission Edit Audit Records
  protectedEditLogs?: ProtectedEditLog[];
}

export interface SeatAvailability {
  className: string;
  totalSeats: number;
  filledSeats: number;
  reservedSeats: number;
  availableSeats: number;
}

export const ALL_SCHOOL_CLASSES = [
  'Nursery',
  'KG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11 Science',
  'Class 11 Commerce',
  'Class 11 Arts',
  'Class 12 Science',
  'Class 12 Commerce',
  'Class 12 Arts'
] as const;

export const PREVIOUS_SCHOOL_CLASSES = [
  'Fresher / Direct Entry (No Prior School)',
  'Playgroup (PG)',
  'Nursery',
  'Lower KG (LKG)',
  'Upper KG (UKG) / KG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
] as const;

export const ACADEMIC_MONTHS = [
  { month: 'April', remainingMonths: 12, label: 'April (Full Session - 12 Months Charged)' },
  { month: 'May', remainingMonths: 11, label: 'May (11 Months Charged)' },
  { month: 'June', remainingMonths: 10, label: 'June (10 Months Charged)' },
  { month: 'July', remainingMonths: 9, label: 'July (From Quarter 2 - 9 Months Charged)' },
  { month: 'August', remainingMonths: 8, label: 'August (Mid-Year Entry - 8 Months Charged)' },
  { month: 'September', remainingMonths: 7, label: 'September (7 Months Charged)' },
  { month: 'October', remainingMonths: 6, label: 'October (Half-Yearly Entry - 6 Months Charged)' },
  { month: 'November', remainingMonths: 5, label: 'November (5 Months Charged)' },
  { month: 'December', remainingMonths: 4, label: 'December (4 Months Charged)' },
  { month: 'January', remainingMonths: 3, label: 'January (Quarter 4 Entry - 3 Months Charged)' },
  { month: 'February', remainingMonths: 2, label: 'February (2 Months Charged)' },
  { month: 'March', remainingMonths: 1, label: 'March (1 Month Charged)' },
] as const;

export function calculateFeeForStartMonth(
  annualTuition: number,
  startMonth: string = 'April'
): { tuitionFee: number; monthsCharged: number; fractionLabel: string } {
  const match = ACADEMIC_MONTHS.find((m) => m.month.toLowerCase() === startMonth.toLowerCase()) || ACADEMIC_MONTHS[0];
  const monthlyRate = Math.round(annualTuition / 12);
  const tuitionFee = Math.round((annualTuition * match.remainingMonths) / 12);
  return {
    tuitionFee,
    monthsCharged: match.remainingMonths,
    fractionLabel: `${match.remainingMonths}/12 months (${match.month} to March)`
  };
}

export const PARENT_OCCUPATION_CATEGORIES = [
  'Doctor / Surgeon / Medical Specialist',
  'Software Engineer / IT Professional',
  'Civil / Mechanical / Electrical Engineer',
  'Teacher / Professor / Educator',
  'Business Owner / Entrepreneur',
  'Civil Services / IAS / IPS / Govt Officer',
  'Advocate / Legal Consultant',
  'Chartered Accountant / Auditor',
  'Defense / Police / Armed Forces',
  'Architect / Interior Designer',
  'Scientist / Researcher',
  'Banking / Financial Services Executive',
  'Agriculture / Farming / Estate Owner',
  'Media / Journalist / Content Specialist',
  'Hospitality / Hotel Manager',
  'Corporate Executive / Management',
  'Other Professional'
] as const;


