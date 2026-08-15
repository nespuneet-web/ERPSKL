import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Modular Components
import { SisModule } from './modules/sis';
import { AdmissionModule } from './modules/admission';
import { ExaminationModule } from './modules/examination';
import { FeesModule } from './modules/fees';
import { AttendanceModule } from './modules/attendance';
import { TimetableModule } from './modules/timetable';
import { TransportModule } from './modules/transport';
import { LibraryModule } from './modules/library';
import { StaffModule } from './modules/staff';
import { InterviewModule } from './modules/interview';
import { CommunicationModule } from './modules/communication';
import { ReportsModule } from './modules/reports';
import { CertificatesModule } from './modules/certificates';
import { IDCardsModule } from './modules/idcards';
import { InventoryModule } from './modules/inventory';
import { HostelModule } from './modules/hostel';
import { VisitorModule } from './modules/visitor';
import { SettingsModule } from './modules/settings';
import { LessonPlansModule } from './modules/lessonPlans';
import { StudentPortalView } from './modules/sis/StudentPortalView';
import { SupabaseCloudHub } from './components/SupabaseCloudHub';
import { UserLoginModal } from './components/UserLoginModal';
import { DatabaseSyncModal } from './components/DatabaseSyncModal';
import { RolePermissionsModal } from './components/RolePermissionsModal';
import { DatabaseSyncNotification } from './components/DatabaseSyncNotification';
import { FirstScreenLogin } from './components/FirstScreenLogin';
import { TileGridView, ALL_TILES } from './components/TileGridView';
import { AndroidMobileLayout } from './components/AndroidMobileLayout';
import { initializeSupabaseSchema } from './lib/supabaseSync';
import { ErrorBoundary } from './components/ErrorBoundary';

import {
  Users,
  Award,
  DollarSign,
  Calendar,
  Clock,
  Bus,
  Book,
  Briefcase,
  Bell,
  BarChart3,
  CreditCard,
  Package,
  Home,
  Shield,
  Settings,
  Moon,
  Sun,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
  Database,
  LogIn,
  BookOpen,
  Smartphone,
  Monitor,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowLeft,
  FileText,
  Ticket,
  User,
  LogOut,
  UserPlus
} from 'lucide-react';

const MODULE_LIST = [
  { id: 'sis', name: 'Student Information (SIS)', icon: Users, category: 'Core Academic' },
  { id: 'admission', name: 'Admission & Inquiries', icon: UserPlus, category: 'Core Academic' },
  { id: 'examination', name: 'Examination & Reports', icon: Award, category: 'Core Academic' },
  { id: 'attendance', name: 'Daily Attendance', icon: Calendar, category: 'Core Academic' },
  { id: 'timetable', name: 'Timetable Engine', icon: Clock, category: 'Core Academic' },
  { id: 'lesson_plans', name: 'Lesson Plans & Syllabus', icon: BookOpen, category: 'Core Academic' },

  { id: 'fees', name: 'Fees & Collections', icon: DollarSign, category: 'Finance & Admin' },
  { id: 'staff', name: 'Staff Directory', icon: Users, category: 'Finance & Admin' },
  { id: 'interview', name: 'Interview & HR Panel', icon: Briefcase, category: 'Finance & Admin' },
  { id: 'reports', name: 'Executive Analytics', icon: BarChart3, category: 'Finance & Admin' },

  { id: 'transport', name: 'Transport & Routes', icon: Bus, category: 'Campus Logistics' },
  { id: 'library', name: 'Library Catalog', icon: Book, category: 'Campus Logistics' },
  { id: 'inventory', name: 'Inventory & Assets', icon: Package, category: 'Campus Logistics' },
  { id: 'hostel', name: 'Hostel & Dorms', icon: Home, category: 'Campus Logistics' },
  { id: 'visitor', name: 'Visitor Gate Pass', icon: Shield, category: 'Campus Logistics' },

  { id: 'supabase_cloud', name: 'Supabase & Vercel Cloud', icon: Database, category: 'Tools & Utilities' },
  { id: 'communication', name: 'Digital Noticeboard', icon: Bell, category: 'Tools & Utilities' },
  { id: 'certificates', name: 'TC & Certificates', icon: GraduationCap, category: 'Tools & Utilities' },
  { id: 'idcards', name: 'Smart ID Cards', icon: CreditCard, category: 'Tools & Utilities' },
  { id: 'settings', name: 'System Settings', icon: Settings, category: 'Tools & Utilities' }
];

function ErpLayout() {
  const [activeModule, setActiveModule] = useState('home_tiles');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [desktopStudentTab, setDesktopStudentTab] = useState<'overview' | 'homework' | 'attendance' | 'report_card' | 'admit_card' | 'timetable' | 'profile'>('overview');

  const {
    isAuthenticated,
    currentUser,
    logout,
    activeRole,
    setActiveRole,
    academicSessions,
    currentAcademicSession,
    setCurrentAcademicSession,
    isModuleAllowed,
    getAllowedModules,
    viewMode,
    setViewMode,
    toggleViewMode
  } = useAuth();

  const isStudent = activeRole === 'Student';

  // Automatic Background Real-Time Database Sync Initialization
  useEffect(() => {
    initializeSupabaseSchema()
      .then((res) => {
        console.log('Automated Real-Time Database Sync initialized:', res.summary ? res.summary.join(' | ') : 'Success');
      })
      .catch((err) => {
        console.error('Error in auto DB sync initialization:', err);
      });
  }, []);

  // Auto-redirect if active module is restricted for the current active role
  useEffect(() => {
    if (!isStudent && activeModule !== 'home_tiles' && !isModuleAllowed(activeModule)) {
      const allowed = getAllowedModules();
      if (allowed.length > 0) {
        setActiveModule(allowed[0]);
      } else {
        setActiveModule('home_tiles');
      }
    }
  }, [activeRole, activeModule, isModuleAllowed, getAllowedModules, isStudent]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Render active stage or module
  const renderActiveModule = () => {
    if (isStudent) {
      return <StudentPortalView forcedTab={desktopStudentTab} />;
    }

    if (activeModule === 'home_tiles') {
      return (
        <TileGridView
          onSelectModule={(modId) => setActiveModule(modId)}
          isMobileMode={viewMode === 'mobile'}
        />
      );
    }

    let content;
    switch (activeModule) {
      case 'sis':
        content = <SisModule />;
        break;
      case 'admission':
        content = <AdmissionModule />;
        break;
      case 'examination':
        content = <ExaminationModule />;
        break;
      case 'fees':
        content = <FeesModule />;
        break;
      case 'attendance':
        content = <AttendanceModule />;
        break;
      case 'timetable':
        content = <TimetableModule />;
        break;
      case 'lesson_plans':
        content = <LessonPlansModule />;
        break;
      case 'transport':
        content = <TransportModule />;
        break;
      case 'library':
        content = <LibraryModule />;
        break;
      case 'staff':
        content = <StaffModule />;
        break;
      case 'interview':
        content = <InterviewModule />;
        break;
      case 'communication':
        content = <CommunicationModule />;
        break;
      case 'reports':
        content = <ReportsModule />;
        break;
      case 'certificates':
        content = <CertificatesModule />;
        break;
      case 'idcards':
        content = <IDCardsModule />;
        break;
      case 'inventory':
        content = <InventoryModule />;
        break;
      case 'hostel':
        content = <HostelModule />;
        break;
      case 'visitor':
        content = <VisitorModule />;
        break;
      case 'supabase_cloud':
        content = <SupabaseCloudHub />;
        break;
      case 'settings':
        content = <SettingsModule />;
        break;
      default:
        content = <SisModule />;
        break;
    }
    return <ErrorBoundary>{content}</ErrorBoundary>;
  };

  // 1. FIRST SCREEN LOGIN (When not authenticated)
  if (!isAuthenticated) {
    return (
      <FirstScreenLogin
        onSuccessLogin={() => {
          setActiveModule('home_tiles');
        }}
      />
    );
  }

  // 2. ANDROID MOBILE VIEW
  if (viewMode === 'mobile') {
    return (
      <>
        <AndroidMobileLayout
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          renderActiveModule={renderActiveModule}
          onOpenUserModal={() => setIsLoginModalOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenPermissionsModal={() => setIsPermissionsModalOpen(true)}
        />
        <UserLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <DatabaseSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
        <RolePermissionsModal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} />
        <DatabaseSyncNotification />
      </>
    );
  }

  // 3. DESKTOP VIEW
  const currentTileInfo = ALL_TILES.find((t) => t.id === activeModule);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} flex`}>
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-indigo-950 font-black flex items-center justify-center text-xl shadow-lg border border-amber-300">
              G
            </div>
            <div>
              <h1 className="font-black text-white text-xs tracking-wider uppercase leading-tight">
                GOENKA PUBLIC SCHOOL
              </h1>
              <p className="text-[10px] text-amber-300 font-bold tracking-wide uppercase">
                Agra • GDGPS Agra
              </p>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {isStudent ? (
            // Dedicated Student Navigation Menu
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
                Student Portal Menu
              </p>
              {[
                { id: 'overview', name: 'Dashboard & Classes', icon: BookOpen },
                { id: 'homework', name: 'Homework & Tasks', icon: FileText },
                { id: 'attendance', name: 'Attendance Log', icon: Calendar },
                { id: 'report_card', name: 'Academic Progress', icon: Award },
                { id: 'admit_card', name: 'Exam Permit & Admit Card', icon: Ticket },
                { id: 'timetable', name: 'Class Timetable', icon: Clock },
                { id: 'profile', name: 'My Profile & Security', icon: User }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = desktopStudentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDesktopStudentTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          ) : (
            // Staff & Administrator Navigation Menu
            <>
              {/* Main App Launcher (All Tiles) Button */}
              <div>
                <button
                  onClick={() => {
                    setActiveModule('home_tiles');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeModule === 'home_tiles'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-amber-300" />
                    <span>All Sections (Tile Grid)</span>
                  </div>
                  {activeModule === 'home_tiles' && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {['Core Academic', 'Finance & Admin', 'Campus Logistics', 'Tools & Utilities'].map((category) => {
                const categoryModules = MODULE_LIST.filter((m) => m.category === category && isModuleAllowed(m.id));
                if (categoryModules.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">{category}</p>
                    {categoryModules.map((m) => {
                      const Icon = m.icon;
                      const isActive = activeModule === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setActiveModule(m.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{m.name}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="truncate">GOENKA Public School, Agra</span>
          {isStudent && (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold text-[10px] cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                {!isStudent && activeModule !== 'home_tiles' && (
                  <button
                    onClick={() => setActiveModule('home_tiles')}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mr-1"
                    title="Back to All Sections (Tile Grid)"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Tiles</span>
                  </button>
                )}
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isStudent
                    ? 'GOENKA STUDENT PORTAL'
                    : (activeModule === 'home_tiles' ? 'All Sections (Tile Grid)' : (currentTileInfo?.name || activeModule))}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {activeRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GOENKA PUBLIC SCHOOL AGRA DEVELOPED BY GDGPS AGRA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch to Android Mobile View Toggle */}
            <button
              onClick={() => setViewMode('mobile')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Switch to Android Mobile Application View"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Mobile View (Android App)</span>
            </button>

            {!isStudent && (
              <>
                {/* Module Access Rights Configuration Button */}
                <button
                  onClick={() => setIsPermissionsModalOpen(true)}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-indigo-300 rounded-xl shadow-sm cursor-pointer transition-all border border-slate-700 dark:border-slate-600"
                  title="Role & Module Access Control"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Access Rights</span>
                </button>

                {/* Live Real-Time Database Auto-Sync Signal */}
                <button
                  onClick={() => isModuleAllowed('supabase_cloud') && setActiveModule('supabase_cloud')}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
                  title="Database Connectivity: REAL-TIME AUTOMATIC SYNC ACTIVE"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>DB Synced</span>
                </button>
              </>
            )}

            {/* User Login & Profile Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  if (isStudent) {
                    setDesktopStudentTab('profile');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                title={isStudent ? 'View Profile' : 'Click to Switch User or Change Password'}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-bold max-w-[130px] truncate">{currentUser.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px]">
                  {activeRole}
                </span>
              </button>

              <button
                onClick={() => {
                  if (isStudent) {
                    logout();
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all active:scale-95 text-white ${
                  isStudent ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                title={isStudent ? 'Logout' : 'Open Login & Credentials Hub'}
              >
                {isStudent ? <LogOut className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                <span className="hidden lg:inline">{isStudent ? 'Logout' : 'Switch User'}</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveModule()}
          </div>
        </main>

        <UserLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <DatabaseSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
        <RolePermissionsModal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} />
        <DatabaseSyncNotification />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErpLayout />
    </AuthProvider>
  );
}
