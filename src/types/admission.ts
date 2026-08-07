export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  studentName: string;
  applyingClass: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  parentName: string;
  contactNumber: string;
  email: string;
  previousSchool: string;
  applicationDate: string;
  status: 'Received' | 'Test Scheduled' | 'Interview Scheduled' | 'Offered' | 'Confirmed' | 'Waitlisted' | 'Rejected';
  entranceTestScore?: number;
  entranceTestMaxMarks?: number;
  interviewRemarks?: string;
  feePaid: boolean;
  registrationFee: number;
  documentsUploaded: string[];
}

export interface SeatAvailability {
  className: string;
  totalSeats: number;
  filledSeats: number;
  reservedSeats: number;
  availableSeats: number;
}
