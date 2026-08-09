import React, { useState } from 'react';
import { useAuth, ALL_MODULE_IDS } from '../context/AuthContext';
import { UserRole } from '../types/common';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  RotateCcw,
  Save,
  CheckSquare,
  Square,
  Users,
  UserPlus,
  Award,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  Briefcase,
  BarChart3,
  Bus,
  Book,
  Package,
  Home,
  Shield,
  Database,
  Bell,
  GraduationCap,
  CreditCard,
  Settings,
  AlertCircle
} from 'lucide-react';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_METADATA: { id: string; name: string; category: string; icon: React.FC<{ className?: string }>; description: string }[] = [
  { id: 'sis', name: 'Student Info (SIS)', category: 'Core Academic', icon: Users, description: 'Student directory, profile views, and academic records.' },
  { id: 'admission', name: 'Admission & Leads', category: 'Core Academic', icon: UserPlus, description: 'Prospective leads, inquiries, and application onboarding.' },
  { id: 'examination', name: 'Examination & Reports', category: 'Core Academic', icon: Award, description: 'Marksheet evaluation, report cards, and grades.' },
  { id: 'attendance', name: 'Daily Attendance', category: 'Core Academic', icon: Calendar, description: 'Daily attendance logs, monthly stats, and absentees.' },
  { id: 'timetable', name: 'Timetable Engine', category: 'Core Academic', icon: Clock, description: 'Weekly schedules, substitutions, and round duties.' },
  { id: 'lesson_plans', name: 'Lesson Plans & Syllabus', category: 'Core Academic', icon: BookOpen, description: 'Syllabus tracker, weekly targets, and principal alerts.' },

  { id: 'fees', name: 'Fees & Collections', category: 'Finance & Admin', icon: DollarSign, description: 'Fee receipts, dues ledger, and payment gateway status.' },
  { id: 'staff', name: 'Staff Directory', category: 'Finance & Admin', icon: Users, description: 'Teacher & staff profile directory and payroll logs.' },
  { id: 'interview', name: 'Interview & HR Panel', category: 'Finance & Admin', icon: Briefcase, description: 'Candidate interviews, candidate ratings, and exit feedback.' },
  { id: 'reports', name: 'Executive Analytics', category: 'Finance & Admin', icon: BarChart3, description: 'Management KPIs, enrollment trends, and financial reports.' },

  { id: 'transport', name: 'Transport & Routes', category: 'Campus Logistics', icon: Bus, description: 'Bus routes, driver contacts, and monthly transport fees.' },
  { id: 'library', name: 'Library Catalog', category: 'Campus Logistics', icon: Book, description: 'Book inventory, accession numbers, and borrowed logs.' },
  { id: 'inventory', name: 'Inventory & Assets', category: 'Campus Logistics', icon: Package, description: 'School assets, stock counts, and storage locations.' },
  { id: 'hostel', name: 'Hostel & Dorms', category: 'Campus Logistics', icon: Home, description: 'Dorm room allocations, hostel blocks, and occupancy.' },
  { id: 'visitor', name: 'Visitor Gate Pass', category: 'Campus Logistics', icon: Shield, description: 'Gate pass generation, check-in/out, and visitor logs.' },

  { id: 'supabase_cloud', name: 'Supabase & Cloud Hub', category: 'Tools & Utilities', icon: Database, description: 'Database synchronization and cloud project settings.' },
  { id: 'communication', name: 'Digital Noticeboard', category: 'Tools & Utilities', icon: Bell, description: 'School announcements, circulars, and system alerts.' },
  { id: 'certificates', name: 'TC & Certificates', category: 'Tools & Utilities', icon: GraduationCap, description: 'Transfer Certificates, Character & Bonafide slips.' },
  { id: 'idcards', name: 'Smart ID Cards', category: 'Tools & Utilities', icon: CreditCard, description: 'Digital student and staff ID card generator.' },
  { id: 'settings', name: 'System Settings', category: 'Tools & Utilities', icon: Settings, description: 'School profile, academic sessions, and system config.' }
];

const TARGET_ROLES: UserRole[] = [
  'Student',
  'Teacher',
  'Class Teacher',
  'Parent',
  'Accountant',
  'Examination Incharge',
  'Admission Team',
  'HR',
  'Reception',
  'Principal',
  'School Admin',
  'Super Admin'
];

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ isOpen, onClose }) => {
  const { rolePermissions, updateRolePermissions, resetRolePermissions, activeRole, addNotification, logActivity } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [currentSelectedModules, setCurrentSelectedModules] = useState<string[]>(
    () => rolePermissions['Student'] || ['sis', 'attendance', 'timetable', 'examination', 'library', 'communication', 'idcards']
  );
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setCurrentSelectedModules(rolePermissions[newRole] || ALL_MODULE_IDS);
    setSaveMessage(null);
  };

  const toggleModule = (modId: string) => {
    if (selectedRole === 'Super Admin' || selectedRole === 'School Admin' || selectedRole === 'Principal') {
      setSaveMessage({
        type: 'error',
        text: '⚠️ Super Admin, School Admin & Principal always have full access to all modules.'
      });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setCurrentSelectedModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const handleSelectAll = () => {
    setCurrentSelectedModules([...ALL_MODULE_IDS]);
  };

  const handleClearAll = () => {
    // Keep at least 'sis' or 'communication' to avoid black screen
    setCurrentSelectedModules(['sis']);
  };

  const handleSavePermissions = () => {
    updateRolePermissions(selectedRole, currentSelectedModules);
    logActivity('PERMISSIONS_UPDATED', 'Access Control', `Saved ${currentSelectedModules.length} module permissions for role ${selectedRole}`);
    addNotification({
      title: 'Module Access Rights Updated',
      message: `Successfully configured ${currentSelectedModules.length} active modules for ${selectedRole}.`,
      type: 'success',
      module: 'Access Control'
    });

    setSaveMessage({
      type: 'success',
      text: `🟢 Successfully saved module access rules for "${selectedRole}"!`
    });
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const isFullAccessRole = selectedRole === 'Super Admin' || selectedRole === 'School Admin' || selectedRole === 'Principal';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Role & Module Access Control Manager
              </h3>
              <p className="text-xs text-slate-500">
                Specify exactly which modules each user role (Student, Teacher, Parent, Admin) can see and access.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Message */}
        {saveMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
            1. Select Target User Role:
          </label>
          <div className="flex flex-wrap gap-2">
            {TARGET_ROLES.map((r) => {
              const isActive = selectedRole === r;
              const count = isFullAccessRole ? ALL_MODULE_IDS.length : (rolePermissions[r] || []).length;
              return (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Banner */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">
              Role: <span className="text-indigo-600 dark:text-indigo-400">{selectedRole}</span>
            </span>
            {isFullAccessRole && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                🔒 FULL ADMIN ACCESS (UNRESTRICTED)
              </span>
            )}
          </div>

          {!isFullAccessRole && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => resetRolePermissions()}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 border border-rose-200 flex items-center gap-1 cursor-pointer"
                title="Reset all role module access rules to default factory settings"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>
          )}
        </div>

        {/* Modules Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {['Core Academic', 'Finance & Admin', 'Campus Logistics', 'Tools & Utilities'].map((cat) => (
            <div key={cat} className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {cat}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {MODULE_METADATA.filter((m) => m.category === cat).map((m) => {
                  const Icon = m.icon;
                  const isChecked = isFullAccessRole || currentSelectedModules.includes(m.id);

                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isChecked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                          <span className={`text-xs font-black ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            {m.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Changes take effect immediately for all active users in role <span className="font-bold text-slate-900 dark:text-white">{selectedRole}</span>.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePermissions}
              className="px-5 py-2 text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save {selectedRole} Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
