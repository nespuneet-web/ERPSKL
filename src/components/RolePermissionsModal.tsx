import React, { useState, useEffect } from 'react';
import { useAuth, ALL_MODULE_IDS } from '../context/AuthContext';
import { UserRole } from '../types/common';
import {
  MODULE_SUBSECTIONS_REGISTRY,
  ALL_SUBSECTION_IDS,
  DEFAULT_ROLE_SUBSECTION_PERMISSIONS,
  SubSectionItem
} from '../lib/permissionRegistry';
import {
  getAllUserAccounts,
  getUserPermissionOverrides,
  saveUserPermissionOverride,
  removeUserPermissionOverride,
  getUserSubSectionOverrides,
  saveUserSubSectionOverride,
  removeUserSubSectionOverride,
  getCustomUsers,
  saveCustomUser,
  deleteCustomUser,
  UserAccount
} from '../lib/userManager';
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
  AlertCircle,
  Search,
  UserCheck,
  Trash2,
  KeyRound,
  Plus,
  Sliders,
  Eye,
  Edit3,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_METADATA: { id: string; name: string; category: string; icon: React.FC<{ className?: string }>; description: string }[] = [
  { id: 'sis', name: 'Student Information (SIS)', category: 'Core Academic', icon: Users, description: 'Student directory, profile views, and academic records.' },
  { id: 'admission', name: 'Admission & Inquiries', category: 'Core Academic', icon: UserPlus, description: '3-Step admissions, prospect leads, inquiry registrations & CRM.' },
  { id: 'examination', name: 'Examination & Reports', category: 'Core Academic', icon: Award, description: 'CBSE marks entry, grade calculation, and report cards.' },
  { id: 'attendance', name: 'Daily Attendance', category: 'Core Academic', icon: Calendar, description: 'Classroom attendance, calendar reports, bus, gate & staff registers.' },
  { id: 'timetable', name: 'Timetable Engine', category: 'Core Academic', icon: Clock, description: 'Weekly schedules, substitutions, round patrol duties & master builder.' },
  { id: 'lesson_plans', name: 'Lesson Plans & Syllabus', category: 'Core Academic', icon: BookOpen, description: 'Syllabus tracker, weekly targets, and learning objectives.' },

  { id: 'fees', name: 'Fees & Collections', category: 'Finance & Admin', icon: DollarSign, description: 'Fee receipts, dues ledger, and payment gateway status.' },
  { id: 'staff', name: 'Staff Directory', category: 'Finance & Admin', icon: Users, description: 'Teacher & staff profile directory and payroll data.' },
  { id: 'interview', name: 'Interview & HR Panel', category: 'Finance & Admin', icon: Briefcase, description: 'Candidate interviews, ratings, and recruitment pipeline.' },
  { id: 'reports', name: 'Custom Student Reports', category: 'Finance & Admin', icon: BarChart3, description: 'Comprehensive student reports, PDF & Excel export.' },

  { id: 'transport', name: 'Transport & GPS Routes', category: 'Campus Logistics', icon: Bus, description: 'Bus routes, driver contacts, and monthly transport fees.' },
  { id: 'library', name: 'Library Catalog', category: 'Campus Logistics', icon: Book, description: 'Book inventory, accession numbers, and borrowed logs.' },
  { id: 'inventory', name: 'Inventory & Lab Assets', category: 'Campus Logistics', icon: Package, description: 'School assets, stock counts, and storage locations.' },
  { id: 'hostel', name: 'Hostel & Dorms', category: 'Campus Logistics', icon: Home, description: 'Dorm room allocations, hostel blocks, and occupancy.' },
  { id: 'visitor', name: 'Visitor Gate Pass', category: 'Campus Logistics', icon: Shield, description: 'Gate pass generation, check-in/out, and visitor logs.' },

  { id: 'supabase_cloud', name: 'Supabase & Cloud Hub', category: 'Tools & Utilities', icon: Database, description: 'Database synchronization and cloud project settings.' },
  { id: 'communication', name: 'Digital Noticeboard', category: 'Tools & Utilities', icon: Bell, description: 'School announcements, circulars, and system alerts.' },
  { id: 'certificates', name: 'TC & Certificates', category: 'Tools & Utilities', icon: GraduationCap, description: 'Transfer Certificates, Character & Bonafide slips.' },
  { id: 'idcards', name: 'Smart ID Cards', category: 'Tools & Utilities', icon: CreditCard, description: 'Digital student and staff ID card generator.' },
  { id: 'settings', name: 'System Settings', category: 'Tools & Utilities', icon: Settings, description: 'School profile, academic sessions, and system config.' }
];

const ROLE_CATEGORIES: { id: 'Admin' | 'Teacher' | 'Student' | 'Others'; label: string; roles: UserRole[] }[] = [
  {
    id: 'Admin',
    label: '1. Admin Roles',
    roles: ['Super Admin', 'School Admin', 'Principal', 'Vice Principal']
  },
  {
    id: 'Teacher',
    label: '2. Teacher Roles',
    roles: ['Teacher', 'Class Teacher']
  },
  {
    id: 'Student',
    label: '3. Student & Parent',
    roles: ['Student', 'Parent']
  },
  {
    id: 'Others',
    label: '4. Specialised Staff Roles',
    roles: [
      'Admission Team',
      'Accountant',
      'Timetable Incharge',
      'Reception',
      'HR',
      'Examination Incharge',
      'Transport Department',
      'Read-only Auditor'
    ]
  }
];

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ isOpen, onClose }) => {
  const {
    rolePermissions,
    updateRolePermissions,
    resetRolePermissions,
    roleSubSectionPermissions,
    updateRoleSubSectionPermissions,
    resetRoleSubSectionPermissions,
    addNotification,
    logActivity
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'by_role' | 'by_user' | 'create_user'>('by_role');
  const [roleViewMode, setRoleViewMode] = useState<'subsections' | 'modules'>('subsections');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<'Admin' | 'Teacher' | 'Student' | 'Others'>('Teacher');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Teacher');
  
  // State for selected top modules
  const [currentSelectedModules, setCurrentSelectedModules] = useState<string[]>(
    () => rolePermissions['Teacher'] || ['sis', 'attendance', 'timetable', 'examination', 'lesson_plans', 'communication']
  );

  // State for selected granular sub-sections
  const [currentSelectedSubSections, setCurrentSelectedSubSections] = useState<string[]>(
    () => roleSubSectionPermissions['Teacher'] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS['Teacher'] || []
  );

  // Expanded module accordions in sub-section view
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    timetable: true,
    examination: true,
    attendance: true,
    sis: true
  });

  // User-specific states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserAccount, setSelectedUserAccount] = useState<UserAccount | null>(null);
  const [userSelectedModules, setUserSelectedModules] = useState<string[]>([]);
  const [userSelectedSubSections, setUserSelectedSubSections] = useState<string[]>([]);
  const [userViewMode, setUserViewMode] = useState<'subsections' | 'modules'>('subsections');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create custom user state
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('gdgoenka');
  const [newRole, setNewRole] = useState<UserRole>('Admission Team');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Admissions');
  const [newCustomModules, setNewCustomModules] = useState<string[]>(['admission', 'sis', 'communication']);

  if (!isOpen) return null;

  const isFullAccessRole = selectedRole === 'Super Admin' || selectedRole === 'School Admin' || selectedRole === 'Principal' || selectedRole === 'Vice Principal';

  const handleRoleCategoryChange = (cat: 'Admin' | 'Teacher' | 'Student' | 'Others') => {
    setSelectedRoleCategory(cat);
    const catDef = ROLE_CATEGORIES.find((c) => c.id === cat);
    if (catDef && catDef.roles.length > 0) {
      const firstRole = catDef.roles[0];
      setSelectedRole(firstRole);
      setCurrentSelectedModules(rolePermissions[firstRole] || ALL_MODULE_IDS);
      setCurrentSelectedSubSections(roleSubSectionPermissions[firstRole] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS[firstRole] || []);
    }
    setSaveMessage(null);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setCurrentSelectedModules(rolePermissions[newRole] || ALL_MODULE_IDS);
    setCurrentSelectedSubSections(roleSubSectionPermissions[newRole] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS[newRole] || []);
    setSaveMessage(null);
  };

  const toggleModule = (modId: string) => {
    if (isFullAccessRole) {
      setSaveMessage({
        type: 'error',
        text: '⚠️ Admin roles always have full unrestricted access to all modules.'
      });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setCurrentSelectedModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const toggleSubSection = (subSecId: string) => {
    if (isFullAccessRole) {
      setSaveMessage({
        type: 'error',
        text: '⚠️ Admin roles always have full access to all sub-sections.'
      });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setCurrentSelectedSubSections((prev) => {
      if (prev.includes(subSecId)) {
        return prev.filter((id) => id !== subSecId);
      } else {
        // Also ensure parent module is enabled
        const parentDef = MODULE_SUBSECTIONS_REGISTRY.find((m) =>
          m.subSections.some((s) => s.id === subSecId)
        );
        if (parentDef && !currentSelectedModules.includes(parentDef.id)) {
          setCurrentSelectedModules((mPrev) => [...mPrev, parentDef.id]);
        }
        return [...prev, subSecId];
      }
    });
  };

  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleSelectAllSubSections = () => {
    setCurrentSelectedSubSections([...ALL_SUBSECTION_IDS]);
    setCurrentSelectedModules([...ALL_MODULE_IDS]);
  };

  const handleClearAllSubSections = () => {
    setCurrentSelectedSubSections(['sis_directory', 'comm_notices']);
    setCurrentSelectedModules(['sis', 'communication']);
  };

  const handleApplyTeacherPreset = () => {
    const teacherPresetSubs = [
      'sis_directory',
      'exam_marks_entry',
      'timetable_teacher_view',
      'timetable_substitutions',
      'timetable_round_duty',
      'attendance_classroom',
      'attendance_calendar',
      'lesson_plans_my',
      'comm_notices'
    ];
    const teacherPresetMods = ['sis', 'examination', 'timetable', 'attendance', 'lesson_plans', 'communication'];
    setCurrentSelectedSubSections(teacherPresetSubs);
    setCurrentSelectedModules(teacherPresetMods);
    setSaveMessage({
      type: 'success',
      text: '✨ Applied Teacher View-Only & Classroom Preset (View schedule, relief duties, patrol check-in, marks entry, and student attendance. All admin engines hidden).'
    });
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleSaveRolePermissions = () => {
    updateRolePermissions(selectedRole, currentSelectedModules);
    updateRoleSubSectionPermissions(selectedRole, currentSelectedSubSections);

    logActivity('PERMISSIONS_UPDATED', 'Access Control', `Saved ${currentSelectedModules.length} modules and ${currentSelectedSubSections.length} sub-sections for role ${selectedRole}`);
    addNotification({
      title: 'Role Permissions Saved',
      message: `Updated permissions for ${selectedRole} (${currentSelectedSubSections.length} sub-sections active).`,
      type: 'success',
      module: 'Access Control'
    });

    setSaveMessage({
      type: 'success',
      text: `🟢 Successfully saved granular permissions for "${selectedRole}"!`
    });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // User-specific handler
  const handleSelectUser = (account: UserAccount) => {
    setSelectedUserAccount(account);
    const modOverrides = getUserPermissionOverrides();
    const subOverrides = getUserSubSectionOverrides();

    const userMod = modOverrides[account.username];
    const userSub = subOverrides[account.username];

    if (userMod) {
      setUserSelectedModules(userMod);
    } else {
      setUserSelectedModules(rolePermissions[account.role] || ['sis']);
    }

    if (userSub) {
      setUserSelectedSubSections(userSub);
    } else {
      setUserSelectedSubSections(roleSubSectionPermissions[account.role] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS[account.role] || []);
    }
  };

  const toggleUserModule = (modId: string) => {
    setUserSelectedModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const toggleUserSubSection = (subSecId: string) => {
    setUserSelectedSubSections((prev) => {
      if (prev.includes(subSecId)) {
        return prev.filter((id) => id !== subSecId);
      } else {
        const parentDef = MODULE_SUBSECTIONS_REGISTRY.find((m) =>
          m.subSections.some((s) => s.id === subSecId)
        );
        if (parentDef && !userSelectedModules.includes(parentDef.id)) {
          setUserSelectedModules((mPrev) => [...mPrev, parentDef.id]);
        }
        return [...prev, subSecId];
      }
    });
  };

  const handleSaveUserPermissions = () => {
    if (!selectedUserAccount) return;
    saveUserPermissionOverride(selectedUserAccount.username, userSelectedModules);
    saveUserSubSectionOverride(selectedUserAccount.username, userSelectedSubSections);

    logActivity('USER_PERMISSIONS_OVERRIDE', 'Access Control', `Saved custom sub-section overrides for user ${selectedUserAccount.username}`);
    addNotification({
      title: 'User Permission Saved',
      message: `Updated custom sub-sections for ${selectedUserAccount.displayName}.`,
      type: 'success',
      module: 'Access Control'
    });
    setSaveMessage({
      type: 'success',
      text: `🟢 Saved custom sub-section access for ${selectedUserAccount.displayName}!`
    });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleResetUserPermissions = () => {
    if (!selectedUserAccount) return;
    removeUserPermissionOverride(selectedUserAccount.username);
    removeUserSubSectionOverride(selectedUserAccount.username);
    setUserSelectedModules(rolePermissions[selectedUserAccount.role] || ['sis']);
    setUserSelectedSubSections(roleSubSectionPermissions[selectedUserAccount.role] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS[selectedUserAccount.role] || []);
    setSaveMessage({
      type: 'success',
      text: `Reset ${selectedUserAccount.displayName} to default ${selectedUserAccount.role} permissions.`
    });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Create custom user handler
  const handleCreateCustomUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      alert('Please provide a username.');
      return;
    }
    if (!newDisplayName.trim()) {
      alert('Please provide a display name.');
      return;
    }

    const cleanU = newUsername.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const customUser: UserAccount = {
      id: `usr-custom-${Date.now()}`,
      username: cleanU,
      displayName: newDisplayName.trim(),
      role: newRole,
      defaultPassword: newPassword.trim() || 'gdgoenka',
      currentPassword: newPassword.trim() || 'gdgoenka',
      isPasswordChanged: false,
      category: 'admin_staff',
      email: newEmail.trim() || `${cleanU}@gdgpsagra.edu`,
      department: newDepartment.trim() || 'Staff'
    };

    saveCustomUser(customUser);
    saveUserPermissionOverride(cleanU, newCustomModules);
    logActivity('CREATE_CUSTOM_USER', 'Access Control', `Created custom user ${customUser.username} (${customUser.displayName})`);
    addNotification({
      title: 'New User Account Created',
      message: `User ${customUser.username} created with role ${customUser.role}.`,
      type: 'success',
      module: 'Access Control'
    });

    alert(`✅ User "${customUser.username}" created successfully!\n\nUsername: ${customUser.username}\nPassword: ${customUser.currentPassword}\nRole: ${customUser.role}`);

    setNewUsername('');
    setNewDisplayName('');
    setNewEmail('');
    setActiveTab('by_user');
  };

  const allAccounts = getAllUserAccounts();
  const filteredAccounts = allAccounts.filter((a) =>
    a.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    a.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  ).slice(0, 30);

  const customUsersList = getCustomUsers();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-5xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Granular Permissions & Sub-Section Access Control
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure precise view-only vs admin sub-section powers for Teachers, Class Teachers, Incharges, and Staff.
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

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('by_role')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'by_role'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            1. Permissions by Role (Admin, Teacher, Staff, Student)
          </button>

          <button
            onClick={() => setActiveTab('by_user')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'by_user'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            2. Permissions by Specific User Account
          </button>

          <button
            onClick={() => setActiveTab('create_user')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'create_user'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            3. Create Custom User (Admin)
          </button>
        </div>

        {/* TAB 1: PERMISSIONS BY ROLE */}
        {activeTab === 'by_role' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Top: 4 Primary Categories */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                A. Choose Role Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleRoleCategoryChange(cat.id)}
                    className={`p-2.5 rounded-2xl text-left border text-xs font-bold transition-all cursor-pointer ${
                      selectedRoleCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] opacity-80 uppercase">{cat.id}</div>
                    <div className="text-xs font-black truncate">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Roles under Selected Category */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                B. Select Target Role to Configure:
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLE_CATEGORIES.find((c) => c.id === selectedRoleCategory)?.roles.map((r) => {
                  const isActive = selectedRole === r;
                  const count = isFullAccessRole ? ALL_SUBSECTION_IDS.length : (roleSubSectionPermissions[r] || DEFAULT_ROLE_SUBSECTION_PERMISSIONS[r] || []).length;
                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>{r}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {count} sub-sections
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Mode Toggle: Granular Sub-Sections vs Top-Level Modules */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Configuring Role: <strong className="text-indigo-600 dark:text-indigo-400">{selectedRole}</strong>
                </span>
                {isFullAccessRole ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    🔒 UNRESTRICTED FULL ACCESS
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    ({currentSelectedSubSections.length} of {ALL_SUBSECTION_IDS.length} sub-sections enabled)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex rounded-xl bg-slate-200 dark:bg-slate-700 p-0.5">
                  <button
                    onClick={() => setRoleViewMode('subsections')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      roleViewMode === 'subsections'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" /> Granular Sub-Sections (View vs Admin)
                  </button>
                  <button
                    onClick={() => setRoleViewMode('modules')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      roleViewMode === 'modules'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> High-Level Modules
                  </button>
                </div>

                {!isFullAccessRole && (
                  <>
                    <button
                      onClick={handleApplyTeacherPreset}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 border border-purple-200 cursor-pointer text-xs flex items-center gap-1"
                      title="Apply recommended safe view-only preset for teachers"
                    >
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      Teacher Preset
                    </button>
                    <button
                      onClick={handleSelectAllSubSections}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 border border-indigo-200 cursor-pointer text-xs"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        resetRolePermissions();
                        resetRoleSubSectionPermissions();
                        setCurrentSelectedModules(rolePermissions[selectedRole] || ALL_MODULE_IDS);
                        setCurrentSelectedSubSections(DEFAULT_ROLE_SUBSECTION_PERMISSIONS[selectedRole] || []);
                        setSaveMessage({ type: 'success', text: 'Reset all roles to factory defaults.' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 border border-rose-200 flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* VIEW A: GRANULAR SUB-SECTIONS ACCORDION & CHECKBOXES */}
            {roleViewMode === 'subsections' && (
              <div className="space-y-3">
                {MODULE_SUBSECTIONS_REGISTRY.map((mod) => {
                  const isExpanded = expandedModules[mod.id] ?? false;
                  const activeSubCount = mod.subSections.filter((s) =>
                    isFullAccessRole || currentSelectedSubSections.includes(s.id)
                  ).length;
                  const totalSubs = mod.subSections.length;
                  const isParentActive = isFullAccessRole || currentSelectedModules.includes(mod.id);

                  return (
                    <div
                      key={mod.id}
                      className={`rounded-2xl border transition-all ${
                        isParentActive
                          ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                      }`}
                    >
                      {/* Module Accordion Header */}
                      <div
                        onClick={() => toggleModuleAccordion(mod.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl select-none"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModule(mod.id);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 cursor-pointer"
                          >
                            {isParentActive ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {mod.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {mod.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              activeSubCount === totalSubs
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : activeSubCount > 0
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {activeSubCount} / {totalSubs} sub-sections active
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Sub-Sections List */}
                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-1 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {mod.subSections.map((sub) => {
                              const isSubChecked = isFullAccessRole || currentSelectedSubSections.includes(sub.id);
                              const isViewOnly = sub.description.toLowerCase().includes('view') || sub.name.toLowerCase().includes('view');

                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => toggleSubSection(sub.id)}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                    isSubChecked
                                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/80 shadow-2xs'
                                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  <div className="mt-0.5">
                                    {isSubChecked ? (
                                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                        {sub.name}
                                      </span>
                                      {sub.adminOnly ? (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 whitespace-nowrap">
                                          🔒 ADMIN ONLY
                                        </span>
                                      ) : isViewOnly ? (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 whitespace-nowrap">
                                          👁️ VIEW ONLY
                                        </span>
                                      ) : (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap">
                                          ✏️ ENTRY / DUTY
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                      {sub.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW B: HIGH-LEVEL MODULE TILES */}
            {roleViewMode === 'modules' && (
              <div className="space-y-4">
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
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-indigo-500" />
                                <span>{m.name}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
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
            )}

            {/* STICKY BOTTOM SAVE ACTION BAR */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Selected for <strong>{selectedRole}</strong>: {currentSelectedSubSections.length} sub-sections ({currentSelectedModules.length} parent modules)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRolePermissions}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                >
                  <Save className="w-4 h-4" /> Save Granular Role Permissions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERMISSIONS BY SPECIFIC USER ACCOUNT */}
        {activeTab === 'by_user' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[440px]">
              
              {/* Left Column: User Directory */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search user (e.g. teacher1, student5, admission)..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {filteredAccounts.map((acc) => {
                    const isSelected = selectedUserAccount?.username === acc.username;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectUser(acc)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-extrabold truncate">{acc.displayName}</div>
                          <div className="text-[10px] opacity-75 font-mono">@{acc.username} • {acc.role}</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                          {acc.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Check / Uncheck Sections for Selected User */}
              <div className="md:col-span-2 space-y-3 flex flex-col h-full overflow-hidden">
                {selectedUserAccount ? (
                  <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                          Custom Permissions for {selectedUserAccount.displayName}
                        </h4>
                        <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                          Username: <span className="font-mono font-bold">@{selectedUserAccount.username}</span> • Base Role: <span className="font-bold">{selectedUserAccount.role}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleResetUserPermissions}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 cursor-pointer"
                        >
                          Reset to Default
                        </button>
                        <button
                          onClick={handleSaveUserPermissions}
                          className="px-3 py-1 text-xs font-black rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" /> Save User Access
                        </button>
                      </div>
                    </div>

                    {/* Sub-Sections List for Selected User */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {MODULE_SUBSECTIONS_REGISTRY.map((mod) => (
                        <div key={mod.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {mod.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {mod.subSections.filter((s) => userSelectedSubSections.includes(s.id)).length} / {mod.subSections.length} active
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {mod.subSections.map((sub) => {
                              const isChecked = userSelectedSubSections.includes(sub.id);
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => toggleUserSubSection(sub.id)}
                                  className={`p-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    isChecked
                                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{sub.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                    <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Select a user account from the left directory to inspect or override their specific section permissions.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: CREATE CUSTOM USER (ADMIN) */}
        {activeTab === 'create_user' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <form onSubmit={handleCreateCustomUser} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Admin User Creation Form
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Username (Login ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. admission_lead, hostel_warden"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="e.g. Mr. Sanjay Mishra (Hostel Warden)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                    >
                      <option value="Admission Team">Admission Team</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Timetable Incharge">Timetable Incharge</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Reception">Reception</option>
                      <option value="HR">HR</option>
                      <option value="Examination Incharge">Examination Incharge</option>
                      <option value="Transport Department">Transport Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="gdgoenka"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Checked Modules for this new user */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                  Check Sections Allowed for this New User:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {MODULE_METADATA.map((m) => {
                    const Icon = m.icon;
                    const isChecked = newCustomModules.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setNewCustomModules((prev) =>
                            prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <Icon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-xs font-bold truncate">{m.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create & Register New User Account with Checked Permissions</span>
              </button>
            </form>

            {/* List of Previously Created Custom Users */}
            {customUsersList.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h5 className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Custom Accounts Created by Admin ({customUsersList.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customUsersList.map((u) => (
                    <div key={u.username} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-slate-900 dark:text-white">{u.displayName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">@{u.username} • {u.role}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete custom user "${u.username}"?`)) {
                            deleteCustomUser(u.username);
                            removeUserPermissionOverride(u.username);
                            setSaveMessage({ type: 'success', text: `Deleted custom user ${u.username}` });
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
