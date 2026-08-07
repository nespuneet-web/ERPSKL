import React from 'react';
import { useSettingsStore } from './settingsStore';
import { Settings, Shield, Sliders, Globe, Database } from 'lucide-react';
import { SupabaseCloudHub } from '../../components/SupabaseCloudHub';

export const SettingsModule: React.FC = () => {
  const { profile, updateProfile } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            System Configuration & School Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure school profile, academic sessions, board affiliations, Supabase cloud database, and Vercel hosting parameters.
          </p>
        </div>
      </div>

      {/* Supabase Database & Vercel Deployment Manager Hub */}
      <SupabaseCloudHub />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};

