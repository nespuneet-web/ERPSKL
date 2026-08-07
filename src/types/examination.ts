export type AssessmentCalculationStrategy = 'Weighted Percentage' | 'Best of N' | 'Average of All' | 'Direct Total';

export interface ExaminationType {
  id: string;
  name: string; // e.g., "Unit Test 1", "Half Yearly", "Annual", "CSA", "Board Pattern"
  code: string;
  category: 'Objective' | 'Subjective' | 'Practical' | 'Oral' | 'Term' | 'Weekly Test' | 'Custom';
  weightagePercentage: number;
  description?: string;
  calculationStrategy?: AssessmentCalculationStrategy;
  bestCount?: number; // e.g. Best 2 out of 5 weekly tests, or Best 3 of 20
  displayInReportCard?: boolean;
  reportCardSectionGroup?: 'Term 1' | 'Term 2' | 'Periodic / Weekly Tests' | 'Internal Assessments' | 'Practicals & Oral' | 'Final Overall';
}

export interface SubjectConfig {
  id: string;
  code: string;
  name: string;
  type: 'Core' | 'Optional' | 'Additional' | 'Vocational' | 'Language' | 'Activity';
  maxMarks: number;
  passingMarks: number;
  hasTheory: boolean;
  theoryMaxMarks: number;
  hasPractical: boolean;
  practicalMaxMarks: number;
  hasInternal: boolean;
  internalMaxMarks: number;
  isGradeBasedOnly: boolean;
}

export interface GradeSystemRule {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description: string;
}

export interface ExamScheduleItem {
  id: string;
  examTypeId: string;
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passingMarks: number;
}

export interface StudentMarkEntry {
  studentId: string;
  theoryMarks?: number;
  practicalMarks?: number;
  internalMarks?: number;
  totalMarksObtained: number;
  gradeObtained?: string;
  status: 'Present' | 'Absent' | 'Medical' | 'Exempted' | 'Late';
  remarks?: string;
}

export interface ExamMarkSheet {
  id: string;
  examTypeId: string;
  className: string;
  sectionName: string;
  subjectId: string;
  academicYear: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  entries: Record<string, StudentMarkEntry>; // studentId -> StudentMarkEntry
}

export interface ReportCardTemplate {
  id: string;
  name: string;
  boardStyle: 'CBSE' | 'ICSE' | 'State Board' | 'International' | 'Custom';
  headerTitle: string;
  schoolMotto: string;
  logoUrl: string;
  watermarkText: string;
  primaryColor: string;
  footerText: string;
  cbseTermMode?: '2_Terms' | 'Annual_Only' | 'Continuous_Periodic';
  displayedExamIds?: string[];

  // Header & Branding Toggles
  showLogo?: boolean;
  showSchoolHeader?: boolean;
  showTagline?: boolean;
  showSchoolContact?: boolean;
  showDocTitle?: boolean;
  showWatermark?: boolean;

  // Student Profile Toggles
  showStudentPhoto?: boolean;
  showParentPhotos?: boolean;
  showStudentBasicInfo?: boolean;
  showParentDetails?: boolean;
  showHouseName?: boolean;
  showRank?: boolean;
  showHealthStatus?: boolean;
  showAttendance?: boolean;

  // HPC & Foundational Toggles
  showAllAboutMe?: boolean;
  showParentFeedback?: boolean;
  showSelfAssessment?: boolean;
  showPeerAssessment?: boolean;
  showNcfCompetencyMatrix?: boolean;
  showPortfolioNote?: boolean;

  // Scholastic Marks & Components Toggles
  showScholasticTable?: boolean;
  showTerm1Breakdown?: boolean;
  showTerm2Breakdown?: boolean;
  showAggregateAndGrade?: boolean;
  showOverallPercentage?: boolean;
  showOverallGrade?: boolean;
  showVocationalAreas?: boolean;
  showTheoryPracticalSplit?: boolean;

  // Co-Scholastic & Soft Skills Toggles
  showCoScholastic?: boolean;
  showSoftSkillsSocial?: boolean;
  showSoftSkillsWorkHabits?: boolean;
  showActivities?: boolean;
  showGradeScaleTable?: boolean;

  // Footer & Signatures Toggles
  showTeacherRemarks?: boolean;
  showClassTeacherSign?: boolean;
  showSubjectTeacherSign?: boolean;
  showPrincipalSignature?: boolean;
  showParentSign?: boolean;
  showQrCode?: boolean;
  showFooterText?: boolean;
}

export interface StudentExamResult {
  studentId: string;
  classRank: number;
  sectionRank: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  cgpa: number;
  overallGrade: string;
  promotionStatus: 'Promoted' | 'Retained' | 'Supplementary' | 'Under Review';
  teacherRemarks: string;
}
