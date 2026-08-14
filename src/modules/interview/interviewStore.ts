import { useState, useEffect } from 'react';
import { CandidateApplicant, InterviewerRating } from '../../types/interview';
import { INITIAL_CANDIDATES } from '../../data/mockData';
import { syncExitInterviewToSupabase, syncCandidateEvaluationToSupabase } from '../../lib/supabaseSync';

const INTERVIEW_STORAGE_KEY = 'schoolerp_interview_candidates_v1';

export function useInterviewStore() {
  const [candidates, setCandidates] = useState<CandidateApplicant[]>(() => {
    const saved = localStorage.getItem(INTERVIEW_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  useEffect(() => {
    localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(candidates));
  }, [candidates]);

  const addCandidate = (candidate: Omit<CandidateApplicant, 'id' | 'candidateCode' | 'status' | 'overallScore' | 'ratings'>) => {
    const newCand: CandidateApplicant = {
      ...candidate,
      id: `cand-${Date.now()}`,
      candidateCode: `HR-2026-${Math.floor(10 + Math.random() * 90)}`,
      status: 'New',
      overallScore: 0,
      ratings: []
    };
    setCandidates((prev) => [newCand, ...prev]);

    syncCandidateEvaluationToSupabase(newCand);

    return newCand;
  };

  const addRating = (candidateId: string, rating: InterviewerRating) => {
    let updatedCandidate: CandidateApplicant | null = null;
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const updatedRatings = [...c.ratings, rating];
          
          // Calculate overall score out of 100
          let totalScoreAvg = 0;
          updatedRatings.forEach((r) => {
            const s = r.scores;
            const avg =
              (s.subjectKnowledge +
                s.communicationSkills +
                s.classroomManagement +
                s.teachingMethodology +
                s.technologySkills +
                s.confidence +
                s.personality +
                s.studentEngagement +
                s.overallImpression) /
              9;
            totalScoreAvg += avg;
          });

          const finalPercent = Math.round((totalScoreAvg / updatedRatings.length) * 10 * 10) / 10;

          updatedCandidate = {
            ...c,
            ratings: updatedRatings,
            overallScore: finalPercent,
            status: 'In Interview'
          };
          return updatedCandidate;
        }
        return c;
      })
    );

    if (updatedCandidate) {
      syncCandidateEvaluationToSupabase(updatedCandidate);
    }
  };

  const updateCandidateStatus = (candidateId: string, status: CandidateApplicant['status'], extra?: { salary?: number; joiningDate?: string }) => {
    let updatedCandidate: CandidateApplicant | null = null;
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          updatedCandidate = {
            ...c,
            status,
            offeredSalary: extra?.salary ?? c.offeredSalary,
            joiningDate: extra?.joiningDate ?? c.joiningDate
          };
          return updatedCandidate;
        }
        return c;
      })
    );

    if (updatedCandidate) {
      syncCandidateEvaluationToSupabase(updatedCandidate);
    }
  };

  return {
    candidates,
    addCandidate,
    addRating,
    updateCandidateStatus
  };
}
