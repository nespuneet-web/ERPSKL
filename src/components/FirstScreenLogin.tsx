import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Key,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Download,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { authenticateUser, getAllUserAccounts, UserAccount } from '../lib/userManager';

interface FirstScreenLoginProps {
  onSuccessLogin?: () => void;
}

export const FirstScreenLogin: React.FC<FirstScreenLoginProps> = ({ onSuccessLogin }) => {
  const { loginUser, logActivity, addNotification, viewMode, setViewMode } = useAuth();

  const [selectedRoleTab, setSelectedRoleTab] = useState<'admin' | 'teacher' | 'student' | 'reception' | 'timetable'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset selections when tab switches
  const handleTabChange = (tab: 'admin' | 'teacher' | 'student' | 'reception' | 'timetable') => {
    setSelectedRoleTab(tab);
    setErrorMessage(null);
    if (tab === 'admin') {
      setUsername('admin');
      setPassword('');
    } else if (tab === 'teacher') {
      setUsername('teacher1');
      setPassword('');
    } else if (tab === 'student') {
      setUsername('student1');
      setPassword('');
    } else if (tab === 'reception') {
      setUsername('reception');
      setPassword('');
    } else if (tab === 'timetable') {
      setUsername('timetable');
      setPassword('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your User ID or Username.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Password is required. Nobody can log in without entering a password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const authResult = authenticateUser(cleanUser, cleanPass);

      if (authResult.success && authResult.user) {
        loginUser(authResult.user);
        logActivity('USER_LOGIN', 'Authentication', `Logged in successfully as ${authResult.user.displayName} (${authResult.user.role})`);
        addNotification({
          title: 'Portal Access Granted',
          message: `Welcome to Goingka Public School portal, ${authResult.user.displayName}!`,
          type: 'success',
          module: 'Auth'
        });
        if (onSuccessLogin) onSuccessLogin();
      } else {
        setErrorMessage(authResult.message || 'Invalid username or password. Please try again.');
      }
      setIsLoading(false);
    }, 300);
  };

  // Quick fill helper for demonstration
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20">
            G
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
              Goingka Public School, Agra
            </h1>
            <p className="text-[10px] sm:text-xs text-indigo-300 font-semibold tracking-wider uppercase">
              Affiliated to CBSE, New Delhi • Senior Secondary
            </p>
          </div>
        </div>

        {/* Mobile / Desktop View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Android Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Mobile View</span>
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop View</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header Title inside Card */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Secure School ERP Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your role category and enter credentials to continue.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            {[
              { id: 'admin', label: 'Admin', icon: Building2, defaultId: 'admin', defaultPass: 'admin@123' },
              { id: 'teacher', label: 'Teacher', icon: GraduationCap, defaultId: 'teacher1', defaultPass: 'teacher1' },
              { id: 'student', label: 'Student', icon: Users, defaultId: 'student1', defaultPass: 'student1' },
              { id: 'reception', label: 'Reception', icon: Briefcase, defaultId: 'reception', defaultPass: 'gdigonika' },
              { id: 'timetable', label: 'Timetable', icon: Clock, defaultId: 'timetable', defaultPass: 'gdigonika' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-indigo-600 to-blue-600 text-white shadow-md font-black scale-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[11px] leading-tight font-extrabold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                User ID / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, teacher1, student1, reception"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedRoleTab === 'admin' && 'Username: admin (Super Admin)'}
                {selectedRoleTab === 'teacher' && 'User IDs: teacher1 to teacher70'}
                {selectedRoleTab === 'student' && 'User IDs: student1 to student1200'}
                {selectedRoleTab === 'reception' && 'Username: reception'}
                {selectedRoleTab === 'timetable' && 'Username: timetable'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password <span className="text-rose-400">* (Required)</span>
                </label>
                <span className="text-[10px] text-indigo-400 font-bold">
                  No login without password
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password..."
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Default Password Quick-Fill Helper Pill */}
            <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs">
                <span className="text-indigo-300 font-semibold">Standard Password: </span>
                <code className="font-mono font-black text-amber-300 bg-indigo-900/80 px-2 py-0.5 rounded-md">
                  {selectedRoleTab === 'admin' && 'admin@123'}
                  {selectedRoleTab === 'teacher' && 'teacher1'}
                  {selectedRoleTab === 'student' && 'student1'}
                  {selectedRoleTab === 'reception' && 'gdigonika'}
                  {selectedRoleTab === 'timetable' && 'gdigonika'}
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedRoleTab === 'admin') handleQuickFill('admin', 'admin@123');
                  if (selectedRoleTab === 'teacher') handleQuickFill('teacher1', 'teacher1');
                  if (selectedRoleTab === 'student') handleQuickFill('student1', 'student1');
                  if (selectedRoleTab === 'reception') handleQuickFill('reception', 'gdigonika');
                  if (selectedRoleTab === 'timetable') handleQuickFill('timetable', 'gdigonika');
                }}
                className="text-[11px] font-bold text-indigo-300 hover:text-white underline cursor-pointer"
              >
                Auto-Fill for Testing
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Goingka Public School Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Roster Reference Box */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Goingka Public School, Agra • 1,273 Total Accounts</span>
            <div className="flex items-center gap-1 text-indigo-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Access Control</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-slate-950/40 z-10">
        © {new Date().getFullYear()} Goingka Public School, Agra. All rights reserved. Powered by Enterprise School ERP Engine.
      </footer>
    </div>
  );
};
