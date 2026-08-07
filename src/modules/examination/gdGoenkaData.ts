export interface GDGoenkaSchoolMeta {
  schoolName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  session: string;
}

export const GD_GOENKA_SCHOOL_META: GDGoenkaSchoolMeta = {
  schoolName: 'G D GOENKA PUBLIC SCHOOL, AGRA',
  tagline: 'Thrive. For Life. | Agra',
  address: 'Bodla Bichpuri Road, Near Shastripuram, Agra',
  phone: '8755100404, 9568011007, 956011003',
  email: 'info@gdgoenkaagra.com',
  session: 'Session - 2025-26'
};

export type EducationalStageId = 'STAGE_A' | 'STAGE_B' | 'STAGE_C' | 'STAGE_D' | 'STAGE_E_SEC' | 'STAGE_E_SR';

export interface EducationalStageInfo {
  id: EducationalStageId;
  code: string;
  title: string;
  track: 'HPC' | 'ACADEMIC';
  classes: string[];
  docTitle: string;
  description: string;
}

export const EDUCATIONAL_STAGES: EducationalStageInfo[] = [
  {
    id: 'STAGE_A',
    code: 'PRE_PRIMARY',
    title: 'Stage A: Pre-Primary (PG / Nursery / LKG / UKG)',
    track: 'HPC',
    classes: ['Playgroup', 'Nursery', 'LKG', 'UKG'],
    docTitle: 'Holistic Progress Card, Term - 2',
    description: 'NIPUN / NCF-SE Pattern with 3-Level Competencies (🌱 Beginner, 🌿 Progressing, 🌳 Proficient) & Multi-Stakeholder Feedback'
  },
  {
    id: 'STAGE_B',
    code: 'FOUNDATIONAL',
    title: 'Stage B: Foundational Stage (Class I & II)',
    track: 'HPC',
    classes: ['Class 1', 'Class 2'],
    docTitle: 'Holistic Progress Card, Term - 2',
    description: 'NIPUN & NCF Foundational Competency Matrix, Learner Profile Glimpses & Personal Portfolios'
  },
  {
    id: 'STAGE_C',
    code: 'PRIMARY',
    title: 'Stage C: Primary Stage (Class III, IV & V)',
    track: 'ACADEMIC',
    classes: ['Class 3', 'Class 4', 'Class 5'],
    docTitle: 'Annual Report, Session - 2025-26',
    description: 'Term 1 (50 Marks) + Term 2 (50 Marks) Breakdown (Periodic 2.5 + SE 2.5 + Portfolio 2.5 + MA 2.5 + Annual 40)'
  },
  {
    id: 'STAGE_D',
    code: 'MIDDLE',
    title: 'Stage D: Middle Stage (Class VI, VII & VIII)',
    track: 'ACADEMIC',
    classes: ['Class 6', 'Class 7', 'Class 8'],
    docTitle: 'Annual Report, Session - 2025-26',
    description: 'Term 1 (100 Marks) + Term 2 (100 Marks) Breakdown (Pen Paper 5 + MA 5 + Portfolio 5 + SE 5 + Annual 80/100)'
  },
  {
    id: 'STAGE_E_SEC',
    code: 'SECONDARY',
    title: 'Stage E: Secondary Stage (Class IX & X)',
    track: 'ACADEMIC',
    classes: ['Class 9', 'Class 10'],
    docTitle: 'Annual Report, Session - 2025-26',
    description: 'CBSE Secondary Pattern (Pen Paper 5 + MA 5 + Portfolio 5 + SE 5 + Annual 80 for Main / 100 for IT/CA)'
  },
  {
    id: 'STAGE_E_SR',
    code: 'SR_SECONDARY',
    title: 'Stage E: Senior Secondary Stage (Class XI & XII)',
    track: 'ACADEMIC',
    classes: ['Class 11', 'Class 12'],
    docTitle: 'Annual Report, Session - 2025-26',
    description: 'Theory (Half Yearly + Annual + Periodic I & II) + Practical (Half Yearly + Annual) Splits out of 100'
  }
];

export interface NCFCompetencyGoal {
  goalId: string;
  goalNumber: string;
  domainName: string;
  competencies: string[];
}

export const NCF_CURRICULUM_GOALS: NCFCompetencyGoal[] = [
  {
    goalId: 'g1',
    goalNumber: 'Goal 1',
    domainName: 'Health, Hygiene & Safety',
    competencies: [
      'Eats nutritious food independently & practices personal hygiene',
      'Demonstrates body awareness & follows basic safety precautions'
    ]
  },
  {
    goalId: 'g2',
    goalNumber: 'Goal 2',
    domainName: 'Sensorial Perception',
    competencies: [
      'Differentiates shapes, colors, textures, sounds, touch & smell',
      'Exhibits keen visual discrimination and auditory attention'
    ]
  },
  {
    goalId: 'g3',
    goalNumber: 'Goal 3',
    domainName: 'Physical & Motor Development',
    competencies: [
      'Demonstrates bodily balance, flexibility, coordination & agility',
      'Exhibits fine motor control in gripping, cutting, tracing & eye-hand coordination'
    ]
  },
  {
    goalId: 'g4_5',
    goalNumber: 'Goal 4 & 5',
    domainName: 'Socio-Emotional, Ethical & SEWA Development',
    competencies: [
      'Displays emotional self-regulation, empathy & peer cooperation',
      'Shows kindness, respects classroom rules, & participates in physical tasks'
    ]
  },
  {
    goalId: 'g6_7',
    goalNumber: 'Goal 6 & 7',
    domainName: 'Natural Environment & Logical Thinking',
    competencies: [
      'Observes natural surroundings, plants, animals & weather changes',
      'Identifies cause-and-effect relationships and asks curious questions'
    ]
  },
  {
    goalId: 'g8',
    goalNumber: 'Goal 8',
    domainName: 'Cognitive & Mathematical Abilities',
    competencies: [
      'Demonstrates sorting, pattern recognition, forward/backward counting',
      'Understands numerals, basic addition/subtraction, & 2D/3D geometry'
    ]
  },
  {
    goalId: 'g9_11',
    goalNumber: 'Goal 9, 10 & 11',
    domainName: 'Language & Literacy Development (L1 & L2)',
    competencies: [
      'Recites nursery rhymes & listens with comprehension',
      'Shows phonic awareness, reads passages with intonation, & writes simple words'
    ]
  },
  {
    goalId: 'g12',
    goalNumber: 'Goal 12',
    domainName: 'Cultural & Aesthetic Expression',
    competencies: [
      'Expresses creativity through visual arts, music, rhythm & dance',
      'Participates enthusiastically in role-play, drama & storytelling'
    ]
  },
  {
    goalId: 'g13',
    goalNumber: 'Goal 13',
    domainName: 'Positive Learning Habits',
    competencies: [
      'Maintains sustained focus, completes assigned goals independently',
      'Explores minute details with curiosity & perseverance'
    ]
  }
];

export interface HPCStudentProfileSample {
  studentId: string;
  allAboutMe: {
    favoriteColor: string;
    favoriteFood: string;
    favoriteAnimal: string;
    favoriteGame: string;
  };
  attendance: {
    term1Present: number;
    term1TotalDays: number;
    term2Present: number;
    term2TotalDays: number;
  };
  healthStatus: {
    heightCms: number;
    weightKgs: number;
  };
  parentFeedback: {
    enjoysParticipatingIn: string;
    canBeSupportedFor: string;
    additionalSharing: string;
    vaccinationStatus: string;
  };
  selfAssessment: {
    enjoysMost: string;
    findsDifficult: string;
    enjoysWithFriends: string;
  };
  peerAssessment: {
    helpsInTasks: string;
    likesToPlayWithOthers: string;
    sharesStationery: string;
  };
  competencyRatings: Record<string, { term1: 'BEGINNER' | 'PROGRESSING' | 'PROFICIENT'; term2: 'BEGINNER' | 'PROGRESSING' | 'PROFICIENT' }>;
}

export const SAMPLE_HPC_DATA: HPCStudentProfileSample = {
  studentId: 'std-101',
  allAboutMe: {
    favoriteColor: 'Bright Yellow & Sky Blue',
    favoriteFood: 'Paneer Paratha & Mango Shake',
    favoriteAnimal: 'Playful Puppy & Golden Fish',
    favoriteGame: 'Building Blocks & Hide-and-Seek'
  },
  attendance: {
    term1Present: 104,
    term1TotalDays: 110,
    term2Present: 108,
    term2TotalDays: 112
  },
  healthStatus: {
    heightCms: 118,
    weightKgs: 21.5
  },
  parentFeedback: {
    enjoysParticipatingIn: 'Storytelling sessions, outdoor races, and drawing competitions.',
    canBeSupportedFor: 'Sustained handwriting practice and neat coloring within borders.',
    additionalSharing: 'Loves reading illustrated picture storybooks at bedtime with parents.',
    vaccinationStatus: 'All mandatory age-appropriate vaccinations completed up to date.'
  },
  selfAssessment: {
    enjoysMost: 'Clay modeling, singing action songs, and building wooden Lego towers.',
    findsDifficult: 'Buttoning shirt sleeves and tying shoelaces independently.',
    enjoysWithFriends: 'Sharing snacks during break time and playing hide-and-seek.'
  },
  peerAssessment: {
    helpsInTasks: 'Always ready to help classmates put away toys and stationery blocks.',
    likesToPlayWithOthers: 'Eagerly includes everyone in group circle time activities.',
    sharesStationery: 'Generously shares crayons, pencils, and craft paper with peers.'
  },
  competencyRatings: {
    g1: { term1: 'PROGRESSING', term2: 'PROFICIENT' },
    g2: { term1: 'PROGRESSING', term2: 'PROFICIENT' },
    g3: { term1: 'PROGRESSING', term2: 'PROFICIENT' },
    g4_5: { term1: 'PROFICIENT', term2: 'PROFICIENT' },
    g6_7: { term1: 'PROGRESSING', term2: 'PROFICIENT' },
    g8: { term1: 'PROGRESSING', term2: 'PROFICIENT' },
    g9_11: { term1: 'PROGRESSING', term2: 'PROFICIENT' },
    g12: { term1: 'PROFICIENT', term2: 'PROFICIENT' },
    g13: { term1: 'PROGRESSING', term2: 'PROFICIENT' }
  }
};

export interface CoScholasticAndSoftSkillsData {
  vocationalAreas: { name: string; term2Score: number; maxScore: number; grade: string }[];
  coScholasticAreas: { name: string; grade: 'A' | 'B' | 'C' }[];
  socialSkills: { name: string; grade: 'A' | 'B' | 'C' }[];
  workHabits: { name: string; grade: 'A' | 'B' | 'C' }[];
  activities: { groupAOutdoor: string; groupAOutdoorGrade: 'A' | 'B' | 'C'; groupBIndoor: string; groupBIndoorGrade: 'A' | 'B' | 'C' };
  attendance: { term1Present: number; term1Total: number; term2Present: number; term2Total: number };
  health: { heightCms: number; weightKgs: number };
}

export const SAMPLE_CO_SCHOLASTIC_DATA: CoScholasticAndSoftSkillsData = {
  vocationalAreas: [
    { name: 'Computer Science & Coding', term2Score: 48, maxScore: 50, grade: 'A1' },
    { name: 'General Knowledge & Current Affairs', term2Score: 45, maxScore: 50, grade: 'A1' },
    { name: 'German / Sanskrit Language', term2Score: 46, maxScore: 50, grade: 'A1' }
  ],
  coScholasticAreas: [
    { name: 'Art Education & Visual Arts', grade: 'A' },
    { name: 'Work Education / Pre-Vocational Skills', grade: 'A' },
    { name: 'Health & Physical Education', grade: 'A' },
    { name: 'Discipline & Conduct', grade: 'A' }
  ],
  socialSkills: [
    { name: 'Courtesy & Respect', grade: 'A' },
    { name: 'Discipline & Self-Control', grade: 'A' },
    { name: 'Punctuality and Regularity', grade: 'A' },
    { name: 'Sense of Responsibility', grade: 'A' },
    { name: 'Sensitive to Others\' Needs', grade: 'A' }
  ],
  workHabits: [
    { name: 'Begins & Completes Work on Time', grade: 'A' },
    { name: 'Is Confident & Articulate', grade: 'A' },
    { name: 'Is Fond of Reading & Literature', grade: 'A' },
    { name: 'Responds Appropriately to Directions', grade: 'A' },
    { name: 'Takes Initiative in Class Activities', grade: 'A' }
  ],
  activities: {
    groupAOutdoor: 'Lawn Tennis & Athletics',
    groupAOutdoorGrade: 'A',
    groupBIndoor: 'Chess & Robotic Assembly',
    groupBIndoorGrade: 'A'
  },
  attendance: {
    term1Present: 104,
    term1Total: 110,
    term2Present: 108,
    term2Total: 112
  },
  health: {
    heightCms: 148,
    weightKgs: 38.5
  }
};
