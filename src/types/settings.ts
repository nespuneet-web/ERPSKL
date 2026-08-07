import { UserRole } from './common';

export interface ClassSectionConfig {
  id: string;
  className: string; // "Class 10"
  sections: string[]; // ["A", "B", "C"]
  classTeacherMapping: Record<string, string>; // section -> teacherName
}

export interface FeeHead {
  id: string;
  headName: string; // e.g. "Tuition Fee", "Admission Fee", "Lab Charges", "Transport Fee"
  frequency: 'Monthly' | 'Quarterly' | 'Annually' | 'One-Time';
  defaultAmount: number;
}

export interface PermissionMatrix {
  role: UserRole;
  allowedModules: string[];
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'WhatsApp' | 'In-App';
  subject: string;
  bodyTemplate: string;
}

export interface SchoolProfile {
  schoolName: string;
  affilNo: string;
  schoolCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  principalName: string;
  academicYear: string;
}
