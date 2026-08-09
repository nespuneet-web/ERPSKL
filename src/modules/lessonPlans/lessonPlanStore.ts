import { useState, useEffect } from 'react';
import {
  syncLessonPlanToSupabase,
  fetchLessonPlansFromSupabase,
  syncLessonAlertToSupabase,
  fetchLessonAlertsFromSupabase
} from '../../lib/supabaseSync';

export interface LessonPlan {
  id: string;
  className: string;      // e.g. "Class 10-A", "Class 6-B", "Class 3-A"
  subject: string;        // e.g. "Mathematics"
  teacherName: string;    // e.g. "POONAM SINGH"
  teacherRole: string;    // e.g. "PGT Physics"
  teacherGroup: 'Junior' | 'Middle' | 'Senior'; // Group categorization
  topic: string;          // e.g. "Quadratic Equations & Complex Numbers"
  targetWeek: string;     // e.g. "Week 12 (April Term 1)"
  targetCompletionDate: string; // e.g. "2026-04-18"
  status: 'COMPLETED_ON_TIME' | 'NOT_COMPLETED_ON_TIME' | 'IN_PROGRESS';
  periodsRequired: number; // e.g. 8 periods
  periodsCompleted: number; // e.g. 6 periods
  lastUpdatedBy: string;   // User name who edited
  lastUpdatedAt: string;   // Timestamp ISO
  remarks?: string;
}

export interface PrincipalTeacherAlert {
  id: string;
  lessonPlanId: string;
  teacherName: string;
  className: string;
  subject: string;
  sender: 'Principal' | 'Teacher';
  message: string;
  timestamp: string;
  status: 'Sent' | 'Read' | 'Acknowledged';
}

const LESSON_PLANS_KEY = 'schoolerp_lesson_plans_v2';
const LESSON_ALERTS_KEY = 'schoolerp_lesson_alerts_v1';

const INITIAL_LESSON_PLANS: LessonPlan[] = [
  // --- JUNIOR TEACHERS (Classes 1 to 5) ---
  {
    id: 'lp-j1',
    className: 'Class 1-A',
    subject: 'English Rhymes & Phonics',
    teacherName: 'SHALINI SHRIVASTAVA',
    teacherRole: 'PRT English',
    teacherGroup: 'Junior',
    topic: 'Vowels, Consonants & Story Recitation',
    targetWeek: 'Week 10 (Mid April)',
    targetCompletionDate: '2026-04-15',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 6,
    periodsCompleted: 6,
    lastUpdatedBy: 'SHALINI SHRIVASTAVA',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Phonics flashcards drill completed.'
  },
  {
    id: 'lp-j2',
    className: 'Class 2-B',
    subject: 'Basic Arithmetic',
    teacherName: 'MEENAKSHI SHARMA',
    teacherRole: 'PRT Mathematics',
    teacherGroup: 'Junior',
    topic: 'Addition with Carrying & Subtraction',
    targetWeek: 'Week 11 (Late April)',
    targetCompletionDate: '2026-04-20',
    status: 'NOT_COMPLETED_ON_TIME',
    periodsRequired: 8,
    periodsCompleted: 4,
    lastUpdatedBy: 'MEENAKSHI SHARMA',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Number rod blocks required in math activity room.'
  },
  {
    id: 'lp-j3',
    className: 'Class 3-A',
    subject: 'Environmental Studies',
    teacherName: 'PRIYANKA SEN',
    teacherRole: 'PRT EVS',
    teacherGroup: 'Junior',
    topic: 'Plants, Leaves & Water Conservation',
    targetWeek: 'Week 12 (May Week 1)',
    targetCompletionDate: '2026-05-02',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 7,
    periodsCompleted: 7,
    lastUpdatedBy: 'PRIYANKA SEN',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Herbal garden field visit completed.'
  },
  {
    id: 'lp-j4',
    className: 'Class 4-B',
    subject: 'Hindi Grammar',
    teacherName: 'SUSHMA TRIVEDI',
    teacherRole: 'PRT Hindi',
    teacherGroup: 'Junior',
    topic: 'Sangya, Sarvanam & Kriya Worksheets',
    targetWeek: 'Week 11 (Late April)',
    targetCompletionDate: '2026-04-22',
    status: 'NOT_COMPLETED_ON_TIME',
    periodsRequired: 6,
    periodsCompleted: 2,
    lastUpdatedBy: 'SUSHMA TRIVEDI',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Extra revision periods needed.'
  },
  {
    id: 'lp-j5',
    className: 'Class 5-C',
    subject: 'General Science',
    teacherName: 'ANURADHA ROY',
    teacherRole: 'PRT Science',
    teacherGroup: 'Junior',
    topic: 'Human Skeleton & Muscular System',
    targetWeek: 'Week 12 (May Week 1)',
    targetCompletionDate: '2026-05-04',
    status: 'IN_PROGRESS',
    periodsRequired: 8,
    periodsCompleted: 5,
    lastUpdatedBy: 'ANURADHA ROY',
    lastUpdatedAt: new Date().toISOString(),
    remarks: '3D mannequin demo pending.'
  },

  // --- MIDDLE TEACHERS (Classes 6 to 8) ---
  {
    id: 'lp-m1',
    className: 'Class 6-A',
    subject: 'Mathematics',
    teacherName: 'RITU KESHARI',
    teacherRole: 'TGT Math',
    teacherGroup: 'Middle',
    topic: 'Fractions, Decimals & Number Line Representation',
    targetWeek: 'Week 10 (Mid April)',
    targetCompletionDate: '2026-04-14',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 9,
    periodsCompleted: 9,
    lastUpdatedBy: 'RITU KESHARI',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Workbook exercises graded.'
  },
  {
    id: 'lp-m2',
    className: 'Class 6-B',
    subject: 'Science',
    teacherName: 'RAJAT JAIN',
    teacherRole: 'TGT Science',
    teacherGroup: 'Middle',
    topic: 'Components of Food & Balanced Diet Experiments',
    targetWeek: 'Week 11 (Late April)',
    targetCompletionDate: '2026-04-19',
    status: 'NOT_COMPLETED_ON_TIME',
    periodsRequired: 8,
    periodsCompleted: 3,
    lastUpdatedBy: 'RAJAT JAIN',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Starch iodine test kit delayed.'
  },
  {
    id: 'lp-m3',
    className: 'Class 7-A',
    subject: 'Social Science',
    teacherName: 'MAHESH DIXIT',
    teacherRole: 'TGT Social Studies',
    teacherGroup: 'Middle',
    topic: 'Our Environment & Earth Crust Layers',
    targetWeek: 'Week 12 (May Week 1)',
    targetCompletionDate: '2026-05-02',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 8,
    periodsCompleted: 8,
    lastUpdatedBy: 'MAHESH DIXIT',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Globe atlas exercise completed.'
  },
  {
    id: 'lp-m4',
    className: 'Class 8-C',
    subject: 'English Literature',
    teacherName: 'Mrs. Sunita Verma',
    teacherRole: 'TGT English',
    teacherGroup: 'Middle',
    topic: 'Tenses, Direct-Indirect Speech & Essay Writing',
    targetWeek: 'Week 12 (May Week 1)',
    targetCompletionDate: '2026-05-05',
    status: 'IN_PROGRESS',
    periodsRequired: 9,
    periodsCompleted: 5,
    lastUpdatedBy: 'Mrs. Sunita Verma',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Grammar worksheets under evaluation.'
  },
  {
    id: 'lp-m5',
    className: 'Class 8-A',
    subject: 'Sanskrit',
    teacherName: 'PANDIT RAMESH KANT',
    teacherRole: 'TGT Sanskrit',
    teacherGroup: 'Middle',
    topic: 'Varna Vichar & Dhatu Roop Exercise',
    targetWeek: 'Week 11 (Late April)',
    targetCompletionDate: '2026-04-25',
    status: 'NOT_COMPLETED_ON_TIME',
    periodsRequired: 6,
    periodsCompleted: 2,
    lastUpdatedBy: 'PANDIT RAMESH KANT',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Pronunciation drills required.'
  },

  // --- SENIOR TEACHERS (Classes 9 to 12) ---
  {
    id: 'lp-s1',
    className: 'Class 9-B',
    subject: 'Science & Tech',
    teacherName: 'RAJAT JAIN',
    teacherRole: 'TGT Science',
    teacherGroup: 'Senior',
    topic: 'Structure of the Atom & Atomic Valency',
    targetWeek: 'Week 12 (May Week 1)',
    targetCompletionDate: '2026-05-02',
    status: 'NOT_COMPLETED_ON_TIME',
    periodsRequired: 8,
    periodsCompleted: 3,
    lastUpdatedBy: 'RAJAT JAIN',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Awaiting model kits in chemistry lab.'
  },
  {
    id: 'lp-s2',
    className: 'Class 10-A',
    subject: 'Mathematics',
    teacherName: 'ANKUR KABRA',
    teacherRole: 'Academic Coordinator & PGT Math',
    teacherGroup: 'Senior',
    topic: 'Real Numbers & Polynomial Equations',
    targetWeek: 'Week 10 (Mid April)',
    targetCompletionDate: '2026-04-15',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 10,
    periodsCompleted: 10,
    lastUpdatedBy: 'ANKUR KABRA',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Covered with exercise solutions and surprise quiz.'
  },
  {
    id: 'lp-s3',
    className: 'Class 10-A',
    subject: 'Physics',
    teacherName: 'POONAM SINGH',
    teacherRole: 'PGT Physics',
    teacherGroup: 'Senior',
    topic: 'Light: Reflection & Refraction Numerical Problems',
    targetWeek: 'Week 11 (Late April)',
    targetCompletionDate: '2026-04-20',
    status: 'NOT_COMPLETED_ON_TIME',
    periodsRequired: 12,
    periodsCompleted: 6,
    lastUpdatedBy: 'POONAM SINGH',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Lab experiments took extra sessions. 4 more periods required.'
  },
  {
    id: 'lp-s4',
    className: 'Class 12-A',
    subject: 'Chemistry',
    teacherName: 'Dr. Priya Nambiar',
    teacherRole: 'Senior Faculty',
    teacherGroup: 'Senior',
    topic: 'Electrochemistry & Nernst Equation',
    targetWeek: 'Week 11 (Late April)',
    targetCompletionDate: '2026-04-22',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 14,
    periodsCompleted: 14,
    lastUpdatedBy: 'Dr. Priya Nambiar',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Syllabus on track as per board blueprint.'
  },
  {
    id: 'lp-s5',
    className: 'Class 11-B',
    subject: 'Accountancy',
    teacherName: 'SANJEEV AGARWAL',
    teacherRole: 'PGT Commerce',
    teacherGroup: 'Senior',
    topic: 'Journal Entries, Ledger Posting & Trial Balance',
    targetWeek: 'Week 12 (May Week 1)',
    targetCompletionDate: '2026-05-04',
    status: 'COMPLETED_ON_TIME',
    periodsRequired: 12,
    periodsCompleted: 12,
    lastUpdatedBy: 'SANJEEV AGARWAL',
    lastUpdatedAt: new Date().toISOString(),
    remarks: 'Practice set solved on whiteboard.'
  }
];

const INITIAL_ALERTS: PrincipalTeacherAlert[] = [
  {
    id: 'alt-1',
    lessonPlanId: 'lp-102',
    teacherName: 'POONAM SINGH',
    className: 'Class 10-A',
    subject: 'Physics',
    sender: 'Principal',
    message: 'Come and meet in the office regarding Class 10 Physics syllabus delay.',
    timestamp: new Date().toISOString(),
    status: 'Sent'
  }
];

export function useLessonPlanStore() {
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LESSON_PLANS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading lesson plans:', e);
    }
    return INITIAL_LESSON_PLANS;
  });

  const [alerts, setAlerts] = useState<PrincipalTeacherAlert[]>(() => {
    try {
      const saved = localStorage.getItem(LESSON_ALERTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading lesson alerts:', e);
    }
    return INITIAL_ALERTS;
  });

  // Fetch & Sync Remote Supabase Data on Mount and Periodically
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteData() {
      // 1. Fetch lesson plans from Supabase
      const remotePlans = await fetchLessonPlansFromSupabase();
      if (remotePlans && remotePlans.length > 0 && isMounted) {
        setPlans((prev) => {
          const map: Record<string, LessonPlan> = {};
          prev.forEach((p) => { map[p.id] = p; });
          remotePlans.forEach((rp) => { map[rp.id] = rp; });
          return Object.values(map);
        });
      } else if (plans.length > 0 && isMounted) {
        // Initial push of seed data to Supabase if empty
        plans.forEach((p) => syncLessonPlanToSupabase(p));
      }

      // 2. Fetch lesson alerts from Supabase
      const remoteAlerts = await fetchLessonAlertsFromSupabase();
      if (remoteAlerts && remoteAlerts.length > 0 && isMounted) {
        setAlerts((prev) => {
          const map: Record<string, PrincipalTeacherAlert> = {};
          prev.forEach((a) => { map[a.id] = a; });
          remoteAlerts.forEach((ra) => { map[ra.id] = ra; });
          return Object.values(map);
        });
      } else if (alerts.length > 0 && isMounted) {
        alerts.forEach((a) => syncLessonAlertToSupabase(a));
      }
    }

    loadRemoteData();

    // Poll Supabase every 10 seconds for multi-device live sync
    const timer = setInterval(() => {
      loadRemoteData();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error('Error saving lesson plans:', e);
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(LESSON_ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error('Error saving lesson alerts:', e);
    }
  }, [alerts]);

  const updateLessonPlanStatus = async (
    id: string,
    status: 'COMPLETED_ON_TIME' | 'NOT_COMPLETED_ON_TIME' | 'IN_PROGRESS',
    periodsRequired: number,
    updatedBy: string,
    remarks?: string
  ) => {
    let updatedPlan: LessonPlan | null = null;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedPlan = {
            ...p,
            status,
            periodsRequired,
            periodsCompleted: status === 'COMPLETED_ON_TIME' ? periodsRequired : p.periodsCompleted,
            lastUpdatedBy: updatedBy,
            lastUpdatedAt: new Date().toISOString(),
            remarks: remarks !== undefined ? remarks : p.remarks
          };
          return updatedPlan;
        }
        return p;
      })
    );

    if (updatedPlan) {
      await syncLessonPlanToSupabase(updatedPlan);
    }
  };

  const addLessonPlan = async (newPlan: Omit<LessonPlan, 'id' | 'lastUpdatedAt'>) => {
    const created: LessonPlan = {
      ...newPlan,
      id: `lp-${Date.now()}`,
      lastUpdatedAt: new Date().toISOString()
    };
    setPlans((prev) => [created, ...prev]);
    await syncLessonPlanToSupabase(created);
  };

  const sendAlertToTeacher = async (
    lessonPlanId: string,
    teacherName: string,
    className: string,
    subject: string,
    message: string,
    sender: 'Principal' | 'Teacher' = 'Principal'
  ) => {
    const newAlert: PrincipalTeacherAlert = {
      id: `alt-${Date.now()}`,
      lessonPlanId,
      teacherName,
      className,
      subject,
      sender,
      message,
      timestamp: new Date().toISOString(),
      status: 'Sent'
    };
    setAlerts((prev) => [newAlert, ...prev]);
    await syncLessonAlertToSupabase(newAlert);
  };

  return {
    plans,
    alerts,
    updateLessonPlanStatus,
    addLessonPlan,
    sendAlertToTeacher
  };
}
