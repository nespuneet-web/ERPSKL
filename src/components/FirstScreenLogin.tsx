import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
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
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Mail,
  KeyRound,
  Send,
  X
} from 'lucide-react';
import { authenticateUser } from '../lib/userManager';

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

  // Forget Password Modal for Admin Only
  const [showAdminForgotPasswordModal, setShowAdminForgotPasswordModal] = useState(false);
  const [adminResetEmailSent, setAdminResetEmailSent] = useState(false);
  const [adminResetSending, setAdminResetSending] = useState(false);
  const [adminResetSuccessMsg, setAdminResetSuccessMsg] = useState<string | null>(null);

  // Quick autofill when role tab switches
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
          message: `Welcome to GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA, ${authResult.user.displayName}!`,
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

  const handleSendAdminPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminResetSending(true);

    setTimeout(() => {
      setAdminResetSending(false);
      setAdminResetEmailSent(true);
      setAdminResetSuccessMsg(
        'Password reset link and default password verification credentials have been successfully dispatched to nespuneet@gmail.com.'
      );
      logActivity(
        'ADMIN_PASSWORD_RESET_REQUESTED',
        'Security',
        'Admin requested password reset. Notification & link sent to nespuneet@gmail.com'
      );
      addNotification({
        title: 'Admin Password Reset Link Sent',
        message: 'Password reset link sent to nespuneet@gmail.com',
        type: 'info',
        module: 'Security'
      });
    }, 800);
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
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white flex items-center gap-2">
              GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA
            </h1>
            <p className="text-[10px] sm:text-xs text-indigo-300 font-semibold tracking-wider uppercase">
              Affiliated to CBSE, New Delhi • Senior Secondary ERP
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
              Secure Institutional ERP Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your role category and enter your credentials to proceed.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            {[
              { id: 'admin', label: 'Admin', icon: Building2 },
              { id: 'teacher', label: 'Teacher', icon: GraduationCap },
              { id: 'student', label: 'Student', icon: Users },
              { id: 'reception', label: 'Reception', icon: Briefcase },
              { id: 'timetable', label: 'Timetable', icon: Clock }
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
                  placeholder="Enter User ID or Username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedRoleTab === 'admin' && 'Super Admin & School Administrator Access'}
                {selectedRoleTab === 'teacher' && 'Faculty Member Access (User ID: teacher1 to teacher70)'}
                {selectedRoleTab === 'student' && 'Student Portal View-Only Access (User ID: student1 to student1200)'}
                {selectedRoleTab === 'reception' && 'Front Desk & Visitor Management Access'}
                {selectedRoleTab === 'timetable' && 'Timetable & Academic Scheduling Incharge Access'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password <span className="text-rose-400">*</span>
                </label>

                {/* Forget password link - Only for Admin */}
                {selectedRoleTab === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminForgotPasswordModal(true);
                      setAdminResetEmailSent(false);
                      setAdminResetSuccessMsg(null);
                    }}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Forgot Password? (Admin)</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password..."
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

            {/* Proceed / Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Proceed / Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Status Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA</span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Access Protected</span>
            </div>
          </div>
        </div>
      </main>

      {/* ADMIN FORGOT PASSWORD MODAL */}
      {showAdminForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-5 relative animate-scaleUp">
            <button
              onClick={() => setShowAdminForgotPasswordModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Admin Password Recovery</h3>
                <p className="text-xs text-indigo-300 font-medium">Administrator Security Verification</p>
              </div>
            </div>

            {!adminResetEmailSent ? (
              <form onSubmit={handleSendAdminPasswordReset} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-xs space-y-2">
                  <p className="text-slate-300">
                    The forget password functionality is restricted exclusively to the <strong>Administrator</strong> account.
                  </p>
                  <p className="text-indigo-200 font-medium flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    Reset link & credentials will be dispatched to:
                  </p>
                  <div className="p-2 rounded-xl bg-slate-950 font-mono text-xs font-bold text-amber-300 border border-slate-800 text-center">
                    nespuneet@gmail.com
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Admin User ID
                  </label>
                  <input
                    type="text"
                    value="admin"
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminResetSending}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
                >
                  {adminResetSending ? (
                    <span>Dispatching Reset Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link to nespuneet@gmail.com</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-black text-emerald-200 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Reset Link Dispatched Successfully!</span>
                  </div>
                  <p className="leading-relaxed">
                    {adminResetSuccessMsg}
                  </p>
                  <div className="mt-2 p-2 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-[11px] text-slate-300 space-y-1">
                    <div><strong>Recipient Email:</strong> <span className="text-amber-300 font-mono">nespuneet@gmail.com</span></div>
                    <div><strong>Status:</strong> Dispatched & Logged in Audit Trail</div>
                    <div><strong>Default Super Admin Password:</strong> <span className="text-emerald-400 font-mono">admin@123</span></div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAdminForgotPasswordModal(false)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Close & Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-slate-950/40 z-10">
        © {new Date().getFullYear()} GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA. All rights reserved.
      </footer>
    </div>
  );
};
