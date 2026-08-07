import React, { useState } from 'react';
import { ExaminationType, AssessmentCalculationStrategy } from '../../types/examination';
import { Plus, Trash2, Award, CheckCircle, Calculator, Sliders, Eye } from 'lucide-react';

interface ExamTypesSetupProps {
  examTypes: ExaminationType[];
  onAddExamType: (exam: Omit<ExaminationType, 'id'>) => void;
  onUpdateExamType: (id: string, fields: Partial<ExaminationType>) => void;
  onDeleteExamType: (id: string) => void;
}

export const ExamTypesSetup: React.FC<ExamTypesSetupProps> = ({
  examTypes,
  onAddExamType,
  onUpdateExamType,
  onDeleteExamType
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ExaminationType['category']>('Weekly Test');
  const [weightagePercentage, setWeightagePercentage] = useState(10);
  const [description, setDescription] = useState('');
  const [calculationStrategy, setCalculationStrategy] = useState<AssessmentCalculationStrategy>('Best of N');
  const [bestCount, setBestCount] = useState(2);
  const [displayInReportCard, setDisplayInReportCard] = useState(true);
  const [reportCardSectionGroup, setReportCardSectionGroup] = useState<ExaminationType['reportCardSectionGroup']>('Periodic / Weekly Tests');

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    onAddExamType({
      name,
      code,
      category,
      weightagePercentage: Number(weightagePercentage),
      description,
      calculationStrategy,
      bestCount: calculationStrategy === 'Best of N' ? Number(bestCount) : undefined,
      displayInReportCard,
      reportCardSectionGroup
    });
    setName('');
    setCode('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Configurable Examination Types & Calculation Setup
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Specify whether exams use Best of N (e.g. Best 2 of 10 weekly tests), Average of All, or Weighted Percentage for final report card calculation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Exam Setup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examTypes.map((exam) => (
          <div key={exam.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {exam.code}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {exam.weightagePercentage}% Weightage
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{exam.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{exam.description || 'Custom configured exam pattern'}</p>

              {/* Calculation Strategy Badge */}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-amber-500" /> Calculation:
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {exam.calculationStrategy || 'Weighted Percentage'}
                    {exam.calculationStrategy === 'Best of N' && ` (Best ${exam.bestCount || 2})`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Report Section:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{exam.reportCardSectionGroup || 'Periodic / Weekly Tests'}</strong>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Report Card Display:</span>
                  <button
                    onClick={() => onUpdateExamType(exam.id, { displayInReportCard: !exam.displayInReportCard })}
                    className={`flex items-center gap-1 font-bold ${
                      exam.displayInReportCard !== false ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    {exam.displayInReportCard !== false ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Category: <strong className="text-slate-700 dark:text-slate-300">{exam.category}</strong></span>
              <button
                onClick={() => onDeleteExamType(exam.id)}
                className="text-rose-600 hover:text-rose-700 font-medium p-1 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Create New Exam & Calculation Setup
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Test Series (20 Tests) or Term 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WT-20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Weekly Test">Weekly Test</option>
                    <option value="Objective">Objective</option>
                    <option value="Subjective">Subjective</option>
                    <option value="Practical">Practical</option>
                    <option value="Oral">Oral</option>
                    <option value="Term">Term Exam</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* CALCULATION STRATEGY SELECTION */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  Exam Score Calculation Rule
                </label>

                <select
                  value={calculationStrategy}
                  onChange={(e) => setCalculationStrategy(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Best of N">Best of N Scores (e.g. Best 2 out of 5 tests)</option>
                  <option value="Average of All">Average of All Conducted Tests</option>
                  <option value="Weighted Percentage">Weighted Percentage Allocation (%)</option>
                  <option value="Direct Total">Direct Total Sum of Marks</option>
                </select>

                {calculationStrategy === 'Best of N' && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">Select Best Count (N):</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={bestCount}
                      onChange={(e) => setBestCount(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-slate-900 border border-amber-300 rounded"
                    />
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">highest test scores</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={weightagePercentage}
                    onChange={(e) => setWeightagePercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Report Card Section</label>
                  <select
                    value={reportCardSectionGroup}
                    onChange={(e) => setReportCardSectionGroup(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Periodic / Weekly Tests">Periodic / Weekly Tests</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Internal Assessments">Internal Assessments</option>
                    <option value="Practicals & Oral">Practicals & Oral</option>
                    <option value="Final Overall">Final Overall</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="displayReport"
                  checked={displayInReportCard}
                  onChange={(e) => setDisplayInReportCard(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="displayReport" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Display as individual column / section on official report card
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of exam rules"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow"
                >
                  Save Exam Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

