import React, { useState, useEffect } from 'react';
import {
  Database,
  Globe,
  Copy,
  Check,
  Download,
  Server,
  Zap,
  ExternalLink,
  ShieldCheck,
  Code,
  FileText,
  Sparkles,
  RefreshCw,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getSupabaseCredentials,
  testSupabaseConnection,
  saveSupabaseConfig,
  clearSupabaseConfig,
  supabase
} from '../lib/supabase';
import { runLiveSupabaseTrial, runFullDatabaseSynchronization } from '../lib/supabaseSync';
import { SUPABASE_FULL_SQL_SCHEMA } from '../data/supabase_schema';

export const SupabaseCloudHub: React.FC = () => {
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);

  const [testingStatus, setTestingStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false
  });

  const [trialRunning, setTrialRunning] = useState(false);
  const [trialResult, setTrialResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleRunTrialTest = async () => {
    setTrialRunning(true);
    setTrialResult(null);
    const res = await runLiveSupabaseTrial();
    setTrialRunning(false);
    setTrialResult({
      success: res.success,
      message: res.message,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleTestConnection = async () => {
    setTestingStatus({ loading: true });
    const res = await testSupabaseConnection();
    setTestingStatus({ loading: false, success: res.success, message: res.message });
  };

  useEffect(() => {
    // Auto test connection on mount to show green signal
    if (supabaseUrl && supabaseKey) {
      handleTestConnection();
    }
  }, []);

  const handleSaveConfig = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Please enter both Supabase Project URL and Anon API Key.');
      return;
    }
    saveSupabaseConfig(supabaseUrl, supabaseKey);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_FULL_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_FULL_SQL_SCHEMA], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase_school_erp_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const envSnippet = `# Supabase Live Database Credentials
VITE_SUPABASE_URL="${supabaseUrl || 'https://your-project.supabase.co'}"
VITE_SUPABASE_ANON_KEY="${supabaseKey || 'your-anon-key'}"
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleSyncLocalToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Please configure and test your Supabase credentials first.');
      return;
    }

    setSyncingData(true);
    setSyncResult(null);

    try {
      const res = await runFullDatabaseSynchronization();
      if (res.success) {
        setSyncResult('✅ Successfully synchronized all Web ERP tables (students, staff, student_academic_permissions, fees, attendance, etc.) to Supabase Cloud Database!');
      } else {
        setSyncResult(`⚠️ Database Sync Notice: ${res.errorDetails || 'Make sure you ran the SQL Schema script in Supabase first.'}`);
      }
    } catch (err: any) {
      setSyncResult(`⚠️ Sync Error: ${err.message || 'Make sure you ran the SQL Schema script in Supabase first.'}`);
    } finally {
      setSyncSyncingFalse();
    }
  };

  const setSyncSyncingFalse = () => {
    setTimeout(() => setSyncingData(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Auto-Generated Free Cloud Database
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Globe className="w-3 h-3 text-indigo-400" /> Vercel Ready
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-indigo-400" /> Supabase Database & Vercel.app Integration Hub
          </h2>
          <p className="text-xs text-slate-300">
            Automatically create all database tables for Student Info (SIS), Examinations, Timetable, Staff, Fees, and deploy directly to <strong>vercel.app</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" /> Open Supabase
          </a>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 shadow transition-all flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-sky-400" /> Open Vercel
          </a>
        </div>
      </div>

      {/* GRID SECTION: SUPABASE CONNECTIVITY & VERCEL INSTRUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: SUPABASE LIVE CREDENTIALS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" /> Supabase Database Credentials
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isSupabaseConfigured ? 'Connected / Active' : 'Supabase Database Configured'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL:
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzabcdef.supabase.co"
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Anon API Key:
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer transition-all"
              >
                Save Credentials
              </button>

              <button
                onClick={handleTestConnection}
                disabled={testingStatus.loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                {testingStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
                Test Database Ping
              </button>

              {localStorage.getItem('school_erp_supabase_url') && (
                <button
                  onClick={clearSupabaseConfig}
                  className="px-3 py-2 text-rose-600 hover:text-rose-700 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {testingStatus.message && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  testingStatus.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
                }`}
              >
                {testingStatus.message}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 dark:text-white font-extrabold flex items-center gap-1.5 text-xs">
                    <Zap className="w-4 h-4 text-emerald-500" /> Perform Live DB Trial Test
                  </strong>
                  <span className="text-[11px] text-slate-500">Writes a test student entry directly to Supabase & verifies destination receipt</span>
                </div>

                <button
                  onClick={handleRunTrialTest}
                  disabled={trialRunning}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                >
                  {trialRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
                  {trialRunning ? 'Testing...' : 'Run Live Trial Test'}
                </button>
              </div>

              {trialResult && (
                <div className={`p-3.5 rounded-xl border text-xs font-bold space-y-1 ${
                  trialResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-700'
                    : 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-100 dark:border-rose-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{trialResult.message}</span>
                    <span className="text-[10px] opacity-75 font-mono">{trialResult.timestamp}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900 dark:text-white font-extrabold">Synchronize Database (डेटाबेस सिंक्रोनाइज़ेशन)</strong>
                <span className="text-[11px] text-slate-500">Create tables & save all front-end changes directly into Supabase live database</span>
              </div>

              <button
                onClick={handleSyncLocalToSupabase}
                disabled={syncingData}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                {syncingData ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Synchronize Database
              </button>
            </div>

            {syncResult && (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                {syncResult}
              </p>
            )}
          </div>
        </div>

        {/* PANEL 2: VERCEL DEPLOYMENT ENGINE */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-500" /> Vercel Deployment Manager (vercel.app)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              `vercel.json` Configured
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Deploy your School ERP to <strong>vercel.app</strong> in seconds. The included <code>vercel.json</code> auto-configures single-page routing (SPA) and Vite build settings.
            </p>

            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-bold text-sky-400">
                  <Terminal className="w-3.5 h-3.5" /> Deploy via Vercel CLI
                </span>
                <span>Command Line</span>
              </div>
              <p className="text-emerald-400">$ npm i -g vercel</p>
              <p className="text-white">$ vercel --prod</p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Environment Variables for Vercel:</span>
                <button
                  onClick={handleCopyEnv}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEnv ? 'Copied' : 'Copy Env Vars'}
                </button>
              </div>
              <textarea
                readOnly
                value={envSnippet}
                rows={3}
                className="w-full p-2.5 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FULL AUTOMATED SUPABASE SQL SCHEMA SCRIPT GENERATOR */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-600" /> 1-Click Automated Supabase Database SQL Script (टेबल जनरेटर)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generates all database tables automatically: <strong>students, staff, timetables, examinations, student_marks, fee_collections, daily_attendance, admission_leads, transport_routes, library_books</strong> with pre-seeded data & RLS policies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopySql}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              {copiedSql ? '✓ Copied SQL to Clipboard!' : '1. Copy SQL Script'}
            </button>

            <a
              href={`https://supabase.com/dashboard/project/${supabaseUrl.replace('https://', '').split('.')[0] || 'sxsuebbwgeqkqyxfqvnt'}/sql/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> 2. Open Supabase SQL Editor ↗
            </a>

            <button
              onClick={handleDownloadSql}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" /> Download `schema.sql`
            </button>
          </div>
        </div>

        {/* 3 EASY STEPS BANNER */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-2">
          <p className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm">
            ⚡ केवल 3 आसान स्टेप्स में Supabase में सारे टेबल्स खुद ही बनायें (3 Easy Steps to Create All Database Tables):
          </p>
          <ol className="list-decimal list-inside space-y-1 font-semibold text-emerald-800 dark:text-emerald-300">
            <li>ऊपर हरे रंग वाले <strong>"1. Copy SQL Script"</strong> बटन पर क्लिक करें। (स्क्रिप्ट क्लिपबोर्ड पर कॉपी हो जाएगी)</li>
            <li>नीले रंग के <strong>"2. Open Supabase SQL Editor ↗"</strong> बटन पर क्लिक करके सीधे अपने Supabase डैशबोर्ड पर जाएँ।</li>
            <li>वहाँ बक्से में Paste (Ctrl + V) करें और <strong>"Run"</strong> (या Ctrl + Enter) दबा दें! सारे 10+ टेबल्स तुरंत बन जायेंगे।</li>
          </ol>
        </div>

        {/* SQL SCRIPT PREVIEW */}
        <div className="relative">
          <textarea
            readOnly
            value={SUPABASE_FULL_SQL_SCHEMA}
            rows={14}
            className="w-full p-4 font-mono text-[11px] bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
