import { Student } from '../types/sis';
import { ExaminationType, SubjectConfig, ExamMarkSheet, ReportCardTemplate } from '../types/examination';
import { AdmissionApplication, SeatAvailability } from '../types/admission';
import { CandidateApplicant } from '../types/interview';
import { StaffMember, TransportRoute, LibraryBook, NoticeItem, VisitorPass, FeeTransaction } from '../types/otherModules';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-101',
    admissionNo: 'ADM-2024-001',
    registrationNo: 'REG-88210',
    scholarNo: 'SCH-1001',
    penNo: 'PEN-9821430981',
    apaarId: 'APAAR-771239108234',
    aadhaarNo: '4812 9012 3412',
    fullName: 'Aarav Sharma',
    gender: 'Male',
    dob: '2010-05-14',
    bloodGroup: 'O+',
    religion: 'Hinduism',
    category: 'General',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    admissionDate: '2020-04-01',
    admissionClass: 'Class 5',
    currentClass: 'Class 10',
    section: 'A',
    rollNo: 1,
    house: 'Red',
    previousSchool: 'St. Xavier High School',
    tcNumber: 'TC-2020-412',
    transportRequired: true,
    busRouteNo: 'Route 4 - Sector 15',
    hostelRequired: false,
    parents: {
      fatherName: 'Rajesh Sharma',
      fatherOccupation: 'Senior Software Engineer',
      fatherMobile: '+91 98765 43210',
      fatherEmail: 'rajesh.sharma@example.com',
      fatherIncome: '18,00,000 PA',
      fatherQualification: 'B.Tech CS',
      motherName: 'Sunita Sharma',
      motherOccupation: 'High School Teacher',
      motherMobile: '+91 98765 43211',
      motherEmail: 'sunita.sharma@example.com',
      address: 'House No. 42, Green Avenue, Sector 15, New Delhi',
      emergencyContact: '+91 98765 43210'
    },
    medical: {
      bloodGroup: 'O+',
      disability: false,
      allergies: 'Mild dust allergy',
      doctorContact: 'Dr. V. K. Gupta (+91 98111 22233)'
    },
    documents: [
      { id: 'doc-1', title: 'Birth Certificate', type: 'Birth Certificate', fileName: 'aarav_birth_cert.pdf', uploadDate: '2020-04-01', url: '#', verified: true },
      { id: 'doc-2', title: 'Aadhaar Card', type: 'Aadhaar', fileName: 'aarav_aadhaar.pdf', uploadDate: '2020-04-01', url: '#', verified: true },
      { id: 'doc-3', title: 'Transfer Certificate', type: 'Transfer Certificate', fileName: 'tc_xavier.pdf', uploadDate: '2020-04-01', url: '#', verified: true }
    ],
    siblings: [
      { id: 'sib-1', name: 'Ananya Sharma', classSection: 'Class 7-B', admissionNo: 'ADM-2022-045', relation: 'Sister' }
    ],
    promotions: [
      { id: 'p-1', academicYear: '2023-2024', fromClassSection: 'Class 9-A', toClassSection: 'Class 10-A', promotionDate: '2024-03-25', status: 'Promoted', remarks: 'Passed with Distinction (92%)' }
    ],
    status: 'Active'
  },
  {
    id: 'std-102',
    admissionNo: 'ADM-2024-002',
    registrationNo: 'REG-88211',
    scholarNo: 'SCH-1002',
    penNo: 'PEN-9821430982',
    apaarId: 'APAAR-771239108235',
    aadhaarNo: '5812 9012 3413',
    fullName: 'Ananya Verma',
    gender: 'Female',
    dob: '2010-09-22',
    bloodGroup: 'B+',
    religion: 'Hinduism',
    category: 'OBC',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    admissionDate: '2021-04-01',
    admissionClass: 'Class 6',
    currentClass: 'Class 10',
    section: 'A',
    rollNo: 2,
    house: 'Blue',
    transportRequired: true,
    busRouteNo: 'Route 2 - MG Road',
    hostelRequired: false,
    parents: {
      fatherName: 'Vikram Verma',
      fatherOccupation: 'Bank Manager',
      fatherMobile: '+91 98123 45678',
      fatherEmail: 'vikram.verma@example.com',
      fatherIncome: '12,00,000 PA',
      fatherQualification: 'M.Com',
      motherName: 'Meenakshi Verma',
      motherOccupation: 'Architect',
      motherMobile: '+91 98123 45679',
      motherEmail: 'meenakshi.v@example.com',
      address: 'Flat 302, Palm Heights, MG Road, New Delhi',
      emergencyContact: '+91 98123 45678'
    },
    medical: {
      bloodGroup: 'B+',
      disability: false
    },
    documents: [
      { id: 'doc-4', title: 'Birth Certificate', type: 'Birth Certificate', fileName: 'ananya_birth.pdf', uploadDate: '2021-04-01', url: '#', verified: true }
    ],
    siblings: [],
    promotions: [
      { id: 'p-2', academicYear: '2023-2024', fromClassSection: 'Class 9-A', toClassSection: 'Class 10-A', promotionDate: '2024-03-25', status: 'Promoted', remarks: 'Excellent academic track record' }
    ],
    status: 'Active'
  },
  {
    id: 'std-103',
    admissionNo: 'ADM-2024-003',
    registrationNo: 'REG-88212',
    scholarNo: 'SCH-1003',
    penNo: 'PEN-9821430983',
    apaarId: 'APAAR-771239108236',
    aadhaarNo: '6812 9012 3414',
    fullName: 'Rohan Patel',
    gender: 'Male',
    dob: '2010-01-11',
    bloodGroup: 'A+',
    religion: 'Hinduism',
    category: 'General',
    nationality: 'Indian',
    motherTongue: 'Gujarati',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    admissionDate: '2022-04-01',
    admissionClass: 'Class 8',
    currentClass: 'Class 10',
    section: 'B',
    rollNo: 1,
    house: 'Green',
    transportRequired: false,
    hostelRequired: true,
    hostelRoomNo: 'Hostel A - Room 204',
    parents: {
      fatherName: 'Suresh Patel',
      fatherOccupation: 'Business Executive',
      fatherMobile: '+91 99887 76655',
      fatherEmail: 'suresh.p@example.com',
      fatherIncome: '25,00,000 PA',
      fatherQualification: 'MBA',
      motherName: 'Kavita Patel',
      motherOccupation: 'Homemaker',
      motherMobile: '+91 99887 76656',
      motherEmail: 'kavita.p@example.com',
      address: 'Plot 105, Civil Lines, Ahmedabad',
      emergencyContact: '+91 99887 76655'
    },
    medical: {
      bloodGroup: 'A+',
      disability: false
    },
    documents: [],
    siblings: [],
    promotions: [],
    status: 'Active'
  },
  {
    id: 'std-104',
    admissionNo: 'ADM-2024-004',
    registrationNo: 'REG-88213',
    scholarNo: 'SCH-1004',
    penNo: 'PEN-9821430984',
    apaarId: 'APAAR-771239108237',
    aadhaarNo: '7812 9012 3415',
    fullName: 'Ankur Sharma',
    gender: 'Male',
    dob: '2010-06-18',
    bloodGroup: 'B+',
    religion: 'Hinduism',
    category: 'General',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    admissionDate: '2021-04-01',
    admissionClass: 'Class 6',
    currentClass: 'Class 10',
    section: 'A',
    rollNo: 4,
    house: 'Yellow',
    transportRequired: true,
    busRouteNo: 'Route 1 - Civil Lines Metro',
    hostelRequired: false,
    parents: {
      fatherName: 'Mahesh Sharma',
      fatherOccupation: 'Chartered Accountant',
      fatherMobile: '+91 98765 99887',
      fatherEmail: 'mahesh.ankur@example.com',
      fatherIncome: '20,00,000 PA',
      fatherQualification: 'FCA, B.Com',
      motherName: 'Ritu Sharma',
      motherOccupation: 'Professor',
      motherMobile: '+91 98765 99888',
      motherEmail: 'ritu.ankur@example.com',
      address: 'House 88, Model Town Phase 2, Delhi',
      emergencyContact: '+91 98765 99887'
    },
    medical: {
      bloodGroup: 'B+',
      disability: false,
      allergies: 'None',
      doctorContact: 'Dr. S. K. Rastogi'
    },
    documents: [
      { id: 'doc-ankur-1', title: 'Birth Certificate', type: 'Birth Certificate', fileName: 'ankur_birth.pdf', uploadDate: '2021-04-01', url: '#', verified: true },
      { id: 'doc-ankur-2', title: 'Aadhaar Card', type: 'Aadhaar', fileName: 'ankur_aadhaar.pdf', uploadDate: '2021-04-01', url: '#', verified: true }
    ],
    siblings: [],
    promotions: [
      { id: 'p-ankur-1', academicYear: '2023-2024', fromClassSection: 'Class 9-A', toClassSection: 'Class 10-A', promotionDate: '2024-03-25', status: 'Promoted', remarks: 'Passed with Distinction (94%)' }
    ],
    status: 'Active'
  },
  {
    id: 'std-105',
    admissionNo: 'ADM-2024-005',
    registrationNo: 'REG-88214',
    scholarNo: 'SCH-1005',
    penNo: 'PEN-9821430985',
    apaarId: 'APAAR-771239108238',
    aadhaarNo: '8812 9012 3416',
    fullName: 'Abhir Sharma',
    gender: 'Male',
    dob: '2010-04-12',
    bloodGroup: 'O+',
    religion: 'Hinduism',
    category: 'General',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    admissionDate: '2022-04-01',
    admissionClass: 'Class 8',
    currentClass: 'Class 10',
    section: 'A',
    rollNo: 5,
    house: 'Red',
    transportRequired: true,
    busRouteNo: 'Route 3 - Sector 62',
    hostelRequired: false,
    parents: {
      fatherName: 'Suresh Sharma',
      fatherOccupation: 'Senior Executive',
      fatherMobile: '+91 98100 55443',
      fatherEmail: 'suresh.abhir@example.com',
      fatherIncome: '15,00,000 PA',
      fatherQualification: 'M.Tech',
      motherName: 'Sunita Sharma',
      motherOccupation: 'Designer',
      motherMobile: '+91 98100 55444',
      motherEmail: 'sunita.abhir@example.com',
      address: 'House 102, Green Park, Delhi',
      emergencyContact: '+91 98100 55443'
    },
    medical: { bloodGroup: 'O+', disability: false },
    documents: [],
    siblings: [],
    promotions: [],
    status: 'Active'
  },
  {
    id: 'std-106',
    admissionNo: 'ADM-2024-006',
    registrationNo: 'REG-88215',
    scholarNo: 'SCH-1006',
    penNo: 'PEN-9821430986',
    apaarId: 'APAAR-771239108239',
    aadhaarNo: '9812 9012 3417',
    fullName: 'Amit Kumar',
    gender: 'Male',
    dob: '2010-08-20',
    bloodGroup: 'AB+',
    religion: 'Hinduism',
    category: 'General',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    admissionDate: '2022-04-01',
    admissionClass: 'Class 8',
    currentClass: 'Class 10',
    section: 'A',
    rollNo: 6,
    house: 'Blue',
    transportRequired: false,
    hostelRequired: false,
    parents: {
      fatherName: 'Rakesh Kumar',
      fatherOccupation: 'Business Owner',
      fatherMobile: '+91 98100 66554',
      fatherEmail: 'rakesh.amit@example.com',
      fatherIncome: '16,00,000 PA',
      fatherQualification: 'B.Com',
      motherName: 'Suman Kumar',
      motherOccupation: 'Homemaker',
      motherMobile: '+91 98100 66555',
      motherEmail: 'suman.amit@example.com',
      address: 'Flat 401, Sapphire Residency, Delhi',
      emergencyContact: '+91 98100 66554'
    },
    medical: { bloodGroup: 'AB+', disability: false },
    documents: [],
    siblings: [],
    promotions: [],
    status: 'Active'
  }
];

export const INITIAL_EXAM_TYPES: ExaminationType[] = [
  { id: 'ex-1', name: 'Unit Test 1', code: 'UT1', category: 'Objective', weightagePercentage: 10, description: '20 Marks Objective & Short Answer Test', calculationStrategy: 'Weighted Percentage', displayInReportCard: true, reportCardSectionGroup: 'Periodic / Weekly Tests' },
  { id: 'ex-2', name: 'Half Yearly Examination', code: 'HYE', category: 'Term', weightagePercentage: 30, description: '80 Marks Comprehensive Mid-Term Assessment', calculationStrategy: 'Weighted Percentage', displayInReportCard: true, reportCardSectionGroup: 'Term 1' },
  { id: 'ex-3', name: 'Unit Test 2', code: 'UT2', category: 'Objective', weightagePercentage: 10, description: '20 Marks Periodic Assessment', calculationStrategy: 'Weighted Percentage', displayInReportCard: true, reportCardSectionGroup: 'Periodic / Weekly Tests' },
  { id: 'ex-4', name: 'Annual Examination', code: 'ANN', category: 'Term', weightagePercentage: 50, description: '100 Marks Cumulative Final Board Pattern Exam', calculationStrategy: 'Weighted Percentage', displayInReportCard: true, reportCardSectionGroup: 'Term 2' },
  { id: 'ex-5', name: 'Practical & Viva', code: 'PRAC', category: 'Practical', weightagePercentage: 20, description: 'Hands-on Lab Experiments and Oral Assessment', calculationStrategy: 'Weighted Percentage', displayInReportCard: true, reportCardSectionGroup: 'Practicals & Oral' },
  { id: 'ex-6', name: 'Weekly Test Series (20 Tests)', code: 'WT-SERIES', category: 'Weekly Test', weightagePercentage: 10, description: '20 Weekly Tests - Configurable as Best of N or Average', calculationStrategy: 'Best of N', bestCount: 3, displayInReportCard: true, reportCardSectionGroup: 'Periodic / Weekly Tests' }
];

export const INITIAL_SUBJECTS: SubjectConfig[] = [
  { id: 'sub-1', code: 'MATH-10', name: 'Mathematics', type: 'Core', maxMarks: 100, passingMarks: 33, hasTheory: true, theoryMaxMarks: 80, hasPractical: false, practicalMaxMarks: 0, hasInternal: true, internalMaxMarks: 20, isGradeBasedOnly: false },
  { id: 'sub-2', code: 'SCI-10', name: 'Science & Tech', type: 'Core', maxMarks: 100, passingMarks: 33, hasTheory: true, theoryMaxMarks: 70, hasPractical: true, practicalMaxMarks: 20, hasInternal: true, internalMaxMarks: 10, isGradeBasedOnly: false },
  { id: 'sub-3', code: 'ENG-10', name: 'English Language & Lit', type: 'Core', maxMarks: 100, passingMarks: 33, hasTheory: true, theoryMaxMarks: 80, hasPractical: false, practicalMaxMarks: 0, hasInternal: true, internalMaxMarks: 20, isGradeBasedOnly: false },
  { id: 'sub-4', code: 'SST-10', name: 'Social Studies', type: 'Core', maxMarks: 100, passingMarks: 33, hasTheory: true, theoryMaxMarks: 80, hasPractical: false, practicalMaxMarks: 0, hasInternal: true, internalMaxMarks: 20, isGradeBasedOnly: false },
  { id: 'sub-5', code: 'CS-10', name: 'Computer Applications', type: 'Vocational', maxMarks: 100, passingMarks: 33, hasTheory: true, theoryMaxMarks: 50, hasPractical: true, practicalMaxMarks: 50, hasInternal: false, internalMaxMarks: 0, isGradeBasedOnly: false }
];

export const INITIAL_REPORT_TEMPLATES: ReportCardTemplate[] = [
  {
    id: 'rpt-gd-goenka',
    name: 'G D Goenka Public School Agra - Official Engine',
    boardStyle: 'CBSE',
    headerTitle: 'G D GOENKA PUBLIC SCHOOL, AGRA',
    schoolMotto: 'Thrive. For Life. | Agra',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
    watermarkText: 'G D GOENKA AGRA OFFICIAL REPORT',
    primaryColor: '#1e3a8a',
    footerText: 'Bodla Bichpuri Road, Near Shastripuram, Agra | Ph: 8755100404 | info@gdgoenkaagra.com',
    cbseTermMode: '2_Terms',
    displayedExamIds: ['ex-1', 'ex-2', 'ex-3', 'ex-4', 'ex-5'],

    // Header & Branding
    showLogo: true,
    showSchoolHeader: true,
    showTagline: true,
    showSchoolContact: true,
    showDocTitle: true,
    showWatermark: true,

    // Student Profile
    showStudentPhoto: true,
    showParentPhotos: true,
    showStudentBasicInfo: true,
    showParentDetails: true,
    showHouseName: true,
    showRank: true,
    showHealthStatus: true,
    showAttendance: true,

    // HPC & Foundational
    showAllAboutMe: true,
    showParentFeedback: true,
    showSelfAssessment: true,
    showPeerAssessment: true,
    showNcfCompetencyMatrix: true,
    showPortfolioNote: true,

    // Scholastic Marks
    showScholasticTable: true,
    showTerm1Breakdown: true,
    showTerm2Breakdown: true,
    showAggregateAndGrade: true,
    showOverallPercentage: true,
    showOverallGrade: true,
    showVocationalAreas: true,
    showTheoryPracticalSplit: true,

    // Co-Scholastic & Soft Skills
    showCoScholastic: true,
    showSoftSkillsSocial: true,
    showSoftSkillsWorkHabits: true,
    showActivities: true,
    showGradeScaleTable: true,

    // Footer & Signatures
    showTeacherRemarks: true,
    showClassTeacherSign: true,
    showSubjectTeacherSign: true,
    showPrincipalSignature: true,
    showParentSign: true,
    showQrCode: true,
    showFooterText: true
  },
  {
    id: 'rpt-hpc-nipun',
    name: 'Holistic Progress Card (HPC NCF / NIPUN Pattern)',
    boardStyle: 'CBSE',
    headerTitle: 'G D GOENKA PUBLIC SCHOOL, AGRA',
    schoolMotto: 'Thrive. For Life. | Agra',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
    watermarkText: 'HOLISTIC PROGRESS CARD',
    primaryColor: '#047857',
    footerText: 'NIPUN & NCF Foundational Competency Matrix — Session 2025-26',
    cbseTermMode: '2_Terms',
    displayedExamIds: [],

    // Header & Branding
    showLogo: true,
    showSchoolHeader: true,
    showTagline: true,
    showSchoolContact: true,
    showDocTitle: true,
    showWatermark: true,

    // Student Profile
    showStudentPhoto: true,
    showParentPhotos: true,
    showStudentBasicInfo: true,
    showParentDetails: true,
    showHouseName: true,
    showRank: false,
    showHealthStatus: true,
    showAttendance: true,

    // HPC & Foundational
    showAllAboutMe: true,
    showParentFeedback: true,
    showSelfAssessment: true,
    showPeerAssessment: true,
    showNcfCompetencyMatrix: true,
    showPortfolioNote: true,

    // Scholastic Marks
    showScholasticTable: false,
    showTerm1Breakdown: false,
    showTerm2Breakdown: false,
    showAggregateAndGrade: false,
    showOverallPercentage: false,
    showOverallGrade: false,
    showVocationalAreas: false,
    showTheoryPracticalSplit: false,

    // Co-Scholastic & Soft Skills
    showCoScholastic: true,
    showSoftSkillsSocial: true,
    showSoftSkillsWorkHabits: true,
    showActivities: true,
    showGradeScaleTable: false,

    // Footer & Signatures
    showTeacherRemarks: true,
    showClassTeacherSign: true,
    showSubjectTeacherSign: true,
    showPrincipalSignature: true,
    showParentSign: true,
    showQrCode: true,
    showFooterText: true
  }
];

export const INITIAL_APPLICATIONS: AdmissionApplication[] = [
  {
    id: 'app-1',
    applicationNo: 'APP-2026-101',
    studentName: 'Vihaan Kapur',
    applyingClass: 'Class 11 Science',
    gender: 'Male',
    dob: '2009-08-12',
    parentName: 'Alok Kapur',
    contactNumber: '+91 97111 22334',
    email: 'alok.kapur@example.com',
    previousSchool: 'Delhi Public School',
    applicationDate: '2026-03-10',
    status: 'Interview Scheduled',
    entranceTestScore: 88,
    entranceTestMaxMarks: 100,
    feePaid: true,
    registrationFee: 1500,
    documentsUploaded: ['10th Marksheet', 'Transfer Certificate', 'Aadhaar']
  },
  {
    id: 'app-2',
    applicationNo: 'APP-2026-102',
    studentName: 'Sanya Malhotra',
    applyingClass: 'Class 6',
    gender: 'Female',
    dob: '2014-03-25',
    parentName: 'Rajiv Malhotra',
    contactNumber: '+91 98222 33445',
    email: 'rajiv.m@example.com',
    previousSchool: 'Modern School',
    applicationDate: '2026-03-12',
    status: 'Offered',
    entranceTestScore: 94,
    entranceTestMaxMarks: 100,
    feePaid: true,
    registrationFee: 1500,
    documentsUploaded: ['Birth Certificate', 'Aadhaar', '5th Report Card']
  },
  {
    id: 'app-3',
    applicationNo: 'APP-2026-103',
    studentName: 'Ankur Verma',
    applyingClass: 'Class 10',
    gender: 'Male',
    dob: '2010-04-14',
    parentName: 'Sanjay Verma',
    contactNumber: '+91 98765 11223',
    email: 'sanjay.ankur@example.com',
    previousSchool: 'Springdales School',
    applicationDate: '2026-03-14',
    status: 'Confirmed',
    entranceTestScore: 96,
    entranceTestMaxMarks: 100,
    feePaid: true,
    registrationFee: 1500,
    documentsUploaded: ['9th Marksheet', 'TC', 'Aadhaar']
  }
];

export const INITIAL_CANDIDATES: CandidateApplicant[] = [
  {
    id: 'cand-1',
    candidateCode: 'HR-2026-08',
    fullName: 'Dr. Priya Nambiar',
    email: 'priya.nambiar@example.com',
    phone: '+91 98711 00223',
    appliedPosition: 'PGT Physics',
    subjectExpertise: 'Quantum Mechanics, Electromagnetism',
    highestQualification: 'Ph.D. in Physics, B.Ed.',
    totalExperienceYears: 8,
    expectedSalary: 75000,
    currentSalary: 62000,
    noticePeriodDays: 30,
    resumeUrl: 'https://example.com/resume_priya.pdf',
    demoVideoUrl: 'https://example.com/demo_priya.mp4',
    status: 'In Interview',
    overallScore: 90.0,
    ratings: [
      {
        interviewerId: 'usr-int-1',
        interviewerName: 'Dr. V. K. Sharma (Principal)',
        interviewerNumber: 1,
        roundName: 'Final Panel Interview',
        scores: {
          communication: 9,
          personality: 9,
          subjectKnowledge: 10,
          overall: 9
        },
        remarks: 'Exceptional command over Physics concepts and engaging delivery.',
        decision: 'Selected',
        date: '2026-03-14'
      },
      {
        interviewerId: 'usr-int-2',
        interviewerName: 'Mrs. S. Roy (Academic Head)',
        interviewerNumber: 2,
        roundName: 'Final Panel Interview',
        scores: {
          communication: 9,
          personality: 8.5,
          subjectKnowledge: 9.5,
          overall: 9
        },
        remarks: 'Very articulate, great subject depth and structured teaching method.',
        decision: 'Selected',
        date: '2026-03-14'
      }
    ]
  },
  {
    id: 'cand-2',
    candidateCode: 'HR-2026-09',
    fullName: 'Amitabh Joshi',
    email: 'amitabh.j@example.com',
    phone: '+91 98222 11009',
    appliedPosition: 'TGT Computer Science',
    subjectExpertise: 'Python, Web Development, Data Structures',
    highestQualification: 'M.Tech CSE, B.Ed.',
    totalExperienceYears: 5,
    expectedSalary: 55000,
    currentSalary: 45000,
    noticePeriodDays: 15,
    resumeUrl: 'https://example.com/resume_amitabh.pdf',
    status: 'Selected',
    overallScore: 92.5,
    offeredSalary: 55000,
    joiningDate: '2026-04-01',
    ratings: [
      {
        interviewerId: 'usr-int-2',
        interviewerName: 'Mrs. S. Roy (CS Dept Head)',
        interviewerNumber: 1,
        roundName: 'Final Interview Panel',
        scores: {
          communication: 9.5,
          personality: 9.0,
          subjectKnowledge: 9.5,
          overall: 9.0
        },
        remarks: 'Great hands-on coding teacher. Recommended for immediate hire.',
        decision: 'Selected',
        date: '2026-03-15'
      }
    ]
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'stf-ankur', employeeCode: 'EMP-ANKUR', fullName: 'Ankur Kabra', designation: 'PGT Mathematics', department: 'Mathematics Dept', email: 'ankur.kabra@school.edu', phone: '+91 98765 43210', joiningDate: '2024-04-01', qualification: 'M.Sc. Mathematics, B.Ed.', monthlySalary: 68000, status: 'Active' },
  { id: 'stf-1', employeeCode: 'EMP-001', fullName: 'Dr. V. K. Sharma', designation: 'Principal', department: 'Administration', email: 'principal@school.edu', phone: '+91 98100 11223', joiningDate: '2015-06-01', qualification: 'Ph.D. Education, M.Sc.', monthlySalary: 120000, status: 'Active' },
  { id: 'stf-2', employeeCode: 'EMP-002', fullName: 'Mrs. S. Roy', designation: 'HOD Computer Science', department: 'Academics', email: 's.roy@school.edu', phone: '+91 98100 11224', joiningDate: '2018-04-01', qualification: 'M.Tech CSE, B.Ed.', monthlySalary: 75000, status: 'Active' },
  { id: 'stf-3', employeeCode: 'EMP-003', fullName: 'Mr. Rajesh Namboodiri', designation: 'Examination Incharge', department: 'Examination Dept', email: 'exam@school.edu', phone: '+91 98100 11225', joiningDate: '2019-07-15', qualification: 'M.Sc. Mathematics, B.Ed.', monthlySalary: 70000, status: 'Active' }
];

export const INITIAL_ROUTES: TransportRoute[] = [
  { id: 'tr-1', routeNumber: 'Route 1', routeName: 'Civil Lines - Model Town', vehicleNumber: 'DL 01 PC 9812', driverName: 'Ramesh Chand', driverPhone: '+91 98999 11122', stops: [{ stopName: 'Stop 1 - Civil Lines Metro', pickupTime: '07:15 AM', fee: 1200 }, { stopName: 'Stop 2 - Model Town Park', pickupTime: '07:30 AM', fee: 1500 }], totalCapacity: 45, allocatedStudents: 38 },
  { id: 'tr-2', routeNumber: 'Route 2', routeName: 'MG Road - Vasant Kunj', vehicleNumber: 'DL 01 PC 4411', driverName: 'Sunil Kumar', driverPhone: '+91 98999 33344', stops: [{ stopName: 'Stop 1 - MG Road Metro', pickupTime: '07:10 AM', fee: 1600 }, { stopName: 'Stop 2 - Vasant Kunj Mall', pickupTime: '07:25 AM', fee: 1800 }], totalCapacity: 50, allocatedStudents: 42 }
];

export const INITIAL_NOTICES: NoticeItem[] = [
  { id: 'not-1', title: 'Schedule for Term 1 Final Examinations 2026', date: '2026-03-15', targetAudience: 'All', content: 'The Term 1 examinations for Classes 6 to 12 will commence on September 15th. Please download the detailed date sheet from the Examination module.', postedBy: 'Examination Incharge', isUrgent: true },
  { id: 'not-2', title: 'Parent-Teacher Meeting (PTM) Invitation', date: '2026-03-10', targetAudience: 'Parents', content: 'Dear Parents, PTM for Class 10 and Class 12 will be conducted on Saturday from 9:00 AM to 1:00 PM.', postedBy: 'Principal', isUrgent: false }
];
