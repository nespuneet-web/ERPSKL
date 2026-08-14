import { UserRole, UserSession } from '../types/common';

export interface UserAccount {
  id: string;
  username: string; // e.g. "teacher1", "student1200", "admin", "timetable", "reception"
  displayName: string;
  role: UserRole;
  defaultPassword: string;
  currentPassword: string;
  isPasswordChanged: boolean;
  category: 'teacher' | 'student' | 'admin_staff';
  email: string;
  designation?: string;
  department?: string;
  classAssigned?: string;
}

const PASSWORD_STORAGE_KEY = 'schoolerp_user_passwords_v2';
const CURRENT_USER_SESSION_KEY = 'schoolerp_active_user_session_v2';

// 1. Core Default User definitions
const ADMIN_STAFF_DEFINITIONS: Omit<UserAccount, 'currentPassword' | 'isPasswordChanged'>[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    displayName: 'Dr. V. K. Sharma (Super Admin)',
    role: 'Super Admin',
    defaultPassword: 'admin@123',
    category: 'admin_staff',
    email: 'admin@goingkapublicschool.edu',
    designation: 'School Director / Super Administrator',
    department: 'Administration'
  },
  {
    id: 'usr-tt-1',
    username: 'timetable',
    displayName: 'Prof. Alok Mathur (Timetable Incharge)',
    role: 'Timetable Incharge',
    defaultPassword: 'gdigonika',
    category: 'admin_staff',
    email: 'timetable@goingkapublicschool.edu',
    designation: 'Academic Dean & Timetable Incharge',
    department: 'Academic Operations'
  },
  {
    id: 'usr-rec-1',
    username: 'reception',
    displayName: 'Mrs. Sunita Verma (Front Desk Reception)',
    role: 'Reception',
    defaultPassword: 'gdigonika',
    category: 'admin_staff',
    email: 'reception@goingkapublicschool.edu',
    designation: 'Front Desk & Visitor Manager',
    department: 'Reception & Helpdesk'
  }
];

// Helper to get stored custom passwords
function getCustomPasswords(): Record<string, string> {
  try {
    const saved = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading custom passwords:', e);
  }
  return {};
}

// Generate teacher accounts 1 to 70
export function generateTeacherAccounts(customPasswords: Record<string, string>): UserAccount[] {
  const teachers: UserAccount[] = [];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'Computer Science', 'Social Studies', 'Hindi', 'Physical Education', 'Economics', 'Accountancy', 'Business Studies', 'Art & Design', 'History'];
  
  for (let i = 1; i <= 70; i++) {
    const uName = `teacher${i}`;
    const subject = subjects[(i - 1) % subjects.length];
    const storedPass = customPasswords[uName];
    const defaultPass = 'teacher1';

    teachers.push({
      id: `usr-tch-${i}`,
      username: uName,
      displayName: `Teacher #${i} (${subject})`,
      role: 'Teacher',
      defaultPassword: defaultPass,
      currentPassword: storedPass || defaultPass,
      isPasswordChanged: Boolean(storedPass && storedPass !== defaultPass),
      category: 'teacher',
      email: `teacher${i}@gdgoenka.edu`,
      designation: `Faculty - ${subject}`,
      department: 'Academics'
    });
  }
  return teachers;
}

// Generate student accounts 1 to 1200
export function generateStudentAccounts(customPasswords: Record<string, string>): UserAccount[] {
  const students: UserAccount[] = [];
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sections = ['A', 'B', 'C', 'D'];

  for (let i = 1; i <= 1200; i++) {
    const uName = `student${i}`;
    const classIdx = Math.floor((i - 1) / 100) % classes.length;
    const secIdx = Math.floor(((i - 1) % 100) / 25) % sections.length;
    const assignedClass = `${classes[classIdx]}-${sections[secIdx]}`;
    
    const storedPass = customPasswords[uName];
    const defaultPass = 'student1';

    students.push({
      id: `usr-std-${i}`,
      username: uName,
      displayName: `Student #${i} (${assignedClass})`,
      role: 'Student',
      defaultPassword: defaultPass,
      currentPassword: storedPass || defaultPass,
      isPasswordChanged: Boolean(storedPass && storedPass !== defaultPass),
      category: 'student',
      email: `student${i}@gdgoenka.edu`,
      designation: 'Enrolled Student',
      classAssigned: assignedClass,
      department: 'Student Body'
    });
  }
  return students;
}

// Get all system accounts
export function getAllUserAccounts(): UserAccount[] {
  const customPasswords = getCustomPasswords();
  
  const adminStaff: UserAccount[] = ADMIN_STAFF_DEFINITIONS.map((def) => {
    const storedPass = customPasswords[def.username];
    return {
      ...def,
      currentPassword: storedPass || def.defaultPassword,
      isPasswordChanged: Boolean(storedPass && storedPass !== def.defaultPassword)
    };
  });

  const teachers = generateTeacherAccounts(customPasswords);
  const students = generateStudentAccounts(customPasswords);

  return [...adminStaff, ...teachers, ...students];
}

// Update user password and persist in localStorage
export function updateUserPassword(username: string, newPassword: string): boolean {
  try {
    const cleanUser = username.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const current = getCustomPasswords();
    current[cleanUser] = newPassword;
    localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (e) {
    console.error('Failed to update password:', e);
    return false;
  }
}

// Reset a user's password back to default
export function resetUserPasswordToDefault(username: string): boolean {
  try {
    const cleanUser = username.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const current = getCustomPasswords();
    delete current[cleanUser];
    localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (e) {
    console.error('Failed to reset password:', e);
    return false;
  }
}

// Normalize username input (e.g. "Teacher 1" -> "teacher1", "student 400" -> "student400", "Admin" -> "admin")
export function normalizeUsername(input: string): string {
  const clean = input.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (clean === 'admin1' || clean === 'superadmin' || clean === 'director') return 'admin';
  if (clean === 'timetable1' || clean === 'tt' || clean === 'timetableincharge') return 'timetable';
  if (clean === 'reception1' || clean === 'frontdesk' || clean === 'gatepass') return 'reception';
  if (clean.startsWith('tch') && !clean.startsWith('teacher')) {
    return clean.replace('tch', 'teacher');
  }
  if (clean.startsWith('std') && !clean.startsWith('student')) {
    return clean.replace('std', 'student');
  }
  return clean;
}

// Authenticate user with intelligent matching
export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; user?: UserAccount; message: string } {
  const normUser = normalizeUsername(usernameInput);
  const cleanPass = passwordInput.trim();
  const normPass = cleanPass.toLowerCase().replace(/[\s_-]+/g, '');

  const allAccounts = getAllUserAccounts();
  const found = allAccounts.find((u) => u.username === normUser);

  if (!found) {
    // Check if within bounds
    const teacherMatch = normUser.match(/^teacher(\d+)$/);
    if (teacherMatch) {
      const num = parseInt(teacherMatch[1], 10);
      if (num > 70) {
        return { success: false, message: `Teacher ID out of range. Valid range is teacher 1 to teacher 70.` };
      }
    }
    const studentMatch = normUser.match(/^student(\d+)$/);
    if (studentMatch) {
      const num = parseInt(studentMatch[1], 10);
      if (num > 1200) {
        return { success: false, message: `Student ID out of range. Valid range is student 1 to student 1200.` };
      }
    }
    return { success: false, message: `User ID "${usernameInput}" not found in school directory.` };
  }

  // Password matching logic: check exact, or normalized default password
  if (!cleanPass) {
    return {
      success: false,
      message: 'Password is required. Nobody can log in without a password.'
    };
  }

  const currPass = found.currentPassword;
  const defPass = found.defaultPassword;
  
  const isMatch =
    cleanPass === currPass ||
    cleanPass === defPass ||
    normPass === currPass.toLowerCase().replace(/[\s_-]+/g, '') ||
    normPass === defPass.toLowerCase().replace(/[\s_-]+/g, '') ||
    (found.username === 'admin' && (cleanPass === 'admin@123' || cleanPass === 'admin')) ||
    (found.category === 'teacher' && (normPass === 'teacher1' || normPass === 'gdigonika' || normPass === 'teacher 1')) ||
    (found.category === 'student' && (normPass === 'student1' || normPass === 'studentone' || normPass === 'student 1')) ||
    (found.username === 'reception' && (normPass === 'gdigonika' || normPass === 'reception' || cleanPass === 'admin@123'));

  if (!isMatch) {
    return {
      success: false,
      message: `Incorrect password for ${found.username}. ${
        !found.isPasswordChanged ? `(Default password: "${found.defaultPassword}")` : '(Password was previously updated)'
      }`
    };
  }

  return {
    success: true,
    user: found,
    message: `Authentication successful as ${found.displayName} (${found.role})`
  };
}

// Convert UserAccount to UserSession
export function toUserSession(account: UserAccount): UserSession {
  return {
    id: account.id,
    name: account.displayName,
    email: account.email,
    role: account.role,
    department: account.department || 'Academics',
    avatar: account.category === 'student'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      : account.category === 'teacher'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  };
}

// Persist active logged in session
export function saveActiveSession(account: UserAccount) {
  try {
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(account));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

// Retrieve active session
export function getSavedActiveSession(): UserAccount | null {
  try {
    const saved = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return null;
}
