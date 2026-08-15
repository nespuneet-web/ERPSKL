export type CommunicationCategory =
  | 'GENERAL_ANNOUNCEMENT'
  | 'CLASS_SECTION_UPDATE'
  | 'TRANSPORT_ALERT'
  | 'FEES_ACCOUNTS'
  | 'EXAM_CIRCULAR'
  | 'EMERGENCY_ALERT'
  | 'SPORTS_EVENTS';

export type CommunicationPriority = 'Normal' | 'High' | 'Urgent';

export type TransportAudienceFilter = 'ALL' | 'WITH_TRANSPORT' | 'WITHOUT_TRANSPORT';

export interface CommunicationAcknowledgment {
  userId: string;
  userName: string;
  userRole: string;
  seenAt: string; // Formatted date string
  timestamp: string; // ISO
}

export interface CommunicationMessage {
  id: string;
  title: string;
  content: string;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  createdAt: string; // ISO string
  formattedDate: string;
  formattedTime: string;
  targetType: 'ALL_SCHOOL' | 'SECTION' | 'SPECIFIC_STUDENTS' | 'TEACHERS';
  targetGrade?: string;
  targetSection?: string;
  targetSections?: string[];
  targetStudentIds?: string[];
  targetStudentNames?: string[];
  transportFilter?: TransportAudienceFilter;
  busRouteNo?: string;
  attachments?: {
    name: string;
    type?: string;
    size?: string;
    url?: string;
  }[];
  acknowledgments: CommunicationAcknowledgment[];
}

export interface ChannelCategoryMeta {
  id: CommunicationCategory;
  name: string;
  icon: string;
  colorClass: string;
  bgLightClass: string;
  description: string;
}

export const COMMUNICATION_CHANNELS: ChannelCategoryMeta[] = [
  {
    id: 'GENERAL_ANNOUNCEMENT',
    name: 'General School Circulars',
    icon: '📢',
    colorClass: 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    bgLightClass: 'bg-indigo-50 dark:bg-indigo-950/50',
    description: 'School-wide official circulars, holiday notices, and institutional updates.'
  },
  {
    id: 'CLASS_SECTION_UPDATE',
    name: 'Class & Section Updates',
    icon: '📚',
    colorClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    bgLightClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    description: 'Daily classroom homework, syllabus progress, and section-specific announcements.'
  },
  {
    id: 'TRANSPORT_ALERT',
    name: 'Transport & Bus Route Alerts',
    icon: '🚌',
    colorClass: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    bgLightClass: 'bg-amber-50 dark:bg-amber-950/50',
    description: 'Live bus arrival delays, breakdown notifications, and route change updates.'
  },
  {
    id: 'FEES_ACCOUNTS',
    name: 'Fees & Accounts Notices',
    icon: '💳',
    colorClass: 'text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    bgLightClass: 'bg-cyan-50 dark:bg-cyan-950/50',
    description: 'Quarterly fee reminders, tuition due alerts, and billing receipts.'
  },
  {
    id: 'EXAM_CIRCULAR',
    name: 'Exam Schedules & Admit Cards',
    icon: '📝',
    colorClass: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    bgLightClass: 'bg-purple-50 dark:bg-purple-950/50',
    description: 'Date sheets, seating plans, admit card releases, and result declarations.'
  },
  {
    id: 'EMERGENCY_ALERT',
    name: 'Emergency & Urgent Broadcasts',
    icon: '🚨',
    colorClass: 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    bgLightClass: 'bg-rose-50 dark:bg-rose-950/50',
    description: 'Critical weather warnings, unexpected closures, and urgent safety alerts.'
  },
  {
    id: 'SPORTS_EVENTS',
    name: 'Sports & Cultural Events',
    icon: '🏆',
    colorClass: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    bgLightClass: 'bg-blue-50 dark:bg-blue-950/50',
    description: 'Annual sports day, inter-school olympiads, debates, and annual function.'
  }
];
