import React, { useState } from 'react';
import { SubjectConfig } from '../../types/examination';
import { Plus, BookOpen, Layers } from 'lucide-react';

interface SubjectConfigViewProps {
  subjects: SubjectConfig[];
  onAddSubject: (subject: Omit<SubjectConfig, 'id'>) => void;
  onUpdateSubject: (id: string, fields: Partial<SubjectConfig>) => void;
}

export const SubjectConfigView: React.FC<SubjectConfigViewProps> = ({ subjects, onAddSubject }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SubjectConfig['type']>('Core');
  const [maxMarks, setMaxMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(33);
  const [hasTheory, setHasTheory] = useState(true);
  const [theoryMaxMarks, setTheoryMaxMarks] = useState(80);
  const [hasPractical, setHasPractical] = useState(false);
  const [practicalMaxMarks, setPracticalMaxMarks] = useState(0);
  const [hasInternal, setHasInternal] = useState(true);
  const [internalMaxMarks, setInternalMaxMarks] = useState(20);

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    onAddSubject({
      name,
      code,
      type,
      maxMarks: Number(maxMarks),
      passingMarks: Number(passingMarks),
      hasTheory,
      theoryMaxMarks: hasTheory ? Number(theoryMaxMarks) : 0,
      hasPractical,
      practicalMaxMarks: hasPractical ? Number(practicalMaxMarks) : 0,
      hasInternal,
      internalMaxMarks: hasInternal ? Number(internalMaxMarks) : 0,
      isGradeBasedOnly: false
    });
    setName('');
    setCode('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Subject Catalog & Evaluation Weightages
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Theory, Practical, Internal Assessment, and Passing Criteria for Unlimited Subjects.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Subject Name & Code</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Max Marks</th>
              <th className="py-3 px-4">Passing</th>
              <th className="py-3 px-4">Theory / Practical / Internal Breakdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{sub.name}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{sub.code}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {sub.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{sub.maxMarks}</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">{sub.passingMarks}</td>
                <td className="py-3 px-4 text-xs space-x-2">
                  {sub.hasTheory && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono">Theory: {sub.theoryMaxMarks}</span>}
                  {sub.hasPractical && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-mono">Practical: {sub.practicalMaxMarks}</span>}
                  {sub.hasInternal && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-mono">Internal: {sub.internalMaxMarks}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Subject</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHY-10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Core">Core</option>
                    <option value="Optional">Optional</option>
                    <option value="Vocational">Vocational</option>
                    <option value="Language">Language</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Total Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
