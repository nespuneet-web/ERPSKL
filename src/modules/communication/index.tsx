import React from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Bell, MessageSquare, Send } from 'lucide-react';

export const CommunicationModule: React.FC = () => {
  const { notices } = useOtherModulesStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Communication & Digital Noticeboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Broadcast school announcements, circulars, SMS notifications, and parent alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map((nt) => (
          <div key={nt.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                Audience: {nt.targetAudience}
              </span>
              <span className="text-xs font-mono text-slate-400">{nt.publishDate}</span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-base">{nt.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{nt.content}</p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              Published By: <strong className="text-slate-700 dark:text-slate-300">{nt.publishedBy}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
