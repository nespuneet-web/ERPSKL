export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classSection: string;
  rollNo: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  verificationSource?: 'Bus' | 'Gate' | 'Manual' | 'None';
  verificationStatus?: 'Green' | 'Yellow' | 'Red'; // Green = Bus/Gate Verified Present, Yellow = Unverified/Pending, Red = Absent
  remarks?: string;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  classSection: string;
  amountPaid: number;
  paymentMode: 'Online' | 'Cash' | 'Cheque' | 'UPI';
  paymentDate: string;
  feeHead: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  timeSlot: string; // "08:00 AM - 08:45 AM"
  subject: string;
  teacherName: string;
  classSection: string;
  roomNo: string;
}

export interface TimetableArrangement {
  id: string;
  date: string;
  periodNumber: number;
  timeSlot: string;
  classSection: string;
  subject: string;
  absentTeacherName: string;
  substituteTeacherName: string;
  status: 'Arranged' | 'Pending';
  remarks?: string;
}

export interface TeacherAvailability {
  teacherName: string;
  department: string;
  totalPeriodsToday: number;
  freePeriodsCount: number;
  freePeriodNumbers: number[];
  colorStatus: 'Green' | 'Yellow' | 'Red'; // Green: 4+ free, Yellow: 1-3 free, Red: 0 free
}

export interface TransportRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  guardianTeacherName?: string;
  guardianTeacherPhone?: string;
  stops: { stopName: string; pickupTime: string; fee: number }[];
  totalCapacity: number;
  allocatedStudents: number;
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  copiesTotal: number;
  copiesAvailable: number;
  rackLocation: string;
}

export interface StaffMember {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  qualification: string;
  monthlySalary: number;
  status: 'Active' | 'On Leave' | 'Absent' | 'Half Day' | 'Resigned' | 'In Interview';
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  targetAudience: 'All' | 'Teachers' | 'Students' | 'Parents' | 'Staff';
  content: string;
  postedBy: string;
  isUrgent: boolean;
}

export interface CertificateRecord {
  id: string;
  certificateType: 'Transfer Certificate' | 'Character Certificate' | 'Bonafide Certificate' | 'Sports Merit';
  studentName: string;
  admissionNo: string;
  issueDate: string;
  certificateNo: string;
  content: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: 'Lab Equipment' | 'Stationery' | 'Furniture' | 'Electronics' | 'Sports Equipment';
  quantity: number;
  unitPrice: number;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface VisitorPass {
  id: string;
  passNo: string;
  visitorName: string;
  phone: string;
  purpose: 'Parent Meeting' | 'Vendor/Supplier' | 'Official Work' | 'Admission Inquiry';
  whomToMeet: string;
  entryTime: string;
  exitTime?: string;
  status: 'Inside' | 'Checked Out';
}
