import React, { useState } from 'react';
import { useSettingsStore } from './settingsStore';
import { useAuth, ALL_MODULE_IDS } from '../../context/AuthContext';
import { Settings, ShieldCheck, Globe, Lock, Save, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { SupabaseCloudHub } from '../../components/SupabaseCloudHub';
import { UserRole } from '../../types/common';
import { RolePermissionsModal } from '../../components/RolePermissionsModal';

export const SettingsModule: React.FC = () => {
  const { profile, updateProfile } = useSettingsStore();
  const { rolePermissions, updateRolePermissions, resetRolePermissions, activeRole } = useAuth();
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            System Configuration & School Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure school profile, module access permissions per role, Supabase cloud database, and system parameters.
          </p>
        </div>

        <button
          onClick={() => setIsPermissionsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:from-indigo-700 hover:to-purple-700"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Manage Module Permissions</span>
        </button>
      </div>

      {/* Supabase Database & Vercel Deployment Manager Hub */}
      <SupabaseCloudHub />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Access Control Overview Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Active Role Access Summary
            </h3>
            <button
              onClick={() => setIsPermissionsModalOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Configure Rights →
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current role access matrix enforcing sidebar visibility and endpoint protection across all 20 modules:
          </p>

          <div className="space-y-2">
            {[
              { role: 'Student' as UserRole, desc: 'Student Portal, Attendance, Timetable, Exams, Library, Noticeboard, ID Cards' },
              { role: 'Teacher' as UserRole, desc: 'Class Directory, Attendance, Timetable, Lesson Plans, Exam Marks Entry, Library' },
              { role: 'Parent' as UserRole, desc: 'Child Info, Attendance, Timetable, Exams, Fees, Transport, Noticeboard' },
              { role: 'Accountant' as UserRole, desc: 'Fees & Ledger, Financial Analytics, SIS, Certificates' },
              { role: 'Super Admin' as UserRole, desc: 'Full System Control (All 20 ERP Modules Enabled)' }
            ].map((item) => {
              const allowed = rolePermissions[item.role] || [];
              const count = item.role.includes('Admin') ? 20 : allowed.length;

              return (
                <div key={item.role} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{item.role}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-[11px] shrink-0">
                    {count} Modules
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* School Profile Config */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" /> School Identity Profile
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
              <input
                type="text"
                value={profile.schoolName}
                onChange={(e) => updateProfile({ schoolName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliation Board</label>
                <input
                  type="text"
                  value={profile.affilNo}
                  onChange={(e) => updateProfile({ affilNo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">School Code</label>
                <input
                  type="text"
                  value={profile.schoolCode}
                  onChange={(e) => updateProfile({ schoolCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => updateProfile({ address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <RolePermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />
    </div>
  );
};


