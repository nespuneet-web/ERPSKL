export type AdmissionStage = 'Inquiry' | 'Registration' | 'Admission Process' | 'Offered' | 'Confirmed' | 'Waitlisted' | 'Rejected';

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
}

export interface SeatAvailability {
  className: string;
  totalSeats: number;
  filledSeats: number;
  reservedSeats: number;
  availableSeats: number;
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

