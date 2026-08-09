import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, UserCheck, ShieldCheck, Lock, CheckCircle2, User, Eye, EyeOff, X, RefreshCw } from 'lucide-react';
import { UserRole } from '../types/common';

interface UserCredential {
  username: string;
  password: string;
  role: UserRole;
  name: string;
  id: string;
}

const DEFAULT_CREDENTIALS: UserCredential[] = [
  { username: 'student', password: 'student123', role: 'Student', name: 'Aarav Sharma (Student)', id: 'std-101' },
  { username: 'teacher1', password: 'teacher123', role: 'Teacher', name: 'Ankur Kabra (PGT Maths)', id: 'tch-201' },
  { username: 'admin', password: 'admin123', role: 'Super Admin', name: 'Dr. V. K. Sharma (Admin)', id: 'adm-001' }
];

const STORAGE_KEY = 'schoolerp_user_credentials_v1';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({ isOpen, onClose }) => {
  const { activeRole, setActiveRole, currentUser, logActivity, addNotification } = useAuth();

  const [credentials, setCredentials] = useState<UserCredential[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading credentials:', e);
    }
    return DEFAULT_CREDENTIALS;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'change_password'>('login');
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password fields
  const [targetUsername, setTargetUsername] = useState('student');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    } catch (e) {
      console.error('Error saving credentials:', e);
    }
  }, [credentials]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = credentials.find(
      (c) => c.username.toLowerCase() === usernameInput.trim().toLowerCase() && c.password === passwordInput
    );

    if (found) {
      setActiveRole(found.role);
      logActivity('USER_LOGIN', 'Authentication', `Logged in as ${found.name} (${found.role})`);
      addNotification({
        title: 'Authentication Successful',
        message: `Welcome back, ${found.name}! Active portal set to ${found.role}.`,
        type: 'success',
        module: 'Auth'
      });
      setLoginMessage({ type: 'success', text: `🟢 Authenticated successfully as ${found.name} (${found.role})!` });
      setTimeout(() => {
        setLoginMessage(null);
        onClose();
      }, 1200);
    } else {
      setLoginMessage({ type: 'error', text: '🔴 Invalid username or password. Please verify credentials.' });
    }
  };

  const handleQuickLogin = (preset: UserCredential) => {
    setUsernameInput(preset.username);
    setPasswordInput(preset.password);
    setActiveRole(preset.role);
    logActivity('QUICK_LOGIN', 'Authentication', `Quick logged in as ${preset.name} (${preset.role})`);
    setLoginMessage({ type: 'success', text: `🟢 Switched to ${preset.role} portal (${preset.username})!` });
    setTimeout(() => {
      setLoginMessage(null);
      onClose();
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const userIndex = credentials.findIndex((c) => c.username.toLowerCase() === targetUsername.toLowerCase());

    if (userIndex === -1) {
      setLoginMessage({ type: 'error', text: '🔴 Account not found for selected user.' });
      return;
    }

    if (credentials[userIndex].password !== oldPassword) {
      setLoginMessage({ type: 'error', text: '🔴 Old password does not match current records.' });
      return;
    }

    if (newPassword.length < 4) {
      setLoginMessage({ type: 'error', text: '🔴 New password must be at least 4 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoginMessage({ type: 'error', text: '🔴 New password and confirmation do not match.' });
      return;
    }

    const updated = [...credentials];
    updated[userIndex].password = newPassword;
    setCredentials(updated);

    logActivity('CHANGE_PASSWORD', 'Authentication', `Updated password for user ${targetUsername}`);
    setLoginMessage({ type: 'success', text: `🟢 Password for "${targetUsername}" changed successfully!` });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setActiveTab('login');
      setLoginMessage(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                School ERP Portal Login
              </h3>
              <p className="text-[11px] text-slate-500">
                Current Role: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeRole}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Portal Login</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('change_password');
              setLoginMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'change_password'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {loginMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm ${
              loginMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
            }`}
          >
            <span>{loginMessage.text}</span>
          </div>
        )}

        {/* LOGIN TAB CONTENT */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {/* Quick Login Buttons */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                ⚡ 1-Click Quick Login Credentials:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {credentials.map((c) => (
                  <button
                    key={c.username}
                    onClick={() => handleQuickLogin(c)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 text-left cursor-pointer transition-all active:scale-95 group"
                  >
                    <span className="block text-[11px] font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {c.role}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {c.username}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">Or Enter Details</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Username ID:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. teacher1 or student or admin"
                    className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-9 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to School ERP</span>
              </button>
            </form>
          </div>
        )}

        {/* CHANGE PASSWORD TAB CONTENT */}
        {activeTab === 'change_password' && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Select User Account:
              </label>
              <select
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
              >
                {credentials.map((c) => (
                  <option key={c.username} value={c.username}>
                    {c.name} ({c.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Current / Old Password:
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password..."
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                New Password:
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 chars)..."
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password:
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <Key className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </form>
        )}

        {/* Modal Footer Info */}
        <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-200 dark:border-slate-800">
          Default Logins: Student (<code>student</code> / <code>student123</code>) • Teacher (<code>teacher1</code> / <code>teacher123</code>)
        </div>
      </div>
    </div>
  );
};
