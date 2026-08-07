import React, { useState } from 'react';
import { useInterviewStore } from './interviewStore';
import { CandidateEvaluationModal } from './CandidateEvaluationModal';
import { CandidateApplicant } from '../../types/interview';
import { Briefcase, Award, Search, Plus, CheckCircle, Video, FileText, UserCheck } from 'lucide-react';

export const InterviewModule: React.FC = () => {
  const { candidates, addCandidate, addRating, updateCandidateStatus } = useInterviewStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<CandidateApplicant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Candidate Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [appliedPosition, setAppliedPosition] = useState('PGT Mathematics');
  const [subjectExpertise, setSubjectExpertise] = useState('');
  const [highestQualification, setHighestQualification] = useState('M.Sc, B.Ed.');
  const [totalExperienceYears, setTotalExperienceYears] = useState(5);
  const [expectedSalary, setExpectedSalary] = useState(60000);

  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.candidateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = selectedPosition === 'All' || cand.appliedPosition === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    addCandidate({
      fullName,
      email,
      phone,
      appliedPosition,
      subjectExpertise,
      highestQualification,
      totalExperienceYears: Number(totalExperienceYears),
      expectedSalary: Number(expectedSalary),
      currentSalary: 50000,
      noticePeriodDays: 30,
      resumeUrl: '#'
    });

    setFullName('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Interview Panel & HR Recruitment Module
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Multi-round panel evaluation, teaching demo scoring matrix, candidate rankings, and offer releases.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Applicant Profile
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Candidate Name, Position, HR Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="All">All Applied Positions</option>
            <option value="PGT Physics">PGT Physics</option>
            <option value="PGT Mathematics">PGT Mathematics</option>
            <option value="TGT Computer Science">TGT Computer Science</option>
            <option value="PRT English">PRT English</option>
          </select>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((cand) => (
            <div key={cand.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {cand.candidateCode}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">{cand.fullName}</h3>
                  <p className="text-xs text-slate-500">{cand.appliedPosition} • {cand.totalExperienceYears} Yrs Exp</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Score</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {cand.overallScore > 0 ? `${cand.overallScore}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p><strong>Qualification:</strong> {cand.highestQualification}</p>
                <p><strong>Expertise:</strong> {cand.subjectExpertise}</p>
                <p><strong>Expected Salary:</strong> ₹{cand.expectedSalary.toLocaleString()} / Month</p>
              </div>

              {/* Panel Ratings List */}
              {cand.ratings.length > 0 && (
                <div className="space-y-2 border-t pt-3 border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Panel Member Ratings ({cand.ratings.length} Submissions)
                  </p>
                  {cand.ratings.map((r, i) => (
                    <div key={i} className="text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Interviewer #{r.interviewerNumber || (i + 1)}: {r.interviewerName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            r.decision === 'Selected'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.decision === 'Not Selected' || r.decision === 'Rejected / Completely Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {r.decision || 'Evaluated'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center bg-white dark:bg-slate-900 p-1.5 rounded border">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Comm</span>
                          <strong>{r.scores?.communication ?? 8}/10</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Person</span>
                          <strong>{r.scores?.personality ?? 8}/10</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Subject</span>
                          <strong>{r.scores?.subjectKnowledge ?? 8}/10</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Overall</span>
                          <strong className="text-blue-600">{r.scores?.overall ?? 8}/10</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">"{r.remarks}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <select
                  value={cand.status}
                  onChange={(e) => updateCandidateStatus(cand.id, e.target.value as any)}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 border rounded text-slate-800 dark:text-slate-200"
                >
                  <option value="New">New Lead</option>
                  <option value="In Interview">In Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Offer Released">Offer Released</option>
                  <option value="Joined">Joined</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => setSelectedCandidateModal(cand)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  <Award className="w-3.5 h-3.5" /> Rate Candidate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCandidateModal && (
        <CandidateEvaluationModal
          candidate={selectedCandidateModal}
          onClose={() => setSelectedCandidateModal(null)}
          onSubmitRating={(id, rating) => addRating(id, rating)}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Candidate Application</h3>
            <form onSubmit={handleAddCandidate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Applied Position</label>
                <select
                  value={appliedPosition}
                  onChange={(e) => setAppliedPosition(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="PGT Physics">PGT Physics</option>
                  <option value="PGT Mathematics">PGT Mathematics</option>
                  <option value="TGT Computer Science">TGT Computer Science</option>
                  <option value="PRT English">PRT English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
