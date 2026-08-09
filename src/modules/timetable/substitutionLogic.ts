import { TeacherTimetableRecord, TimetableDay, getDepartmentTheme, TIMETABLE_PERIODS } from './timetableData';

export type SubstitutionConstraintMode = 
  | 'same_dept_first'       // Same Dept -> Sports -> All
  | 'same_dept_strict'      // Same Dept Only
  | 'subject_plus_sports'   // Same Dept OR Physical Education
  | 'level_matched_first'   // Junior-Junior, Senior-Senior + Dept First
  | 'all_available';        // Any free teacher

export type GradeLevel = 'Junior' | 'Senior' | 'General';

/**
 * Determine if a class string is Junior (Class I-VI) or Senior (Class VII-XII)
 */
export function getClassGradeLevel(classStr?: string): GradeLevel {
  if (!classStr) return 'General';
  const str = classStr.toUpperCase().trim();

  // Roman numerals and class names for Primary/Middle (Junior)
  // Check for Primary, I, II, III, IV, V, VI (but not IX, X, XI, XII)
  if (
    str.includes('PRIMARY') ||
    str.includes('CLASS 1') || str.includes('CLASS 2') || str.includes('CLASS 3') || 
    str.includes('CLASS 4') || str.includes('CLASS 5') || str.includes('CLASS 6')
  ) {
    return 'Junior';
  }

  // Exact or word boundary checks for roman numerals I to VI vs IX to XII
  const words = str.split(/[\s\/-]+/);
  for (const w of words) {
    if (['IX', 'X', 'XI', 'XII', '7', '8', '9', '10', '11', '12'].includes(w)) {
      return 'Senior';
    }
    if (['I', 'II', 'III', 'IV', 'V', 'VI', '1', '2', '3', '4', '5', '6'].includes(w)) {
      return 'Junior';
    }
  }

  if (str.includes('SENIOR') || str.includes('FACULTY')) return 'Senior';

  return 'General';
}

/**
 * Determine if a teacher is Junior level or Senior level
 */
export function getTeacherGradeLevel(teacher: TeacherTimetableRecord): GradeLevel {
  const dept = (teacher.department || '').toLowerCase();
  if (dept.includes('primary')) return 'Junior';
  if (dept.includes('senior') || dept.includes('commerce') || dept.includes('science')) return 'Senior';

  // Check majority of classes taught in schedule
  let juniorCount = 0;
  let seniorCount = 0;
  Object.values(teacher.schedule).forEach((cls) => {
    const lvl = getClassGradeLevel(cls);
    if (lvl === 'Junior') juniorCount++;
    if (lvl === 'Senior') seniorCount++;
  });

  if (juniorCount > seniorCount) return 'Junior';
  if (seniorCount > juniorCount) return 'Senior';
  return 'General';
}

export interface CandidateTeacherScore {
  teacher: TeacherTimetableRecord;
  score: number;
  isSameDept: boolean;
  isSportsTeacher: boolean;
  isLevelMatched: boolean;
  isLevelMatch: boolean;
  freePeriodsCount: number;
  gradeLevel: GradeLevel;
  deptTheme: ReturnType<typeof getDepartmentTheme>;
  reasons: string[];
}

export interface SubstitutionExclusionRules {
  excludeCoordinators?: boolean;
  excludedDeptList?: string[];
  excludedTeacherList?: string[];
  excludedPeriodList?: number[];
}

/**
 * Ranks and scores all available free teachers for a specific period on a specific day
 */
export function rankCandidateSubstitutes(
  periodNo: number,
  day: TimetableDay,
  absentTeacher: TeacherTimetableRecord,
  targetClass: string,
  allTeachers: TeacherTimetableRecord[],
  constraintMode: SubstitutionConstraintMode = 'same_dept_first',
  roundDutyTeacherNamesForPeriod?: Set<string>,
  exclusionRules?: SubstitutionExclusionRules
): CandidateTeacherScore[] {
  // Check if period is in excluded periods list
  if (exclusionRules?.excludedPeriodList && exclusionRules.excludedPeriodList.includes(periodNo)) {
    return [];
  }

  const absentDept = (absentTeacher.department || 'Senior Secondary').toLowerCase();
  const targetClassLevel = getClassGradeLevel(targetClass);

  // 1. Filter teachers who are FREE in this period on this day AND NOT ON ROUND DUTY
  const freeTeachers = allTeachers.filter((t) => {
    if (t.teacherName === absentTeacher.teacherName) return false;
    // Check if teacher is assigned to Round Duty in this period
    if (roundDutyTeacherNamesForPeriod && roundDutyTeacherNamesForPeriod.has(t.teacherName)) {
      return false; // Exclude teachers on Round Duty!
    }

    // Check exclusion rules: Academic Coordinator
    if (exclusionRules?.excludeCoordinators) {
      const tUpper = t.teacherName.toUpperCase();
      const dUpper = (t.department || '').toUpperCase();
      if (tUpper.includes('ANKUR KABRA') || tUpper.includes('COORDINATOR') || dUpper.includes('COORDINATOR')) {
        return false;
      }
    }

    // Check exclusion rules: Excluded Departments
    if (exclusionRules?.excludedDeptList && exclusionRules.excludedDeptList.includes(t.department || '')) {
      return false;
    }

    // Check exclusion rules: Excluded Teachers
    if (exclusionRules?.excludedTeacherList && exclusionRules.excludedTeacherList.includes(t.teacherName)) {
      return false;
    }

    const slotVal = t.schedule[`${day}_${periodNo}`];
    return !slotVal || slotVal.trim() === ''; // Must be vacant/free
  });

  // 2. Score and filter candidates according to constraint mode
  const scoredCandidates: CandidateTeacherScore[] = [];

  for (const t of freeTeachers) {
    const candDept = (t.department || 'Senior Secondary').toLowerCase();
    const isSameDept = candDept === absentDept || getDepartmentTheme(t.department).label === getDepartmentTheme(absentTeacher.department).label;
    const isSportsTeacher = candDept.includes('phys') || candDept.includes('sport') || candDept.includes('pe');
    const candLevel = getTeacherGradeLevel(t);
    const isLevelMatched = targetClassLevel !== 'General' && candLevel === targetClassLevel;

    // Calculate free periods count today
    const freePeriodsCount = TIMETABLE_PERIODS.filter((p) => !t.schedule[`${day}_${p}`]).length;

    // Check constraint filter
    if (constraintMode === 'same_dept_strict' && !isSameDept) {
      continue;
    }
    if (constraintMode === 'subject_plus_sports' && !isSameDept && !isSportsTeacher) {
      continue;
    }

    // Calculate priority score
    let score = freePeriodsCount * 10; // Base score on workload availability
    const reasons: string[] = [];

    if (isSameDept) {
      score += 200;
      reasons.push('⭐ Same Department Subject Match (+200)');
    }

    if (isLevelMatched) {
      score += 100;
      reasons.push(`🎓 Grade Level Match (${targetClassLevel} Teacher -> ${targetClassLevel} Class) (+100)`);
    }

    if (isSportsTeacher && !isSameDept) {
      score += 40;
      reasons.push('⚽ Physical Education / Activity Teacher (+40)');
    }

    scoredCandidates.push({
      teacher: t,
      score,
      isSameDept,
      isSportsTeacher,
      isLevelMatched,
      isLevelMatch: isLevelMatched,
      freePeriodsCount,
      gradeLevel: candLevel,
      deptTheme: getDepartmentTheme(t.department),
      reasons
    });
  }

  // Sort descending by score
  return scoredCandidates.sort((a, b) => b.score - a.score);
}

/**
 * Run Auto-Substitution for all scheduled periods of an absent teacher on a selected day
 */
export function runAutoSubstitutionForDay(
  day: TimetableDay,
  absentTeacher: TeacherTimetableRecord,
  scheduledPeriods: Array<{ periodNo: number; timeSlot: string; classSec: string; subject: string }>,
  allTeachers: TeacherTimetableRecord[],
  constraintMode: SubstitutionConstraintMode = 'same_dept_first',
  getRoundDutyTeachersForPeriod?: (periodNo: number) => Set<string>,
  exclusionRules?: SubstitutionExclusionRules
): { [periodNo: number]: string } {
  const result: { [periodNo: number]: string } = {};
  const assignedTeachersInSession = new Set<string>();

  for (const slot of scheduledPeriods) {
    const roundDutySet = getRoundDutyTeachersForPeriod ? getRoundDutyTeachersForPeriod(slot.periodNo) : undefined;
    const candidates = rankCandidateSubstitutes(
      slot.periodNo,
      day,
      absentTeacher,
      slot.classSec,
      allTeachers,
      constraintMode,
      roundDutySet,
      exclusionRules
    );

    // Pick top candidate not already heavily loaded or assigned in adjacent slots if possible
    let chosen: CandidateTeacherScore | undefined = candidates.find((c) => !assignedTeachersInSession.has(c.teacher.teacherName));
    
    // Fallback to absolute top candidate if all candidates have been used
    if (!chosen && candidates.length > 0) {
      chosen = candidates[0];
    }

    if (chosen) {
      result[slot.periodNo] = chosen.teacher.teacherName;
      assignedTeachersInSession.add(chosen.teacher.teacherName);
    }
  }

  return result;
}
