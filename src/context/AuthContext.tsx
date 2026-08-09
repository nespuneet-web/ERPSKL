import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession, AcademicSession, SystemNotification, AuditLog } from '../types/common';

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

  'Teacher': ['sis', 'attendance', 'timetable', 'lesson_plans', 'examination', 'library', 'communication'],
  'Class Teacher': ['sis', 'attendance', 'timetable', 'lesson_plans', 'examination', 'library', 'communication'],

  'Student': ['sis', 'attendance', 'timetable', 'examination', 'library', 'communication', 'idcards'],
  'Parent': ['sis', 'attendance', 'timetable', 'examination', 'fees', 'transport', 'communication', 'library'],

  'Examination Incharge': ['examination', 'sis', 'timetable', 'lesson_plans', 'certificates', 'communication'],
  'Admission Team': ['admission', 'sis', 'fees', 'communication'],
  'Account Department': ['fees', 'reports', 'sis', 'communication', 'certificates'],
  'Accountant': ['fees', 'reports', 'sis', 'communication', 'certificates'],
  'Transport Department': ['transport', 'sis', 'communication'],
  'Reception': ['visitor', 'sis', 'communication'],
  'HR': ['staff', 'interview', 'communication'],
  'Interview Panel': ['staff', 'interview', 'communication'],
  'Visitor': ['visitor', 'communication'],
  'Read-only Auditor': ['reports', 'sis', 'examination', 'attendance', 'fees']
};

const PERMISSIONS_STORAGE_KEY = 'schoolerp_role_permissions_v2';

interface AuthContextType {
  currentUser: UserSession;
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
}

const DEFAULT_USER: UserSession = {
  id: 'usr-admin-1',
  name: 'Dr. V. K. Sharma',
  email: 'admin@schoolerp.edu',
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
  const [currentUser] = useState<UserSession>(DEFAULT_USER);
  const [activeRole, setActiveRoleState] = useState<UserRole>('Super Admin');
  const [academicSessions] = useState<AcademicSession[]>(INITIAL_SESSIONS);
  const [currentAcademicSession, setCurrentAcademicSession] = useState<AcademicSession>(INITIAL_SESSIONS[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Marks Locked for Half Yearly',
      message: 'Examination Incharge locked marks entry for Class 10 Mathematics.',
      type: 'warning',
      timestamp: '10 mins ago',
      read: false,
      module: 'Examination'
    },
    {
      id: 'notif-2',
      title: 'New Student Registration',
      message: 'Aarav Sharma completed SIS onboarding.',
      type: 'success',
      timestamp: '1 hour ago',
      read: false,
      module: 'SIS'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      user: 'Dr. V. K. Sharma',
      role: 'Super Admin',
      action: 'SYSTEM_BOOTSTRAP',
      module: 'System',
      details: 'Modular School ERP Initialized successfully.'
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

  useEffect(() => {
    try {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(rolePermissions));
    } catch (e) {
      console.error('Error saving role permissions:', e);
    }
  }, [rolePermissions]);

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

  const getAllowedModules = (role?: UserRole): string[] => {
    const targetRole = role || activeRole;
    // Admins and Principals always have full access to everything
    if (targetRole === 'Super Admin' || targetRole === 'School Admin' || targetRole === 'Principal') {
      return ALL_MODULE_IDS;
    }
    return rolePermissions[targetRole] || DEFAULT_ROLE_PERMISSIONS[targetRole] || ['sis'];
  };

  const isModuleAllowed = (moduleId: string, role?: UserRole): boolean => {
    const allowed = getAllowedModules(role);
    return allowed.includes(moduleId);
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    logActivity('ROLE_SWITCH', 'Auth', `Switched active view role to ${role}`);
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
        getAllowedModules
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
