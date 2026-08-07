import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession, AcademicSession, SystemNotification, AuditLog } from '../types/common';

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
        setQuickSearchQuery
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
