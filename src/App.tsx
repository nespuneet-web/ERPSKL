import React, { useState } from 'react';
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
import { SupabaseCloudHub } from './components/SupabaseCloudHub';
import { UserLoginModal } from './components/UserLoginModal';
import { DatabaseSyncModal } from './components/DatabaseSyncModal';
import { RefreshCw } from 'lucide-react';

import {
  Users,
  UserPlus,
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
  ShieldAlert,
  Moon,
  Sun,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
  Database,
  Globe,
  LogIn
} from 'lucide-react';

const MODULE_LIST = [
  { id: 'sis', name: 'Student Info (SIS)', icon: Users, category: 'Core Academic' },
  { id: 'admission', name: 'Admission & Leads', icon: UserPlus, category: 'Core Academic' },
  { id: 'examination', name: 'Examination & Reports', icon: Award, category: 'Core Academic' },
  { id: 'attendance', name: 'Daily Attendance', icon: Calendar, category: 'Core Academic' },
  { id: 'timetable', name: 'Timetable Engine', icon: Clock, category: 'Core Academic' },

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
  const [activeModule, setActiveModule] = useState('sis');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const { activeRole, setActiveRole, academicYear, setAcademicYear, notifications, auditLogs } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'sis':
        return <SisModule />;
      case 'admission':
        return <AdmissionModule />;
      case 'examination':
        return <ExaminationModule />;
      case 'fees':
        return <FeesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'transport':
        return <TransportModule />;
      case 'library':
        return <LibraryModule />;
      case 'staff':
        return <StaffModule />;
      case 'interview':
        return <InterviewModule />;
      case 'communication':
        return <CommunicationModule />;
      case 'reports':
        return <ReportsModule />;
      case 'certificates':
        return <CertificatesModule />;
      case 'idcards':
        return <IDCardsModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'hostel':
        return <HostelModule />;
      case 'visitor':
        return <VisitorModule />;
      case 'supabase_cloud':
        return <SupabaseCloudHub />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <SisModule />;
    }
  };


  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} flex`}>
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-wider uppercase">SCHOOLERP</h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Modular Enterprise</p>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {['Core Academic', 'Finance & Admin', 'Campus Logistics', 'Tools & Utilities'].map((category) => (
            <div key={category} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">{category}</p>
              {MODULE_LIST.filter((m) => m.category === category).map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
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
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          SCHOOLERP v1.0 • Independent Modules
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
              <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {MODULE_LIST.find((m) => m.id === activeModule)?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Independent Module • St. Xavier Higher Secondary School
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Synchronize Database Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-sm cursor-pointer transition-all active:scale-95 border border-indigo-400/30"
              title="Synchronize Database: Create tables and update database schema"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-200" />
              <span>Synchronize Database</span>
            </button>

            {/* Live Database Connectivity Green Signal */}
            <button
              onClick={() => setActiveModule('supabase_cloud')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
              title="Supabase Database Connectivity Status: LIVE"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>DB Live</span>
            </button>

            {/* Supabase & Vercel Hub Quick Access */}
            <button
              onClick={() => setActiveModule('supabase_cloud')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-lg shadow-xs cursor-pointer transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Cloud Hub</span>
            </button>

            {/* Academic Session Selector */}
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="hidden sm:block px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="2025-2026">Session 2025-2026</option>
              <option value="2024-2025">Session 2024-2025</option>
            </select>

            {/* User Login & Password Button */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer transition-all active:scale-95"
              title="User Login & Password Credentials"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>

            {/* Role Switcher */}
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-lg cursor-pointer"
            >
              <option value="Super Admin">Role: Super Admin</option>
              <option value="School Admin">Role: School Admin</option>
              <option value="Principal">Role: Principal</option>
              <option value="Examination Incharge">Role: Exam Incharge</option>
              <option value="Teacher">Role: Class Teacher</option>
              <option value="Accountant">Role: Accountant</option>
              <option value="Student">Role: Student Portal</option>
              <option value="Parent">Role: Parent Portal</option>
            </select>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
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
