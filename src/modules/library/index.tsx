import React from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Book, Search, CheckCircle } from 'lucide-react';

export const LibraryModule: React.FC = () => {
  const { books } = useOtherModulesStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Book className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Library Catalog & Book Circulation
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ISBN book search, issue & return tracking, rack location directory, and overdue fines.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Book Title & ISBN</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Rack Location</th>
              <th className="py-3 px-4">Copies Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {books.map((bk) => (
              <tr key={bk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{bk.title}</p>
                  <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">ISBN: {bk.isbn}</p>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">{bk.author}</td>
                <td className="py-3 px-4 text-xs">{bk.category}</td>
                <td className="py-3 px-4 text-xs font-mono">{bk.rackLocation}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">
                  {bk.copiesAvailable} / {bk.copiesTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
