import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Key,
  UserCheck,
  ShieldCheck,
  Lock,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Search,
  Download,
  Copy,
  Users,
  GraduationCap,
  Briefcase,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Calendar,
  Bell,
  Check,
  ShieldAlert
} from 'lucide-react';
import {
  getAllUserAccounts,
  authenticateUser,
  updateUserPassword,
  resetUserPasswordToDefault,
  UserAccount,
  normalizeUsername
} from '../lib/userManager';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeRole, loginUser, logout, logActivity, addNotification } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'change_password' | 'directory'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password state
  const [targetUsername, setTargetUsername] = useState('teacher1');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Directory state
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'teacher' | 'student' | 'admin_staff'>('teacher');
  const [directorySearch, setDirectorySearch] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [accountsRefreshKey, setAccountsRefreshKey] = useState(0);

  // Reload accounts when updated
  const allAccounts = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    accountsRefreshKey;
    return getAllUserAccounts();
  }, [accountsRefreshKey]);

  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((acc) => {
      if (directoryFilter !== 'all' && acc.category !== directoryFilter) return false;
      if (directorySearch.trim()) {
        const q = directorySearch.trim().toLowerCase();
        return (
          acc.username.toLowerCase().includes(q) ||
          acc.displayName.toLowerCase().includes(q) ||
          acc.role.toLowerCase().includes(q) ||
          (acc.designation && acc.designation.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allAccounts, directoryFilter, directorySearch]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setLoginMessage({ type: 'error', text: 'Please enter a valid User ID / Username.' });
      return;
    }

    const authResult = authenticateUser(usernameInput, passwordInput);

    if (authResult.success && authResult.user) {
      const user = authResult.user;
      loginUser(user);
      logActivity('USER_LOGIN', 'Authentication', `Logged in as ${user.displayName} (${user.role})`);
      addNotification({
        title: 'Authentication Successful',
        message: `Welcome back, ${user.displayName}! Portal set to ${user.role}.`,
        type: 'success',
        module: 'Auth'
      });

      setLoginMessage({
        type: 'success',
        text: `🟢 Successfully authenticated as ${user.displayName} (${user.role})!`
      });

      setTimeout(() => {
        setLoginMessage(null);
        onClose();
      }, 1000);
    } else {
      setLoginMessage({
        type: 'error',
        text: `🔴 ${authResult.message}`
      });
    }
  };

  const handleQuickLogin = (account: UserAccount) => {
    setUsernameInput(account.username);
    setPasswordInput(account.currentPassword);
    loginUser(account);
    logActivity('QUICK_LOGIN', 'Authentication', `Quick logged in as ${account.displayName} (${account.role})`);
    addNotification({
      title: 'Portal Switched',
      message: `Signed in as ${account.displayName} (${account.role}).`,
      type: 'success',
      module: 'Auth'
    });

    setLoginMessage({
      type: 'success',
      text: `🟢 Switched to ${account.displayName} (${account.role})!`
    });

    setTimeout(() => {
      setLoginMessage(null);
      onClose();
    }, 900);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = normalizeUsername(targetUsername);
    const targetAcc = allAccounts.find((a) => a.username === cleanTarget);

    if (!targetAcc) {
      setLoginMessage({ type: 'error', text: `🔴 User ID "${targetUsername}" not found in school records.` });
      return;
    }

    const cleanOld = oldPassword.trim();
    const isOldCorrect =
      cleanOld === targetAcc.currentPassword ||
      cleanOld === targetAcc.defaultPassword ||
      cleanOld.toLowerCase().replace(/\s+/g, '') === targetAcc.currentPassword.toLowerCase().replace(/\s+/g, '');

    if (!isOldCorrect) {
      setLoginMessage({
        type: 'error',
        text: `🔴 Current / Old password does not match records for ${targetAcc.username}. (Default password: "${targetAcc.defaultPassword}")`
      });
      return;
    }

    if (newPassword.trim().length < 4) {
      setLoginMessage({ type: 'error', text: '🔴 New password must contain at least 4 characters.' });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setLoginMessage({ type: 'error', text: '🔴 New password and confirmation do not match.' });
      return;
    }

    const ok = updateUserPassword(targetAcc.username, newPassword.trim());
    if (ok) {
      setAccountsRefreshKey((k) => k + 1);
      logActivity('CHANGE_PASSWORD', 'Authentication', `Updated password for ${targetAcc.username}`);
      setLoginMessage({
        type: 'success',
        text: `🟢 Password for "${targetAcc.username}" changed successfully! Use your new password on next login.`
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setLoginMessage(null);
        setActiveTab('login');
        setUsernameInput(targetAcc.username);
        setPasswordInput(newPassword.trim());
      }, 2000);
    } else {
      setLoginMessage({ type: 'error', text: '🔴 Failed to persist updated password.' });
    }
  };

  const handleResetToDefault = (account: UserAccount) => {
    resetUserPasswordToDefault(account.username);
    setAccountsRefreshKey((k) => k + 1);
    setLoginMessage({
      type: 'success',
      text: `🟢 Password for ${account.username} reset to default ("${account.defaultPassword}")`
    });
    setTimeout(() => setLoginMessage(null), 2500);
  };

  const handleCopyCredentialsList = () => {
    let text = `=====================================================\n`;
    text += `SCHOOL ERP - USER CREDENTIALS & LOGIN ROSTER\n`;
    text += `School: St. Xavier Higher Secondary School / GD Goenka\n`;
    text += `Generated on: ${new Date().toLocaleString()}\n`;
    text += `=====================================================\n\n`;

    filteredAccounts.forEach((acc) => {
      text += `Username: ${acc.username} | Default Password: ${acc.defaultPassword} | Current: ${acc.currentPassword} | Role: ${acc.role} | Name: ${acc.displayName}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadExcel = (targetCategory?: 'teacher' | 'student' | 'admin_staff' | 'all') => {
    const listToExport = targetCategory && targetCategory !== 'all' 
      ? allAccounts.filter((a) => a.category === targetCategory) 
      : targetCategory === 'all' 
        ? allAccounts 
        : filteredAccounts;

    const headers = [
      'User ID',
      'Full Name',
      'Role / Category',
      'Class / Department',
      'Default Password',
      'Current Password',
      'Password Status',
      'Official Email',
      'Designation / Role Details'
    ];

    const rows = listToExport.map((a) => [
      a.username,
      `"${a.displayName.replace(/"/g, '""')}"`,
      `"${a.role}"`,
      `"${a.classAssigned || a.department || ''}"`,
      `"${a.defaultPassword}"`,
      `"${a.currentPassword}"`,
      a.isPasswordChanged ? 'Customized Password' : 'Default Password',
      a.email,
      `"${(a.designation || '').replace(/"/g, '""')}"`
    ]);

    // Include UTF-8 BOM (\uFEFF) so Microsoft Excel opens it directly with correct columns
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filenamePrefix = targetCategory ? `school_${targetCategory}_accounts` : `school_credentials_${directoryFilter}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-black shadow-lg">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  User Authentication & Credentials Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  1,273 Users Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log in as Teacher (1-70), Admin, Timetable, Reception, or Student (1-1200) with default passwords.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('change_password');
                setLoginMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'change_password'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('directory');
                setLoginMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Roster & Passwords</span>
            </button>
          </div>

          {/* Current Logged In Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Active User:</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white font-extrabold text-[10px]">
              {activeRole}
            </span>
          </div>
        </div>

        {/* Message Banner */}
        {loginMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              loginMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
            }`}
          >
            {loginMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{loginMessage.text}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto pr-1">
            <div className="md:col-span-7 space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    User ID / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. teacher1, teacher12, admin, timetable, reception, student1, student45"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">teacher 1 to 70</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">admin</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">timetable</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">reception</code>, and <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">student 1 to 1200</code>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('change_password');
                        if (usernameInput) setTargetUsername(usernameInput);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Change my password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Proceed / Login</span>
                </button>
              </form>
            </div>

            {/* Quick 1-Click Fast Logins & Access Scope */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    1-Click Test Logins
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">Instant switch</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { u: 'teacher1', label: 'Teacher #1 (Maths)', role: 'Teacher', pass: 'teacher1', cat: 'teacher' },
                    { u: 'teacher15', label: 'Teacher #15 (Physics)', role: 'Teacher', pass: 'teacher1', cat: 'teacher' },
                    { u: 'timetable', label: 'Timetable Incharge', role: 'Timetable Incharge', pass: 'gdgoenka', cat: 'admin_staff' },
                    { u: 'reception', label: 'Front Desk Reception', role: 'Reception', pass: 'gdgoenka', cat: 'admin_staff' },
                    { u: 'admin', label: 'Super Administrator', role: 'Super Admin', pass: 'admin@123', cat: 'admin_staff' },
                    { u: 'student1', label: 'Student #1 (Class 1-A)', role: 'Student', pass: 'student1', cat: 'student' },
                    { u: 'student45', label: 'Student #45 (Class 10-A)', role: 'Student', pass: 'student1', cat: 'student' }
                  ].map((preset) => {
                    const acc = allAccounts.find((a) => a.username === preset.u);
                    return (
                      <button
                        key={preset.u}
                        type="button"
                        onClick={() => acc && handleQuickLogin(acc)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-left group cursor-pointer shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">{preset.u}</span>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">({preset.label})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Pass: {acc?.currentPassword || preset.pass}</span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          Login →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scope Checklist Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1.5">
                <div className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Role Access Privileges:
                </div>
                <ul className="text-[11px] text-blue-800 dark:text-blue-300 space-y-1 pl-1">
                  <li>• <strong>Teachers (1-70)</strong>: Marking attendance, entering marks, report creation, student profile lookup, timetable, staff profile, digital communication.</li>
                  <li>• <strong>Students (1-1200)</strong>: Dedicated student section (My profile, attendance, timetable, exam marks & grades, library, noticeboard, smart ID card).</li>
                  <li>• <strong>Admin / Staff</strong>: Super Admin full control, Timetable engine management, Reception visitor desk.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHANGE PASSWORD FORM */}
        {activeTab === 'change_password' && (
          <div className="max-w-xl mx-auto w-full py-2 space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Change Account Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update password for any teacher (1-70), student (1-1200), or staff member.
              </p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target User ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    placeholder="e.g. teacher1, student45, admin"
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Old / Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password (e.g. gdgoenka or student1)"
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Check className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password to confirm"
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <Key className="w-4 h-4" />
                <span>Update Password & Save</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CREDENTIALS DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex-wrap">
                {[
                  { id: 'teacher', label: 'Teachers (1-70)', count: 70 },
                  { id: 'admin_staff', label: 'Admin & Staff', count: 3 },
                  { id: 'student', label: 'Students (1-1200)', count: 1200 },
                  { id: 'all', label: 'All Users', count: 1273 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDirectoryFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      directoryFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Export & Copy Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyCredentialsList}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Copy formatted credentials roster to clipboard to pass on to teachers and students"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'Copied Roster!' : 'Copy Roster'}</span>
                </button>

                <button
                  onClick={() => handleDownloadExcel()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Download Excel spreadsheet of active view"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Sheet</span>
                </button>

                <button
                  onClick={() => handleDownloadExcel('all')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  title="Download All 1,273 accounts into a single Excel file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>All Users (Master Excel)</span>
                </button>
              </div>
            </div>

            {/* Quick How-To Process Card */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
              <div className="p-2 rounded-xl bg-emerald-600 text-white font-black shrink-0 shadow-xs">
                <Download className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <span>How to Download & Open in Excel:</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                  <strong>1.</strong> Select the category tab above (<strong>Teachers 1-70</strong>, <strong>Students 1-1200</strong>, or <strong>All Users</strong>).<br />
                  <strong>2.</strong> Click <strong>Download Excel Sheet</strong>. A formatted <code className="font-mono font-bold bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">.csv</code> file with UTF-8 encoding will automatically download.<br />
                  <strong>3.</strong> Double-click the file to open directly in <strong>Microsoft Excel</strong>, <strong>Google Sheets</strong>, or <strong>Apple Numbers</strong>. All User IDs, full names, classes/subjects, and passwords are separated cleanly into columns!
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder={`Search among ${filteredAccounts.length} accounts by username, name, role...`}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            {/* Accounts Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/90 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Name / Subject / Class</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Default Pass</th>
                    <th className="py-2.5 px-3">Current Pass</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {filteredAccounts.slice(0, 100).map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-3">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {acc.username}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{acc.displayName}</div>
                        {acc.designation && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{acc.designation}</div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">
                        {acc.defaultPassword}
                      </td>
                      <td className="py-2 px-3">
                        {acc.isPasswordChanged ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-bold text-[10px]">
                            {acc.currentPassword} (Changed)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px]">
                            {acc.defaultPassword} (Default)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleQuickLogin(acc)}
                          className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Login
                        </button>
                        {acc.isPasswordChanged && (
                          <button
                            onClick={() => handleResetToDefault(acc)}
                            className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[10px] font-bold cursor-pointer"
                            title="Reset back to default password"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAccounts.length > 100 && (
                <div className="p-2.5 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
                  Showing first 100 of {filteredAccounts.length} matching accounts. Use search to filter down.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
