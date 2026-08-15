import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession, AcademicSession, SystemNotification, AuditLog } from '../types/common';
import { UserAccount, toUserSession, saveActiveSession, getSavedActiveSession, getAllUserAccounts, getUserPermissionOverrides, getUserSubSectionOverrides } from '../lib/userManager';
import { DEFAULT_ROLE_SUBSECTION_PERMISSIONS, ALL_SUBSECTION_IDS } from '../lib/permissionRegistry';

export const ALL_MODULE_IDS = [
  'sis',
  'admission',
  'examination',
  'attendance',
  'timetable',
  'lesson_plans',
  'fees',
  'staff',
  'interview',
  'reports',
  'transport',
  'library',
  'inventory',
  'hostel',
  'visitor',
  'supabase_cloud',
  'communication',
  'certificates',
  'idcards',
  'settings'
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Super Admin': [...ALL_MODULE_IDS],
  'School Admin': [...ALL_MODULE_IDS],
  'Principal': [...ALL_MODULE_IDS],
  'Vice Principal': [...ALL_MODULE_IDS],

  // Teachers have access strictly to: Student Info, Daily Attendance, Timetable (personal + assigned round duty), Examination (enter marks), Lesson Plans, Digital Noticeboard
  'Teacher': ['sis', 'attendance', 'timetable', 'examination', 'lesson_plans', 'communication'],
  'Class Teacher': ['sis', 'attendance', 'timetable', 'examination', 'lesson_plans', 'communication'],

  // Students have access strictly to the student portal: Profile/SIS, attendance, timetable, marks/admit card, library, digital noticeboard, smart ID card
  'Student': ['sis', 'attendance', 'timetable', 'examination', 'library', 'communication', 'idcards'],
  'Parent': ['sis', 'attendance', 'timetable', 'examination', 'fees', 'communication'],

  'Admission Team': ['admission', 'sis', 'communication'],
  'Accountant': ['fees', 'reports', 'communication'],
  'Account Department': ['fees', 'reports', 'communication'],
  'Timetable Incharge': ['timetable', 'staff', 'communication'],
  'Reception': ['visitor', 'communication'],
  'HR': ['staff', 'interview', 'communication'],
  'Interview Panel': ['staff', 'interview', 'communication'],
  'Examination Incharge': ['examination', 'sis', 'certificates', 'communication'],
  'Transport Department': ['transport', 'communication'],
  'Visitor': ['visitor', 'communication'],
  'Read-only Auditor': ['reports', 'sis', 'examination', 'attendance']
};

const PERMISSIONS_STORAGE_KEY = 'schoolerp_role_permissions_v3';
const SUBSECTION_PERMISSIONS_STORAGE_KEY = 'schoolerp_role_subsection_permissions_v1';

interface AuthContextType {
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  loginUser: (account: UserAccount) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  toggleViewMode: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  academicSessions: AcademicSession[];
  currentAcademicSession: AcademicSession;
  setCurrentAcademicSession: (session: AcademicSession) => void;
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLog[];
  logActivity: (action: string, module: string, details: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  quickSearchQuery: string;
  setQuickSearchQuery: (q: string) => void;

  // Role Module Permissions
  rolePermissions: Record<UserRole, string[]>;
  updateRolePermissions: (role: UserRole, allowedModules: string[]) => void;
  resetRolePermissions: () => void;
  isModuleAllowed: (moduleId: string, role?: UserRole) => boolean;
  getAllowedModules: (role?: UserRole) => string[];

  // Granular Sub-Section Permissions
  roleSubSectionPermissions: Record<UserRole, string[]>;
  updateRoleSubSectionPermissions: (role: UserRole, allowedSubSections: string[]) => void;
  resetRoleSubSectionPermissions: () => void;
  isSubSectionAllowed: (subSectionId: string, role?: UserRole) => boolean;
  getAllowedSubSections: (role?: UserRole) => string[];

  // Student specific edit permission controlled by Admin
  isStudentEditingAllowed: boolean;
  setStudentEditingAllowed: (allowed: boolean) => void;
}

const DEFAULT_USER: UserSession = {
  id: 'usr-admin-1',
  name: 'Dr. V. K. Sharma (Super Admin)',
  email: 'admin@gdgpsagra.edu',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  department: 'Administration'
};

const INITIAL_SESSIONS: AcademicSession[] = [
  { id: 'ses-1', name: '2025-2026', isCurrent: true, startDate: '2025-04-01', endDate: '2026-03-31' },
  { id: 'ses-2', name: '2024-2025', isCurrent: false, startDate: '2024-04-01', endDate: '2025-03-31' },
  { id: 'ses-3', name: '2026-2027', isCurrent: false, startDate: '2026-04-01', endDate: '2027-03-31' }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserSession>(() => {
    const saved = getSavedActiveSession();
    if (saved) {
      return toUserSession(saved);
    }
    return DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = getSavedActiveSession();
    return Boolean(saved);
  });

  const [viewMode, setViewModeState] = useState<'mobile' | 'desktop'>(() => {
    try {
      const saved = localStorage.getItem('goenka_erp_view_mode');
      if (saved === 'desktop' || saved === 'mobile') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'mobile'; // Default to Android mobile view as requested
  });

  const setViewMode = (mode: 'mobile' | 'desktop') => {
    setViewModeState(mode);
    try {
      localStorage.setItem('goenka_erp_view_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'mobile' ? 'desktop' : 'mobile');
  };

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const saved = getSavedActiveSession();
    if (saved) {
      return saved.role;
    }
    return 'Super Admin';
  });

  const [academicSessions] = useState<AcademicSession[]>(INITIAL_SESSIONS);
  const [currentAcademicSession, setCurrentAcademicSession] = useState<AcademicSession>(INITIAL_SESSIONS[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Teacher & Student User Accounts Ready',
      message: 'Teacher accounts (1-70) and Student accounts (1-1200) provisioned with default passwords.',
      type: 'success',
      timestamp: 'Just now',
      read: false,
      module: 'Auth'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      role: activeRole,
      action: 'SYSTEM_BOOTSTRAP',
      module: 'System',
      details: 'Modular School ERP Initialized with full user authentication matrix.'
    }
  ]);

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(() => {
    try {
      const saved = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
      }
    } catch (e) {
      console.error('Error loading role permissions:', e);
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [roleSubSectionPermissions, setRoleSubSectionPermissions] = useState<Record<UserRole, string[]>>(() => {
    try {
      const saved = localStorage.getItem(SUBSECTION_PERMISSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ROLE_SUBSECTION_PERMISSIONS, ...parsed };
      }
    } catch (e) {
      console.error('Error loading role sub-section permissions:', e);
    }
    return DEFAULT_ROLE_SUBSECTION_PERMISSIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(rolePermissions));
    } catch (e) {
      console.error('Error saving role permissions:', e);
    }
  }, [rolePermissions]);

  useEffect(() => {
    try {
      localStorage.setItem(SUBSECTION_PERMISSIONS_STORAGE_KEY, JSON.stringify(roleSubSectionPermissions));
    } catch (e) {
      console.error('Error saving role sub-section permissions:', e);
    }
  }, [roleSubSectionPermissions]);

  const loginUser = (account: UserAccount) => {
    const session = toUserSession(account);
    setCurrentUserState(session);
    setActiveRoleState(account.role);
    setIsAuthenticated(true);
    saveActiveSession(account);
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('schoolerp_active_user_session_v2');
    } catch (e) {
      console.error('Error clearing session:', e);
    }
    setCurrentUserState(DEFAULT_USER);
    setActiveRoleState('Super Admin');
  };

  const setCurrentUser = (user: UserSession) => {
    setCurrentUserState(user);
  };

  const updateRolePermissions = (role: UserRole, allowedModules: string[]) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: allowedModules
    }));
    logActivity('UPDATE_PERMISSIONS', 'Access Control', `Updated allowed modules for role "${role}" (${allowedModules.length} modules)`);
  };

  const resetRolePermissions = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
    logActivity('RESET_PERMISSIONS', 'Access Control', 'Reset all role permissions to factory defaults');
  };

  const updateRoleSubSectionPermissions = (role: UserRole, allowedSubSections: string[]) => {
    setRoleSubSectionPermissions((prev) => ({
      ...prev,
      [role]: allowedSubSections
    }));
    logActivity('UPDATE_SUBSECTION_PERMISSIONS', 'Access Control', `Updated sub-section permissions for role "${role}" (${allowedSubSections.length} sub-sections)`);
  };

  const resetRoleSubSectionPermissions = () => {
    setRoleSubSectionPermissions(DEFAULT_ROLE_SUBSECTION_PERMISSIONS);
    localStorage.removeItem(SUBSECTION_PERMISSIONS_STORAGE_KEY);
    logActivity('RESET_SUBSECTION_PERMISSIONS', 'Access Control', 'Reset all sub-section permissions to factory defaults');
  };

  const getAllowedModules = (role?: UserRole): string[] => {
    const targetRole = role || activeRole;
    // Admins and Principals always have full access to everything
    if (targetRole === 'Super Admin' || targetRole === 'School Admin' || targetRole === 'Principal' || targetRole === 'Vice Principal') {
      return ALL_MODULE_IDS;
    }

    // Check if current user has a specific user-level override
    if (!role && currentUser?.email) {
      const userOverrides = getUserPermissionOverrides();
      const cleanUname = (currentUser.name || '').toLowerCase().replace(/[\s_-]+/g, '');
      const cleanEmailUser = (currentUser.email || '').split('@')[0].toLowerCase().replace(/[\s_-]+/g, '');
      if (userOverrides[cleanEmailUser]) {
        return userOverrides[cleanEmailUser];
      }
      if (userOverrides[cleanUname]) {
        return userOverrides[cleanUname];
      }
    }

    return rolePermissions[targetRole] || DEFAULT_ROLE_PERMISSIONS[targetRole] || ['sis'];
  };

  const isModuleAllowed = (moduleId: string, role?: UserRole): boolean => {
    const allowed = getAllowedModules(role);
    return allowed.includes(moduleId);
  };

  const getAllowedSubSections = (role?: UserRole): string[] => {
    const targetRole = role || activeRole;
    // Admins and Principals always have full access to all sub-sections
    if (targetRole === 'Super Admin' || targetRole === 'School Admin' || targetRole === 'Principal' || targetRole === 'Vice Principal') {
      return ALL_SUBSECTION_IDS;
    }

    // Check if current user has a specific user-level sub-section override
    if (!role && currentUser?.email) {
      const userSubOverrides = getUserSubSectionOverrides();
      const cleanUname = (currentUser.name || '').toLowerCase().replace(/[\s_-]+/g, '');
      const cleanEmailUser = (currentUser.email || '').split('@')[0].toLowerCase().replace(/[\s_-]+/g, '');
      if (userSubOverrides[cleanEmailUser]) {
        return userSubOverrides[cleanEmailUser];
      }
      if (userSubOverrides[cleanUname]) {
        return userSubOverrides[cleanUname];
      }
    }

    return roleSubSectionPermissions[targetRole] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS[targetRole] || [];
  };

  const isSubSectionAllowed = (subSectionId: string, role?: UserRole): boolean => {
    const allowed = getAllowedSubSections(role);
    return allowed.includes(subSectionId);
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    logActivity('ROLE_SWITCH', 'Auth', `Switched active view role to ${role}`);
  };

  const [isStudentEditingAllowed, setIsStudentEditingAllowedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('schoolerp_student_editing_allowed');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const setStudentEditingAllowed = (allowed: boolean) => {
    setIsStudentEditingAllowedState(allowed);
    try {
      localStorage.setItem('schoolerp_student_editing_allowed', String(allowed));
    } catch (e) {
      console.error(e);
    }
    logActivity('PERMISSIONS_CHANGED', 'Access Control', `${allowed ? 'Enabled' : 'Restricted'} Student Profile Editing rights.`);
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const logActivity = (action: string, module: string, details: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      user: currentUser.name,
      role: activeRole,
      action,
      module,
      details,
      ipAddress: '127.0.0.1'
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginUser,
        logout,
        isAuthenticated,
        setIsAuthenticated,
        viewMode,
        setViewMode,
        toggleViewMode,
        activeRole,
        setActiveRole,
        academicSessions,
        currentAcademicSession,
        setCurrentAcademicSession,
        notifications,
        addNotification,
        markNotificationRead,
        auditLogs,
        logActivity,
        theme,
        toggleTheme,
        quickSearchQuery,
        setQuickSearchQuery,
        rolePermissions,
        updateRolePermissions,
        resetRolePermissions,
        isModuleAllowed,
        getAllowedModules,
        roleSubSectionPermissions,
        updateRoleSubSectionPermissions,
        resetRoleSubSectionPermissions,
        isSubSectionAllowed,
        getAllowedSubSections,
        isStudentEditingAllowed,
        setStudentEditingAllowed
      }}
    >
      <div className={theme === 'dark' ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-slate-50 text-slate-900 min-h-screen'}>
        {children}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
