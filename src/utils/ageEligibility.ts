/**
 * Age Eligibility Utility as per ERP Requirements:
 * Calculates age as of 1 April of the Admission Year (Default: 2026-04-01)
 *
 * Age Criteria Matrix:
 * - Class 1: Minimum 6 years
 * - Upper KG (UKG): Minimum 5 years
 * - LKG: Minimum 4 years
 * - Nursery: Minimum 3 years
 * - Playgroup (PG): Minimum 2 years
 * - Higher Classes (Class 2..12): 5 + Class Number (e.g., Class 2 = 7 yrs, Class 10 = 15 yrs)
 */

export interface AgeCriteriaDetail {
  minAgeYears: number;
  maxAgeYears: number;
  recommendedClass: string;
}

export const AGE_CRITERIA_MAP: Record<string, AgeCriteriaDetail> = {
  'Playgroup': { minAgeYears: 2, maxAgeYears: 3, recommendedClass: 'Playgroup' },
  'Nursery': { minAgeYears: 3, maxAgeYears: 4, recommendedClass: 'Nursery' },
  'LKG': { minAgeYears: 4, maxAgeYears: 5, recommendedClass: 'LKG' },
  'UKG': { minAgeYears: 5, maxAgeYears: 6, recommendedClass: 'UKG' },
  'Class 1': { minAgeYears: 6, maxAgeYears: 7, recommendedClass: 'Class 1' },
  'Class 2': { minAgeYears: 7, maxAgeYears: 8, recommendedClass: 'Class 2' },
  'Class 3': { minAgeYears: 8, maxAgeYears: 9, recommendedClass: 'Class 3' },
  'Class 4': { minAgeYears: 9, maxAgeYears: 10, recommendedClass: 'Class 4' },
  'Class 5': { minAgeYears: 10, maxAgeYears: 11, recommendedClass: 'Class 5' },
  'Class 6': { minAgeYears: 11, maxAgeYears: 12, recommendedClass: 'Class 6' },
  'Class 7': { minAgeYears: 12, maxAgeYears: 13, recommendedClass: 'Class 7' },
  'Class 8': { minAgeYears: 13, maxAgeYears: 14, recommendedClass: 'Class 8' },
  'Class 9': { minAgeYears: 14, maxAgeYears: 15, recommendedClass: 'Class 9' },
  'Class 10': { minAgeYears: 15, maxAgeYears: 16, recommendedClass: 'Class 10' },
  'Class 11': { minAgeYears: 16, maxAgeYears: 17, recommendedClass: 'Class 11' },
  'Class 12': { minAgeYears: 17, maxAgeYears: 18, recommendedClass: 'Class 12' }
};

export interface AgeEligibilityResult {
  isEligible: boolean;
  calculatedYears: number;
  calculatedMonths: number;
  minRequiredAgeYears: number;
  referenceDateStr: string;
  formattedCalculatedAge: string;
  message: string;
}

export function calculateAgeOnReferenceDate(
  dobStr: string,
  referenceDateStr: string = '2026-04-01'
): { years: number; months: number; totalYearsDecimal: number } {
  if (!dobStr) return { years: 0, months: 0, totalYearsDecimal: 0 };
  const dob = new Date(dobStr);
  const ref = new Date(referenceDateStr);

  if (isNaN(dob.getTime()) || isNaN(ref.getTime())) {
    return { years: 0, months: 0, totalYearsDecimal: 0 };
  }

  let years = ref.getFullYear() - dob.getFullYear();
  let months = ref.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && ref.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }

  const totalYearsDecimal = years + months / 12;
  return { years, months, totalYearsDecimal };
}

export function getMinRequiredAgeForClass(className: string): number {
  if (!className) return 5;
  const norm = className.trim();

  if (norm === 'PG' || norm.toLowerCase().includes('playgroup') || norm === 'Play Group') return 2;
  if (norm === 'Nursery' || norm.toLowerCase().includes('nursery')) return 3;
  if (norm === 'LKG' || norm.toLowerCase().includes('lkg') || norm.toLowerCase().includes('lower kg')) return 4;
  if (norm === 'UKG' || norm === 'KG' || norm.toLowerCase().includes('ukg') || norm.toLowerCase().includes('upper kg')) return 5;
  if (norm === 'Class 1' || norm === 'Grade 1' || norm.startsWith('Class 1-') || norm.startsWith('Class 1 ')) return 6;

  // Check for Class N / Grade N
  const match = norm.match(/(?:Class|Grade)\s*(\d+)/i);
  if (match) {
    const classNum = parseInt(match[1], 10);
    return 5 + classNum; // Class 1 = 6, Class 2 = 7, etc.
  }

  return 5;
}

export function checkAgeEligibility(
  dobStr: string,
  className: string,
  referenceDateStr: string = '2026-04-01'
): AgeEligibilityResult {
  const { years, months, totalYearsDecimal } = calculateAgeOnReferenceDate(dobStr, referenceDateStr);
  const minRequiredAgeYears = getMinRequiredAgeForClass(className);
  
  // Allow a standard grace period of up to 1 month (0.08 years)
  const isEligible = totalYearsDecimal >= (minRequiredAgeYears - 0.08);

  const formattedCalculatedAge = `${years} yrs ${months} mos`;

  const message = isEligible
    ? `Child is ${formattedCalculatedAge} old as of 1 April 2026 (Meets min age of ${minRequiredAgeYears} yrs for ${className}).`
    : `The child is not eligible for the selected class based on the age criteria. (${formattedCalculatedAge} vs ${minRequiredAgeYears} yrs required as of 1 April 2026)`;

  return {
    isEligible,
    calculatedYears: years,
    calculatedMonths: months,
    minRequiredAgeYears,
    referenceDateStr,
    formattedCalculatedAge,
    message
  };
}
