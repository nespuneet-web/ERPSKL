export type UserRole =
  | 'Super Admin'
  | 'School Admin'
  | 'Principal'
  | 'Vice Principal'
  | 'Examination Incharge'
  | 'Timetable Incharge'
  | 'Admission Team'
  | 'Account Department'
  | 'Accountant'
  | 'Transport Department'
  | 'Teacher'
  | 'Class Teacher'
  | 'Student'
  | 'Parent'
  | 'Reception'
  | 'HR'
  | 'Interview Panel'
  | 'Visitor'
  | 'Read-only Auditor';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. "2025-2026"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  module: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}
