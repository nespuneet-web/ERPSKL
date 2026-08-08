export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const TIMETABLE_DAYS: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Period numbers 0 to 8 as per the screenshot
export const TIMETABLE_PERIODS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const SCHOOL_DEPARTMENTS = [
  'Mathematics Dept',
  'Science Dept',
  'English Dept',
  'Sanskrit & Hindi',
  'Commerce Dept',
  'Social Science',
  'Senior Secondary',
  'Primary Block',
  'Physical Education / Activity'
] as const;

export interface DepartmentTheme {
  badgeClass: string;
  dotClass: string;
  bgLightClass: string;
  borderClass: string;
  label: string;
}

export function getDepartmentTheme(deptName?: string): DepartmentTheme {
  const normalized = (deptName || '').toLowerCase().trim();

  if (normalized.includes('math')) {
    return {
      label: 'Mathematics Dept',
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800',
      dotClass: 'bg-indigo-500',
      bgLightClass: 'bg-indigo-50/70 dark:bg-indigo-950/20',
      borderClass: 'border-indigo-200 dark:border-indigo-800'
    };
  }

  if (normalized.includes('sci') || normalized.includes('phy') || normalized.includes('chem') || normalized.includes('bio')) {
    return {
      label: 'Science Dept',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
      bgLightClass: 'bg-emerald-50/70 dark:bg-emerald-950/20',
      borderClass: 'border-emerald-200 dark:border-emerald-800'
    };
  }

  if (normalized.includes('eng')) {
    return {
      label: 'English Dept',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800',
      dotClass: 'bg-purple-500',
      bgLightClass: 'bg-purple-50/70 dark:bg-purple-950/20',
      borderClass: 'border-purple-200 dark:border-purple-800'
    };
  }

  if (normalized.includes('hindi') || normalized.includes('sanskrit') || normalized.includes('san') || normalized.includes('hin')) {
    return {
      label: 'Sanskrit & Hindi',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800',
      dotClass: 'bg-rose-500',
      bgLightClass: 'bg-rose-50/70 dark:bg-rose-950/20',
      borderClass: 'border-rose-200 dark:border-rose-800'
    };
  }

  if (normalized.includes('comm') || normalized.includes('acc') || normalized.includes('eco') || normalized.includes('bus')) {
    return {
      label: 'Commerce Dept',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
      dotClass: 'bg-amber-500',
      bgLightClass: 'bg-amber-50/70 dark:bg-amber-950/20',
      borderClass: 'border-amber-200 dark:border-amber-800'
    };
  }

  if (normalized.includes('social') || normalized.includes('sst') || normalized.includes('hist') || normalized.includes('geo')) {
    return {
      label: 'Social Science',
      badgeClass: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-800',
      dotClass: 'bg-teal-500',
      bgLightClass: 'bg-teal-50/70 dark:bg-teal-950/20',
      borderClass: 'border-teal-200 dark:border-teal-800'
    };
  }

  if (normalized.includes('prim') || normalized.includes('block')) {
    return {
      label: 'Primary Block',
      badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-800',
      dotClass: 'bg-sky-500',
      bgLightClass: 'bg-sky-50/70 dark:bg-sky-950/20',
      borderClass: 'border-sky-200 dark:border-sky-800'
    };
  }

  if (normalized.includes('sec') || normalized.includes('sen')) {
    return {
      label: 'Senior Secondary',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800',
      dotClass: 'bg-blue-500',
      bgLightClass: 'bg-blue-50/70 dark:bg-blue-950/20',
      borderClass: 'border-blue-200 dark:border-blue-800'
    };
  }

  if (normalized.includes('phys') || normalized.includes('sport') || normalized.includes('act') || normalized.includes('pe')) {
    return {
      label: 'Physical Education / Activity',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-800',
      dotClass: 'bg-orange-500',
      bgLightClass: 'bg-orange-50/70 dark:bg-orange-950/20',
      borderClass: 'border-orange-200 dark:border-orange-800'
    };
  }

  // Fallback for custom or general faculty
  return {
    label: deptName || 'Faculty Member',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-500',
    bgLightClass: 'bg-slate-50 dark:bg-slate-900',
    borderClass: 'border-slate-200 dark:border-slate-800'
  };
}

export function getTimeSlotForPeriod(periodNo: number): string {
  const slots: Record<number, string> = {
    0: '07:30 AM - 08:15 AM',
    1: '08:15 AM - 09:00 AM',
    2: '09:00 AM - 09:45 AM',
    3: '09:45 AM - 10:30 AM',
    4: '10:30 AM - 11:15 AM',
    5: '11:15 AM - 12:00 PM',
    6: '12:00 PM - 12:45 PM',
    7: '12:45 PM - 01:30 PM',
    8: '01:30 PM - 02:15 PM'
  };
  return slots[periodNo] || `Period #${periodNo}`;
}

export function inferDepartment(teacherName: string, schedule: Record<string, string> = {}): string {
  const name = teacherName.toUpperCase();
  if (name.includes('SHARMA') && name.includes('NAND')) return 'Sanskrit & Hindi';
  if (name.includes('MUKHERJEE') || name.includes('JAIN')) return 'Science Dept';
  if (name.includes('TIWARI') || name === 'M1') return 'Mathematics Dept';
  if (name.includes('CHAHAR')) return 'English Dept';
  if (name.includes('BANSAL')) return 'Commerce Dept';
  if (name.includes('MUKHARJI')) return 'Social Science';
  if (name.includes('KAUR')) return 'Primary Block';
  if (name.includes('SANTOSH') || name.includes('PE')) return 'Physical Education / Activity';
  if (name.includes('SINGH')) return 'Senior Secondary';

  const allVals = Object.values(schedule).join(' ').toUpperCase();
  if (allVals.includes('MATH')) return 'Mathematics Dept';
  if (allVals.includes('PHYSIC') || allVals.includes('CHEM') || allVals.includes('BIO') || allVals.includes('SCI')) return 'Science Dept';
  if (allVals.includes('HIN') || allVals.includes('SAN')) return 'Sanskrit & Hindi';
  if (allVals.includes('ENG')) return 'English Dept';
  if (allVals.includes('COMM') || allVals.includes('ACC')) return 'Commerce Dept';
  if (allVals.includes('SST') || allVals.includes('GEO') || allVals.includes('HIST')) return 'Social Science';

  return 'Senior Secondary';
}

export interface TeacherTimetableRecord {
  id: string;
  teacherName: string;
  department?: string;
  // Key format: "Day_Period", e.g., "Monday_0", "Monday_4" -> "XII A"
  schedule: Record<string, string>;
  lastUpdated?: string;
}

// Sample dataset accurately representing the Excel screenshot attached by the user
export const INITIAL_TEACHER_TIMETABLES: TeacherTimetableRecord[] = [
  {
    id: 'tt-ankur-kabra',
    teacherName: 'ANKUR KABRA',
    department: 'Mathematics Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'X A',
      'Monday_2': 'X B',
      'Tuesday_1': 'XI A',
      'Wednesday_3': 'XII A',
      'Thursday_2': 'X A',
      'Friday_1': 'XI B'
    }
  },
  {
    id: 'tt-1',
    teacherName: 'ANIL KUMAR SINGH',
    department: 'Senior Secondary',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_4': 'XII A',
      'Monday_6': 'XII A',
      'Tuesday_0': 'X A',
      'Wednesday_0': 'X A',
      'Wednesday_6': 'X A',
      'Thursday_0': 'X A',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_0': 'X A',
      'Saturday_4': 'XII A'
    }
  },
  {
    id: 'tt-2',
    teacherName: 'M1',
    department: 'Mathematics Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'X C',
      'Monday_2': 'X A',
      'Monday_3': 'XI A',
      'Monday_4': 'XI B',
      'Monday_5': 'XI C',
      'Monday_6': 'XI D',
      'Tuesday_1': 'IX A',
      'Tuesday_2': 'IX C',
      'Tuesday_5': 'XI A',
      'Wednesday_1': 'X A',
      'Wednesday_2': 'XI B',
      'Wednesday_3': 'XI C',
      'Wednesday_5': 'X A',
      'Thursday_2': 'XI A',
      'Thursday_3': 'XI C',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_1': 'X C',
      'Friday_2': 'X A',
      'Friday_3': 'IX C',
      'Friday_5': 'X B',
      'Friday_6': 'IX D',
      'Saturday_2': 'IX A',
      'Saturday_3': 'IX B',
      'Saturday_4': 'IX C / IX D'
    }
  },
  {
    id: 'tt-3',
    teacherName: 'RAJAT JAIN',
    department: 'Science Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'X B',
      'Monday_2': 'V A',
      'Monday_3': 'IX B',
      'Monday_4': 'IX C',
      'Monday_6': 'VI C',
      'Monday_7': 'VI C',
      'Tuesday_1': 'VI C',
      'Tuesday_2': 'IX B',
      'Tuesday_3': 'V A',
      'Wednesday_2': 'X B',
      'Wednesday_5': 'VI C',
      'Thursday_2': 'VI A',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_1': 'X B',
      'Friday_2': 'V C',
      'Friday_4': 'X I',
      'Friday_5': 'VI A',
      'Saturday_1': 'V A',
      'Saturday_2': 'VI C',
      'Saturday_4': 'IX A / IX B / IX C / IX D'
    }
  },
  {
    id: 'tt-4',
    teacherName: 'PRATEEK BANSAL',
    department: 'Commerce Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'X A',
      'Monday_3': 'IX B',
      'Monday_4': 'VI B',
      'Monday_6': 'V A',
      'Tuesday_1': 'VI A',
      'Tuesday_2': 'X A',
      'Tuesday_4': 'VI B',
      'Tuesday_5': 'I A',
      'Wednesday_1': 'X A',
      'Wednesday_4': 'IX B',
      'Wednesday_5': 'VI A',
      'Thursday_2': 'VI A',
      'Thursday_4': 'V B',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_1': 'X A',
      'Friday_4': 'X A',
      'Friday_5': 'I B',
      'Saturday_1': 'V B',
      'Saturday_4': 'IX A / IX B / IX C / IX D',
      'Saturday_6': 'V A'
    }
  },
  {
    id: 'tt-5',
    teacherName: 'ABHISHEK MUKHARJI',
    department: 'Social Science',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_0': 'VI B',
      'Monday_3': 'IX A',
      'Monday_5': 'VI A',
      'Monday_6': 'V A',
      'Monday_7': 'V B',
      'Tuesday_0': 'VI B',
      'Tuesday_2': 'IX B',
      'Tuesday_4': 'VI A',
      'Tuesday_6': 'V A',
      'Wednesday_2': 'V A',
      'Wednesday_3': 'I B',
      'Wednesday_5': 'VI A',
      'Wednesday_6': 'I B',
      'Thursday_1': 'V A',
      'Thursday_5': 'V B',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_1': 'IX A',
      'Friday_2': 'V B',
      'Friday_4': 'V A',
      'Friday_5': 'I B',
      'Saturday_0': 'VI B',
      'Saturday_1': 'V A',
      'Saturday_2': 'VI A',
      'Saturday_4': 'IX A / IX B / IX C / IX D',
      'Saturday_5': 'V B'
    }
  },
  {
    id: 'tt-6',
    teacherName: 'AVNEET KAUR',
    department: 'Primary Block',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_2': 'IV',
      'Monday_4': 'IV',
      'Tuesday_1': 'IV',
      'Tuesday_5': 'IV',
      'Wednesday_1': 'IV',
      'Wednesday_5': 'VI',
      'Thursday_2': 'IV',
      'Thursday_4': 'IV',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_5': 'IV',
      'Friday_6': 'V',
      'Saturday_2': 'IV',
      'Saturday_4': 'IV C'
    }
  },
  {
    id: 'tt-7',
    teacherName: 'SHRUTI CHAHAR',
    department: 'English Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_2': 'VI B',
      'Monday_3': 'VI C',
      'Monday_4': 'VI C',
      'Monday_5': 'V C',
      'Tuesday_1': 'VI C',
      'Tuesday_3': 'VI B',
      'Wednesday_1': 'VI B',
      'Wednesday_2': 'VI C',
      'Wednesday_3': 'V C',
      'Thursday_2': 'VI C',
      'Thursday_5': 'VI B',
      'Thursday_6': 'FACULTY CLUB',
      'Friday_2': 'II C',
      'Friday_3': 'VI B',
      'Friday_4': 'VI C',
      'Saturday_1': 'VI C',
      'Saturday_2': 'VI B'
    }
  },
  {
    id: 'tt-8',
    teacherName: 'NAND KISHORE SHARMA',
    department: 'Sanskrit & Hindi',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'IX C',
      'Monday_2': 'IX A',
      'Monday_3': 'IX D',
      'Monday_4': 'IX C',
      'Tuesday_0': 'X B',
      'Tuesday_1': 'IX A',
      'Tuesday_2': 'IX D',
      'Tuesday_3': 'IX C',
      'Wednesday_0': 'X B',
      'Wednesday_1': 'IX AC',
      'Wednesday_3': 'X B',
      'Wednesday_4': 'X A',
      'Thursday_0': 'X B',
      'Thursday_1': 'IX B',
      'Thursday_2': 'IX A',
      'Thursday_3': 'IX C',
      'Thursday_4': 'IX D',
      'Friday_1': 'IX C',
      'Friday_2': 'IX B',
      'Friday_3': 'IX D',
      'Friday_4': 'IX A',
      'Saturday_1': 'IX A',
      'Saturday_2': 'IX X C',
      'Saturday_3': 'A D'
    }
  },
  {
    id: 'tt-9',
    teacherName: 'EKTA MUKHERJEE',
    department: 'Science Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_0': 'V I',
      'Monday_1': 'V I',
      'Monday_2': 'V C',
      'Monday_3': 'V I A',
      'Monday_4': 'V I B',
      'Tuesday_1': 'FACULTY CLUB',
      'Tuesday_2': 'V II A',
      'Tuesday_3': 'V II B',
      'Wednesday_1': 'V III A',
      'Wednesday_2': 'V II B',
      'Wednesday_4': 'V II C',
      'Wednesday_5': 'I C A',
      'Thursday_3': 'V II A',
      'Thursday_4': 'V II C',
      'Friday_1': 'V II A',
      'Friday_2': 'V II B C',
      'Friday_4': 'A I C',
      'Saturday_1': 'V II A',
      'Saturday_2': 'V II B',
      'Saturday_4': 'V C'
    }
  },
  {
    id: 'tt-10',
    teacherName: 'DHARMESH TIWARI',
    department: 'Mathematics Dept',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'X C',
      'Monday_3': 'X I A',
      'Monday_4': 'X I C',
      'Tuesday_0': 'IX C',
      'Tuesday_1': 'FACULTY CLUB',
      'Tuesday_2': 'IX H',
      'Tuesday_3': 'I A C',
      'Tuesday_4': 'I B D',
      'Wednesday_0': 'IX C',
      'Wednesday_1': 'X C',
      'Wednesday_3': 'I X D C',
      'Wednesday_4': 'I X C B',
      'Wednesday_5': 'I X C',
      'Thursday_3': 'IX C',
      'Thursday_4': 'X C',
      'Friday_2': 'I X B D',
      'Friday_3': 'IX C',
      'Saturday_1': 'I X A C',
      'Saturday_2': 'I X I I B',
      'Saturday_3': 'X C',
      'Saturday_6': 'I B'
    }
  },
  {
    id: 'tt-11',
    teacherName: 'SANTOSH SHARMA',
    department: 'Physical Education / Activity',
    lastUpdated: '2026-03-01 10:00 AM',
    schedule: {
      'Monday_1': 'BREAK DUTY',
      'Monday_2': 'BREAK DUTY',
      'Monday_3': 'BREAK DUTY',
      'Monday_4': 'BREAK DUTY',
      'Monday_5': 'BREAK DUTY',
      'Tuesday_1': 'BREAK DUTY',
      'Tuesday_2': 'BREAK DUTY',
      'Tuesday_3': 'BREAK DUTY',
      'Tuesday_4': 'BREAK DUTY',
      'Wednesday_1': 'BREAK DUTY',
      'Wednesday_2': 'BREAK DUTY',
      'Wednesday_3': 'BREAK DUTY',
      'Thursday_1': 'BREAK DUTY',
      'Thursday_2': 'BREAK DUTY',
      'Thursday_3': 'BREAK DUTY',
      'Friday_1': 'BREAK DUTY',
      'Friday_2': 'BREAK DUTY',
      'Friday_3': 'BREAK DUTY',
      'Saturday_1': 'BREAK DUTY',
      'Saturday_2': 'BREAK DUTY',
      'Saturday_4': 'BREAK DUTY'
    }
  }
];
