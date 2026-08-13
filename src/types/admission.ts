export type AdmissionStage = 'Inquiry' | 'Registration' | 'Admission Process' | 'Offered' | 'Confirmed' | 'Waitlisted' | 'Rejected';

export type StudentCategoryType = 'Staff Ward' | 'Normal Child' | 'Management Child' | 'Government-Funded Student';

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
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
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
  applicationDate: string;
  inquirySource?: 'Walk-in' | 'Website' | 'Referral' | 'Social Media' | 'Newspaper Ad';
  status: AdmissionStage;
  entranceTestScore?: number;
  entranceTestMaxMarks?: number;
  interviewRemarks?: string;
  feePaid: boolean;
  registrationFee: number;
  feeBreakdown?: AdmissionFeeBreakdown;
  documentsUploaded: string[];
  offerLetterSaved?: boolean;
  offerLetterSavedAt?: string;
  parentPhotoUrl?: string;
  emergencyPassCode?: string;

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

  // Mandatory Student Category
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

