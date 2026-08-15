import { UserRole } from '../types/common';

export interface SubSectionItem {
  id: string;
  name: string;
  moduleId: string;
  description: string;
  defaultRoles: UserRole[];
  adminOnly?: boolean;
}

export interface ModuleSectionDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  subSections: SubSectionItem[];
}

export const MODULE_SUBSECTIONS_REGISTRY: ModuleSectionDefinition[] = [
  {
    id: 'sis',
    name: 'Student Information (SIS)',
    category: 'Core Academic',
    description: 'Student directory, profile views, and academic records.',
    subSections: [
      {
        id: 'sis_directory',
        name: 'Student Directory & Profiles',
        moduleId: 'sis',
        description: 'View student directory, class rosters, and basic profiles.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Admission Team', 'Examination Incharge', 'Read-only Auditor', 'Student', 'Parent']
      },
      {
        id: 'sis_edit_profile',
        name: 'Edit Student Details & Documents',
        moduleId: 'sis',
        description: 'Update student profiles, upload documents, and edit guardian details.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal'],
        adminOnly: true
      },
      {
        id: 'sis_export',
        name: 'Export & Print Student Lists',
        moduleId: 'sis',
        description: 'Export student records to Excel / PDF and generate roll sheets.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge']
      }
    ]
  },
  {
    id: 'admission',
    name: 'Admission & Inquiries',
    category: 'Core Academic',
    description: '3-Step admissions, prospect leads, inquiry registrations & CRM.',
    subSections: [
      {
        id: 'admission_new',
        name: 'New Student Registration Form',
        moduleId: 'admission',
        description: 'Register new admissions, process student applications & enrollment.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Admission Team'],
        adminOnly: true
      },
      {
        id: 'admission_inquiries',
        name: 'Inquiry Tracker & CRM Pipeline',
        moduleId: 'admission',
        description: 'Track prospective inquiries, follow-up calls, and conversion pipeline.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Admission Team']
      },
      {
        id: 'admission_status',
        name: 'Admission Status & Verification',
        moduleId: 'admission',
        description: 'Verify admission documents, approve seats, and assign scholar numbers.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Admission Team'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'examination',
    name: 'Examination & Reports',
    category: 'Core Academic',
    description: 'CBSE marks entry, grade calculation, and report cards.',
    subSections: [
      {
        id: 'exam_marks_entry',
        name: 'Marks Entry Grid & Grading',
        moduleId: 'examination',
        description: 'Enter subject marks for students, save grades, and review student scorecards.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Examination Incharge']
      },
      {
        id: 'exam_setup',
        name: 'Exam Setup & Weightages',
        moduleId: 'examination',
        description: 'Configure exam terms, weightages (Term 1, Term 2), and calculation formulas.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge'],
        adminOnly: true
      },
      {
        id: 'exam_timetable',
        name: 'Exam Timetable & Datesheet Creation',
        moduleId: 'examination',
        description: 'Create, schedule, and publish official exam datesheets and room seatings.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge'],
        adminOnly: true
      },
      {
        id: 'exam_designer',
        name: 'Report Card Designer & Templates',
        moduleId: 'examination',
        description: 'Design CBSE compliant report cards, grading scales, and headers.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge'],
        adminOnly: true
      },
      {
        id: 'exam_analytics',
        name: 'Rankings, Toppers & Class Analytics',
        moduleId: 'examination',
        description: 'View class performance histograms, topper lists, and section analytics.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge', 'Read-only Auditor']
      },
      {
        id: 'exam_subjects',
        name: 'Subjects Catalog & Max Marks Config',
        moduleId: 'examination',
        description: 'Configure theoretical & practical maximum marks per subject.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'timetable',
    name: 'Timetable Engine',
    category: 'Core Academic',
    description: 'Weekly schedules, substitutions, and round duties.',
    subSections: [
      {
        id: 'timetable_teacher_view',
        name: 'My Personal Timetable & Class Schedule',
        moduleId: 'timetable',
        description: 'View personal weekly teaching schedule, period allocations, and free periods.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Timetable Incharge', 'Student', 'Parent']
      },
      {
        id: 'timetable_substitutions',
        name: 'Substitution & Extra Relief Details',
        moduleId: 'timetable',
        description: 'View assigned substitutions for teachers, manage daily relief allocations for admins.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Timetable Incharge']
      },
      {
        id: 'timetable_round_duty',
        name: 'Round Patrol Duties & Campus Feedback',
        moduleId: 'timetable',
        description: 'View round duties, verify check-in (GPS/QR), and submit punctuality observations.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Timetable Incharge']
      },
      {
        id: 'timetable_builder',
        name: 'Master Timetable Builder & Class Editor',
        moduleId: 'timetable',
        description: 'Edit master class schedules and teacher allocations across all sections.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Timetable Incharge'],
        adminOnly: true
      },
      {
        id: 'timetable_bulk_upload',
        name: 'Excel Bulk Upload & AI Generator',
        moduleId: 'timetable',
        description: 'Import master timetables via Excel sheet or run automated clash resolution.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Timetable Incharge'],
        adminOnly: true
      },
      {
        id: 'timetable_analytics',
        name: 'Faculty Workload & Duty Analytics',
        moduleId: 'timetable',
        description: 'Monitor weekly teaching hours, free periods, and patrol duty distribution.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Timetable Incharge']
      }
    ]
  },
  {
    id: 'attendance',
    name: 'Daily Attendance',
    category: 'Core Academic',
    description: 'Student classroom registers, attendance calendar, and staff registers.',
    subSections: [
      {
        id: 'attendance_classroom',
        name: 'Classroom Student Attendance Grid',
        moduleId: 'attendance',
        description: 'Mark daily attendance for students in assigned classroom, verify presence, and record late entries.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher']
      },
      {
        id: 'attendance_calendar',
        name: 'Student Attendance Calendar & Reports',
        moduleId: 'attendance',
        description: 'View monthly student attendance trends, defaulter lists, and percentage reports.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Read-only Auditor', 'Student', 'Parent']
      },
      {
        id: 'attendance_bus_guardian',
        name: 'Bus Guardian Seat View (Transport Duty)',
        moduleId: 'attendance',
        description: 'Mark bus boarding attendance, verify route seating, and track student transport status.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Transport Department'],
        adminOnly: true
      },
      {
        id: 'attendance_gate_entry',
        name: 'Gate Arrival Duty (Security Scan)',
        moduleId: 'attendance',
        description: 'Scan student entry badges at campus gates and log morning arrival timestamps.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Reception'],
        adminOnly: true
      },
      {
        id: 'attendance_staff_register',
        name: 'Faculty & Staff Attendance Register',
        moduleId: 'attendance',
        description: 'Manage employee biometric logs, faculty daily presence register, leave applications, and HR punch records.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'HR', 'Reception'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'lesson_plans',
    name: 'Lesson Plans & Syllabus',
    category: 'Core Academic',
    description: 'Syllabus tracker, weekly targets, and learning objectives.',
    subSections: [
      {
        id: 'lesson_plans_my',
        name: 'My Lesson Plans & Target Tracking',
        moduleId: 'lesson_plans',
        description: 'Create and submit weekly lesson plans, syllabus coverage, and learning goals.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher']
      },
      {
        id: 'lesson_plans_review',
        name: 'Lesson Plan Review & Approvals',
        moduleId: 'lesson_plans',
        description: 'Review teacher submissions, approve pedagogical milestones, and leave comments.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'fees',
    name: 'Fees & Collections',
    category: 'Finance & Admin',
    description: 'Fee receipts, dues ledger, and payment gateway status.',
    subSections: [
      {
        id: 'fees_collect',
        name: 'Collect Fees & Issue Receipts',
        moduleId: 'fees',
        description: 'Accept school fee payments, print fee receipts, and record payment modes.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Accountant', 'Account Department'],
        adminOnly: true
      },
      {
        id: 'fees_dues',
        name: 'Outstanding Dues Ledger & Structure',
        moduleId: 'fees',
        description: 'View class-wise fee defaulters, concessions, and fee installment heads.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Accountant', 'Account Department', 'Parent']
      }
    ]
  },
  {
    id: 'staff',
    name: 'Staff Directory & HR',
    category: 'Finance & Admin',
    description: 'Teacher & staff profile directory and payroll data.',
    subSections: [
      {
        id: 'staff_directory',
        name: 'Staff Directory & Contacts',
        moduleId: 'staff',
        description: 'View faculty list, subject allocations, and contact information.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'HR', 'Interview Panel', 'Timetable Incharge']
      },
      {
        id: 'staff_manage',
        name: 'Add / Edit Staff & Salary Setup',
        moduleId: 'staff',
        description: 'Create staff profiles, assign department, and manage salary grades.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'HR'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'interview',
    name: 'Interview & HR Panel',
    category: 'Finance & Admin',
    description: 'Candidate interviews, ratings, and recruitment pipeline.',
    subSections: [
      {
        id: 'interview_candidates',
        name: 'Candidate Pipeline & Evaluations',
        moduleId: 'interview',
        description: 'Review job applicants, score candidate interviews, and record hiring decisions.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'HR', 'Interview Panel'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'reports',
    name: 'Custom Student Reports',
    category: 'Finance & Admin',
    description: 'Comprehensive student reports, PDF & Excel export.',
    subSections: [
      {
        id: 'reports_student',
        name: 'Student 360 & Consolidated Reports',
        moduleId: 'reports',
        description: 'Generate multi-metric student summary cards and download formatted PDF reports.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Accountant', 'Account Department', 'Read-only Auditor']
      }
    ]
  },
  {
    id: 'transport',
    name: 'Transport & GPS Routes',
    category: 'Campus Logistics',
    description: 'Bus routes, driver contacts, and monthly transport fees.',
    subSections: [
      {
        id: 'transport_routes',
        name: 'Bus Routes, Stops & Fleet Roster',
        moduleId: 'transport',
        description: 'Manage vehicle records, driver contacts, and student pick-up stops.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Transport Department']
      }
    ]
  },
  {
    id: 'library',
    name: 'Library Catalog',
    category: 'Campus Logistics',
    description: 'Book inventory, accession numbers, and borrowed logs.',
    subSections: [
      {
        id: 'library_catalog',
        name: 'Book Catalog & Book Circulation',
        moduleId: 'library',
        description: 'Search books by ISBN/Author, issue books, and manage return dues.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Student', 'Parent']
      }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory & Lab Assets',
    category: 'Campus Logistics',
    description: 'School assets, stock counts, and storage locations.',
    subSections: [
      {
        id: 'inventory_assets',
        name: 'School Asset Registry & Stock',
        moduleId: 'inventory',
        description: 'Track lab apparatus, classroom furniture, sports stock, and asset depreciations.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal']
      }
    ]
  },
  {
    id: 'hostel',
    name: 'Hostel & Dorms',
    category: 'Campus Logistics',
    description: 'Dorm room allocations, hostel blocks, and occupancy.',
    subSections: [
      {
        id: 'hostel_rooms',
        name: 'Hostel Ward & Room Allocation',
        moduleId: 'hostel',
        description: 'Manage student boarders, room occupancies, and mess menu.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal']
      }
    ]
  },
  {
    id: 'visitor',
    name: 'Visitor Gate Pass',
    category: 'Campus Logistics',
    description: 'Gate pass generation, check-in/out, and visitor logs.',
    subSections: [
      {
        id: 'visitor_passes',
        name: 'Visitor Gate Passes & Check-in',
        moduleId: 'visitor',
        description: 'Generate visitor badges, verify OTP/identity, and log vehicle movements.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Reception', 'Visitor']
      }
    ]
  },
  {
    id: 'communication',
    name: 'Digital Noticeboard',
    category: 'Tools & Utilities',
    description: 'School announcements, circulars, and system alerts.',
    subSections: [
      {
        id: 'comm_notices',
        name: 'School Circulars & Digital Noticeboard',
        moduleId: 'communication',
        description: 'Read and broadcast notices, event announcements, and emergency campus alerts.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Teacher', 'Class Teacher', 'Student', 'Parent', 'Admission Team', 'Accountant', 'Timetable Incharge', 'Reception', 'HR', 'Examination Incharge', 'Transport Department', 'Read-only Auditor']
      }
    ]
  },
  {
    id: 'certificates',
    name: 'TC & Certificates',
    category: 'Tools & Utilities',
    description: 'Transfer Certificates, Character & Bonafide slips.',
    subSections: [
      {
        id: 'certificates_generate',
        name: 'Issue Transfer Certificates (TC) & Bonafide',
        moduleId: 'certificates',
        description: 'Generate formatted TC slips, character certificates, and bonafide letters.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Examination Incharge']
      }
    ]
  },
  {
    id: 'idcards',
    name: 'Smart ID Cards',
    category: 'Tools & Utilities',
    description: 'Digital student and staff ID card generator.',
    subSections: [
      {
        id: 'idcards_print',
        name: 'Digital Student & Staff Smart ID Cards',
        moduleId: 'idcards',
        description: 'Generate and print barcode/QR-enabled student and employee ID cards.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal', 'Student']
      }
    ]
  },
  {
    id: 'supabase_cloud',
    name: 'Supabase & Cloud Hub',
    category: 'Tools & Utilities',
    description: 'Database synchronization and cloud project settings.',
    subSections: [
      {
        id: 'cloud_sync',
        name: 'Cloud Database Synchronization & Health',
        moduleId: 'supabase_cloud',
        description: 'Sync local data with Supabase PostgreSQL cloud storage.',
        defaultRoles: ['Super Admin', 'School Admin'],
        adminOnly: true
      }
    ]
  },
  {
    id: 'settings',
    name: 'System Settings',
    category: 'Tools & Utilities',
    description: 'School profile, academic sessions, and system config.',
    subSections: [
      {
        id: 'settings_general',
        name: 'School Profile & Session Management',
        moduleId: 'settings',
        description: 'Configure school name, affiliation, grading rules, and active academic year.',
        defaultRoles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal'],
        adminOnly: true
      }
    ]
  }
];

// Helper to get all registered sub-section IDs
export const ALL_SUBSECTION_IDS: string[] = MODULE_SUBSECTIONS_REGISTRY.flatMap((m) =>
  m.subSections.map((s) => s.id)
);

// Map of default sub-section IDs per role
export const DEFAULT_ROLE_SUBSECTION_PERMISSIONS: Record<UserRole, string[]> = {
  'Super Admin': [...ALL_SUBSECTION_IDS],
  'School Admin': [...ALL_SUBSECTION_IDS],
  'Principal': [...ALL_SUBSECTION_IDS],
  'Vice Principal': [...ALL_SUBSECTION_IDS],

  // Teachers: STRICTLY limited to Student Directory, Marks Entry (NO exam setup, NO exam timetable), Timetable (Personal, Substitutions, Round Duty), Daily Classroom Attendance, Attendance Calendar, Lesson Plans, Digital Noticeboard.
  'Teacher': [
    'sis_directory',
    'exam_marks_entry',
    'timetable_teacher_view',
    'timetable_substitutions',
    'timetable_round_duty',
    'attendance_classroom',
    'attendance_calendar',
    'attendance_mark',
    'attendance_history',
    'lesson_plans_my',
    'comm_notices'
  ],
  'Class Teacher': [
    'sis_directory',
    'exam_marks_entry',
    'timetable_teacher_view',
    'timetable_substitutions',
    'timetable_round_duty',
    'attendance_classroom',
    'attendance_calendar',
    'attendance_mark',
    'attendance_history',
    'lesson_plans_my',
    'comm_notices'
  ],

  'Student': [
    'sis_directory',
    'timetable_teacher_view',
    'attendance_calendar',
    'attendance_history',
    'library_catalog',
    'comm_notices',
    'idcards_print'
  ],
  'Parent': [
    'sis_directory',
    'timetable_teacher_view',
    'attendance_calendar',
    'attendance_history',
    'fees_dues',
    'comm_notices'
  ],

  'Admission Team': [
    'admission_new',
    'admission_inquiries',
    'admission_status',
    'sis_directory',
    'comm_notices'
  ],
  'Accountant': [
    'fees_collect',
    'fees_dues',
    'reports_student',
    'comm_notices'
  ],
  'Account Department': [
    'fees_collect',
    'fees_dues',
    'reports_student',
    'comm_notices'
  ],
  'Timetable Incharge': [
    'timetable_teacher_view',
    'timetable_substitutions',
    'timetable_round_duty',
    'timetable_builder',
    'timetable_bulk_upload',
    'timetable_analytics',
    'staff_directory',
    'comm_notices'
  ],
  'Reception': [
    'visitor_passes',
    'attendance_gate_entry',
    'attendance_staff_register',
    'comm_notices'
  ],
  'HR': [
    'staff_directory',
    'staff_manage',
    'attendance_staff_register',
    'interview_candidates',
    'comm_notices'
  ],
  'Interview Panel': [
    'staff_directory',
    'interview_candidates',
    'comm_notices'
  ],
  'Examination Incharge': [
    'exam_marks_entry',
    'exam_setup',
    'exam_timetable',
    'exam_designer',
    'exam_analytics',
    'exam_subjects',
    'sis_directory',
    'sis_export',
    'certificates_generate',
    'comm_notices'
  ],
  'Transport Department': [
    'transport_routes',
    'attendance_bus_guardian',
    'comm_notices'
  ],
  'Visitor': [
    'visitor_passes',
    'comm_notices'
  ],
  'Read-only Auditor': [
    'sis_directory',
    'attendance_calendar',
    'attendance_history',
    'exam_analytics',
    'reports_student',
    'comm_notices'
  ]
};
