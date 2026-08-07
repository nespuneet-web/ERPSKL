export interface EvaluationCriteria {
  communication: number; // 0 - 10
  personality: number; // 0 - 10
  subjectKnowledge: number; // 0 - 10
  overall: number; // 0 - 10
}

export interface InterviewerRating {
  interviewerId: string;
  interviewerName: string;
  interviewerNumber: 1 | 2 | 3 | 4;
  roundName: string;
  scores: EvaluationCriteria;
  remarks: string;
  decision: 'Selected' | 'Not Selected' | 'Rejected / Completely Rejected' | 'Hold';
  date: string;
}

export interface CandidateApplicant {
  id: string;
  candidateCode: string;
  fullName: string;
  email: string;
  phone: string;
  appliedPosition: string; // e.g., "PGT Mathematics", "TGT Science", "PRT English"
  subjectExpertise: string;
  highestQualification: string;
  totalExperienceYears: number;
  expectedSalary: number;
  currentSalary: number;
  noticePeriodDays: number;
  resumeUrl: string;
  demoVideoUrl?: string;
  status: 'New' | 'Shortlisted' | 'In Interview' | 'Selected' | 'Not Selected' | 'Rejected / Completely Rejected' | 'Joined';
  overallScore: number;
  ratings: InterviewerRating[];
  offeredSalary?: number;
  joiningDate?: string;
}
