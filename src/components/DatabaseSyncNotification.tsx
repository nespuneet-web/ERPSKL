import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Volume2, VolumeX, Eye, EyeOff, Settings, X, Sparkles } from 'lucide-react';

export interface DbProgressState {
  active: boolean;
  progress: number; // 0 to 100
  title: string;
  message: string;
  status: 'idle' | 'saving' | 'success' | 'error';
  timestamp?: number;
}

// Global listener pattern for database sync events
type SyncListener = (state: DbProgressState) => void;
const listeners = new Set<SyncListener>();

let currentDbState: DbProgressState = {
  active: false,
  progress: 0,
  title: 'Database Sync Idle',
  message: '',
  status: 'idle'
};

export function triggerDbProgress(
  message: string,
  progressPercent: number = 30,
  status: 'saving' | 'success' | 'error' = 'saving',
  title: string = 'Supabase Database Operation'
) {
  currentDbState = {
    active: true,
    progress: progressPercent,
    title,
    message,
    status,
    timestamp: Date.now()
  };
  listeners.forEach((fn) => fn(currentDbState));

  if (status === 'success' || status === 'error') {
    setTimeout(() => {
      currentDbState = { ...currentDbState, active: false };
      listeners.forEach((fn) => fn(currentDbState));
    }, 4500);
  }
}

export function subscribeDbProgress(listener: SyncListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const STORAGE_NOTIF_SETTINGS_KEY = 'schoolerp_db_notification_settings_v1';

export function getNotifSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_NOTIF_SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    enabled: true,
    showProgressBar: true,
    showToast: true,
    autoHideSeconds: 4
  };
}

export function saveNotifSettings(settings: { enabled: boolean; showProgressBar: boolean; showToast: boolean; autoHideSeconds: number }) {
  try {
    localStorage.setItem(STORAGE_NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export const DatabaseSyncNotification: React.FC = () => {
  const [dbState, setDbState] = useState<DbProgressState>(currentDbState);
  const [settings, setSettings] = useState(getNotifSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeDbProgress((newState) => {
      setDbState({ ...newState });
    });
    return unsubscribe;
  }, []);

  const handleToggleEnable = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveNotifSettings(newSettings);
  };

  const handleToggleProgressBar = () => {
    const newSettings = { ...settings, showProgressBar: !settings.showProgressBar };
    setSettings(newSettings);
    saveNotifSettings(newSettings);
  };

  const handleToggleToast = () => {
    const newSettings = { ...settings, showToast: !settings.showToast };
    setSettings(newSettings);
    saveNotifSettings(newSettings);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full px-2 pointer-events-none space-y-2">
      {/* 1. TOP / FLOATING DB PROGRESS BAR AND TOAST */}
      {settings.enabled && settings.showToast && dbState.active && (
        <div className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/98 text-white border border-indigo-500/40 shadow-2xl rounded-2xl p-4 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                {dbState.status === 'saving' ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                ) : dbState.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  {dbState.title}
                </h4>
                <p className="text-xs font-extrabold text-white mt-0.5">
                  {dbState.message || 'Processing database lifecycle update...'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDbState({ ...dbState, active: false })}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PROGRESS BAR */}
          {settings.showProgressBar && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-indigo-300">
                <span>
                  {dbState.status === 'saving'
                    ? 'Writing to Supabase Database...'
                    : dbState.status === 'success'
                    ? 'Saved in Database.'
                    : 'Sync Error'}
                </span>
                <span>{dbState.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    dbState.status === 'saving'
                      ? 'bg-indigo-500 bg-gradient-to-r from-indigo-500 to-cyan-400 animate-pulse'
                      : dbState.status === 'success'
                      ? 'bg-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${dbState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PERSISTENT FLOATING NOTIFICATION PREFERENCES TOGGLE BUTTON */}
      <div className="pointer-events-auto flex justify-end">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg border transition-all cursor-pointer ${
            settings.enabled
              ? 'bg-slate-900 text-indigo-300 border-indigo-500/40 hover:bg-slate-800'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Toggle System Database Messages & Progress Bar"
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>DB Messages: {settings.enabled ? '🟢 ON' : '🔴 OFF'}</span>
          <Settings className="w-3.5 h-3.5 opacity-70 ml-1" />
        </button>
      </div>

      {/* 3. SETTINGS CONTROL MODAL / DRAWER */}
      {isSettingsOpen && (
        <div className="pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 text-xs text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
            <h4 className="font-extrabold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Database Notification Settings
            </h4>
            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Enable or disable database save progress bars, toast messages, and operation confirmation alerts.
          </p>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
              <span className="font-bold flex items-center gap-2">
                {settings.enabled ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                Database Save System Messages
              </span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggleEnable}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
              <span className="font-bold">Show Live Progress Bar (0-100%)</span>
              <input
                type="checkbox"
                checked={settings.showProgressBar}
                disabled={!settings.enabled}
                onChange={handleToggleProgressBar}
                className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:opacity-50"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
              <span className="font-bold">Show "Saved in Database" Banner Toast</span>
              <input
                type="checkbox"
                checked={settings.showToast}
                disabled={!settings.enabled}
                onChange={handleToggleToast}
                className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:opacity-50"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => {
                triggerDbProgress('Information saved in Database.', 100, 'success', 'Database Write');
                setIsSettingsOpen(false);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] rounded-xl shadow cursor-pointer"
            >
              Test Database Saved Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
