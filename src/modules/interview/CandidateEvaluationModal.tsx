import React, { useState } from 'react';
import { CandidateApplicant, EvaluationCriteria } from '../../types/interview';
import { X, Award, CheckCircle, Star, UserCheck } from 'lucide-react';

interface CandidateEvaluationModalProps {
  candidate: CandidateApplicant;
  onClose: () => void;
  onSubmitRating: (candidateId: string, rating: any) => void;
}

export const CandidateEvaluationModal: React.FC<CandidateEvaluationModalProps> = ({
  candidate,
  onClose,
  onSubmitRating
}) => {
  const [interviewerNumber, setInterviewerNumber] = useState<1 | 2 | 3 | 4>(1);
  const [interviewerName, setInterviewerName] = useState('Dr. V. K. Sharma (Principal)');
  const [roundName, setRoundName] = useState('Final Panel Interview');

  const [scores, setScores] = useState<EvaluationCriteria>({
    communication: 8,
    personality: 8,
    subjectKnowledge: 8,
    overall: 8
  });

  const [remarks, setRemarks] = useState('');
  const [decision, setDecision] = useState<'Selected' | 'Not Selected' | 'Rejected / Completely Rejected' | 'Hold'>('Selected');

  const handleScoreChange = (key: keyof EvaluationCriteria, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const calculateTotalOutOf40 = () => {
    return scores.communication + scores.personality + scores.subjectKnowledge + scores.overall;
  };

  const calculatePercentage = () => {
    return Math.round((calculateTotalOutOf40() / 40) * 100 * 10) / 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRating(candidate.id, {
      interviewerId: `usr-int-${interviewerNumber}`,
      interviewerName: interviewerName || `Interviewer ${interviewerNumber}`,
      interviewerNumber,
      roundName,
      scores,
      remarks,
      decision,
      date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Candidate Code: {candidate.candidateCode}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Interview Evaluation: {candidate.fullName}
            </h2>
            <p className="text-xs text-slate-500">
              Applied Position: <span className="font-bold text-slate-800 dark:text-slate-200">{candidate.appliedPosition}</span> | Experience: {candidate.totalExperienceYears} Yrs
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Interviewer Number & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Interviewer Slot (1 to 4 Interviewers Panel)
              </label>
              <select
                value={interviewerNumber}
                onChange={(e) => setInterviewerNumber(Number(e.target.value) as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              >
                <option value={1}>Interviewer 1 (Principal / Chair)</option>
                <option value={2}>Interviewer 2 (Subject Specialist)</option>
                <option value={3}>Interviewer 3 (HR Head)</option>
                <option value={4}>Interviewer 4 (Management Observer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Interviewer Name
              </label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Score Matrix Cards */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Candidate Rating Parameters (10 Marks Each)
              </h3>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Score:</span>{' '}
                <strong className="text-base font-black text-blue-600 dark:text-blue-400">
                  {calculateTotalOutOf40()} / 40 ({calculatePercentage()}%)
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'communication', label: '1. Communication Skills' },
                { key: 'personality', label: '2. Personality & Presence' },
                { key: 'subjectKnowledge', label: '3. Subject Knowledge' },
                { key: 'overall', label: '4. Overall Assessment' }
              ].map((param) => {
                const scoreVal = (scores as any)[param.key];
                return (
                  <div key={param.key} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{param.label}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs">
                        {scoreVal} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={scoreVal}
                      onChange={(e) => handleScoreChange(param.key as any, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Decision & Remarks */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Panel Decision Outcome
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-black"
              >
                <option value="Selected">Selected</option>
                <option value="Not Selected">Not Selected</option>
                <option value="Rejected / Completely Rejected">Rejected / Completely Rejected</option>
                <option value="Hold">Hold / Waitlisted</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Interviewer Remarks & Feedback
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write specific feedback regarding candidate communication, subject depth, and interview remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
            >
              Submit Interviewer #{interviewerNumber} Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
