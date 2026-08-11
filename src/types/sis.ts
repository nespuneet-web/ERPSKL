export interface ParentInfo {
  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;
  fatherEmail: string;
  fatherIncome: string;
  fatherQualification: string;
  motherName: string;
  motherOccupation: string;
  motherMobile: string;
  motherEmail: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianMobile?: string;
  address: string;
  officeDetails?: string;
  emergencyContact: string;
}

export interface MedicalInfo {
  bloodGroup: string;
  disability: boolean;
  disabilityDetails?: string;
  allergies?: string;
  medications?: string;
  doctorContact?: string;
}

export interface StudentDocument {
  id: string;
  title: string;
  type: 'Birth Certificate' | 'Transfer Certificate' | 'Aadhaar' | 'Photographs' | 'Address Proof' | 'Income Certificate' | 'Category Certificate' | 'Custom';
  fileName: string;
  uploadDate: string;
  url: string;
  verified: boolean;
}

export interface PromotionRecord {
  id: string;
  academicYear: string;
  fromClassSection: string;
  toClassSection: string;
  promotionDate: string;
  status: 'Promoted' | 'Retained' | 'Conditional';
  remarks: string;
}

export interface SiblingInfo {
  id: string;
  siblingStudentId?: string;
  name: string;
  classSection: string;
  admissionNo: string;
  relation: 'Brother' | 'Sister';
}

export interface Student {
  id: string;
  admissionNo: string;
  registrationNo: string;
  scholarNo: string;
  penNo: string; // Permanent Education Number
  apaarId: string; // Automated Permanent Academic Account Registry
  aadhaarNo: string;
  
  // Personal
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  bloodGroup: string;
  religion: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  nationality: string;
  motherTongue: string;
  photoUrl: string;
  signatureUrl?: string;

  // Academic Details
  admissionDate: string;
  admissionClass: string;
  currentClass: string;
  section: string;
  rollNo: number;
  house: string; // Customizable House Name
  previousSchool?: string;
  tcNumber?: string;
  
  // Co-curricular Activities & Clubs
  groupAActivity?: string; // Group A: Indoor Activity (Max 1)
  groupBActivity?: string; // Group B: Outdoor Activity (Max 1)
  clubId?: string;
  clubName?: string; // Mandatory Club Assignment (Exactly 1)

  // Custom Services
  transportRequired: boolean;
  busRouteNo?: string;
  hostelRequired: boolean;
  hostelRoomNo?: string;

  // Sub-objects
  parents: ParentInfo;
  medical: MedicalInfo;
  documents: StudentDocument[];
  siblings: SiblingInfo[];
  promotions: PromotionRecord[];

  status: 'Active' | 'Alumni' | 'Transferred' | 'Suspended';
}

export interface SchoolHouse {
  id: string;
  name: string;
  color: string;
  motto?: string;
  masterTeacher?: string;
}

export interface SchoolClub {
  id: string;
  name: string;
  category: 'Academic' | 'Cultural' | 'Sports' | 'Technical' | 'Social Service' | 'Arts';
  description: string;
  inchargeTeacher?: string;
}

