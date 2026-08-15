import { CommunicationMessage } from '../types/communication';

export const INITIAL_COMMUNICATION_MESSAGES: CommunicationMessage[] = [
  {
    id: 'msg-101',
    title: 'Final Revision Schedule for Class 10-A Mathematics Pre-Board',
    content: 'Dear Students and Parents of Class 10-A, please note that the special revision session for Polynomials and Trigonometry is scheduled for tomorrow at 08:30 AM in Room 301. Bring your RD Sharma reference sheets and geometry sets.',
    category: 'CLASS_SECTION_UPDATE',
    priority: 'High',
    senderId: 'usr-tch-10',
    senderName: 'Anil Kumar Singh',
    senderRole: 'Class Teacher (Class 10-A)',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    createdAt: '2026-08-15T07:15:00Z',
    formattedDate: '15 Aug 2026',
    formattedTime: '07:15 AM',
    targetType: 'SECTION',
    targetGrade: 'Class 10',
    targetSection: 'A',
    targetSections: ['Class 10-A'],
    transportFilter: 'ALL',
    attachments: [
      { name: 'Class_10A_Math_Revision_Sheet.pdf', size: '1.2 MB' }
    ],
    acknowledgments: [
      { userId: 'std-101', userName: 'Aarav Sharma', userRole: 'Student', seenAt: '15 Aug 2026, 07:22 AM', timestamp: '2026-08-15T07:22:00Z' },
      { userId: 'std-102', userName: 'Ananya Verma', userRole: 'Student', seenAt: '15 Aug 2026, 07:30 AM', timestamp: '2026-08-15T07:30:00Z' }
    ]
  },
  {
    id: 'msg-102',
    title: 'Route 4 Bus Delay Notice - Sector 15 Highway Construction',
    content: 'All students and parents availing Route 4 (Vehicle No. UP 80 BT 4421): The bus is running 15 minutes behind schedule today due to ongoing road surface maintenance at the Sector 15 roundabout. Live GPS tracking is operational.',
    category: 'TRANSPORT_ALERT',
    priority: 'Urgent',
    senderId: 'usr-admin-1',
    senderName: 'Dr. V. K. Sharma (Super Admin)',
    senderRole: 'Principal / Admin',
    createdAt: '2026-08-15T06:50:00Z',
    formattedDate: '15 Aug 2026',
    formattedTime: '06:50 AM',
    targetType: 'ALL_SCHOOL',
    transportFilter: 'WITH_TRANSPORT',
    busRouteNo: 'Route 4 - Sector 15',
    acknowledgments: [
      { userId: 'std-101', userName: 'Aarav Sharma', userRole: 'Student', seenAt: '15 Aug 2026, 07:05 AM', timestamp: '2026-08-15T07:05:00Z' }
    ]
  },
  {
    id: 'msg-103',
    title: 'Independence Day Celebrations & Patriotic Assembly Guidelines',
    content: 'G.D. Goenka Public School invites all faculty, students, and parents to join the Grand Flag Hoisting Ceremony. Students must wear complete white ceremonial uniform with clean badges and polished shoes. Reporting time is 08:00 AM sharp.',
    category: 'GENERAL_ANNOUNCEMENT',
    priority: 'Normal',
    senderId: 'usr-admin-1',
    senderName: 'Dr. V. K. Sharma (Super Admin)',
    senderRole: 'Principal',
    createdAt: '2026-08-14T16:00:00Z',
    formattedDate: '14 Aug 2026',
    formattedTime: '04:00 PM',
    targetType: 'ALL_SCHOOL',
    transportFilter: 'ALL',
    acknowledgments: [
      { userId: 'std-101', userName: 'Aarav Sharma', userRole: 'Student', seenAt: '14 Aug 2026, 04:30 PM', timestamp: '2026-08-14T16:30:00Z' },
      { userId: 'usr-tch-10', userName: 'Anil Kumar Singh', userRole: 'Teacher', seenAt: '14 Aug 2026, 05:00 PM', timestamp: '2026-08-14T17:00:00Z' }
    ]
  },
  {
    id: 'msg-104',
    title: 'Individual Project Submission Reminder: Science Fair Portfolio',
    content: 'Aarav, please ensure you submit your working prototype schematic for the Solar Tracking Model by Wednesday to the Physics Department coordinator.',
    category: 'CLASS_SECTION_UPDATE',
    priority: 'Normal',
    senderId: 'usr-tch-12',
    senderName: 'Dr. Priya Nambiar',
    senderRole: 'Science Teacher',
    createdAt: '2026-08-14T11:20:00Z',
    formattedDate: '14 Aug 2026',
    formattedTime: '11:20 AM',
    targetType: 'SPECIFIC_STUDENTS',
    targetGrade: 'Class 10',
    targetSection: 'A',
    targetStudentIds: ['std-101'],
    targetStudentNames: ['Aarav Sharma (Roll 1)'],
    transportFilter: 'ALL',
    acknowledgments: [
      { userId: 'std-101', userName: 'Aarav Sharma', userRole: 'Student', seenAt: '14 Aug 2026, 12:00 PM', timestamp: '2026-08-14T12:00:00Z' }
    ]
  },
  {
    id: 'msg-105',
    title: 'Quarter 2 Tuition Fee Receipts & Counter Verification',
    content: 'Notice for parents: The fee desk is accepting Quarter 2 fee reconciliation at Counter 3. Online fee payments can be paid seamlessly with instant downloadable receipts through the fees portal.',
    category: 'FEES_ACCOUNTS',
    priority: 'Normal',
    senderId: 'usr-acc-1',
    senderName: 'Account Department',
    senderRole: 'Accounts In-Charge',
    createdAt: '2026-08-13T09:00:00Z',
    formattedDate: '13 Aug 2026',
    formattedTime: '09:00 AM',
    targetType: 'ALL_SCHOOL',
    transportFilter: 'ALL',
    acknowledgments: []
  }
];
