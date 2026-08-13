import { useState, useEffect } from 'react';
import { CandidateApplicant, InterviewerRating } from '../../types/interview';
import { INITIAL_CANDIDATES } from '../../data/mockData';
import { syncExitInterviewToSupabase } from '../../lib/supabaseSync';

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

    syncExitInterviewToSupabase({
      candidateName: newCand.fullName,
      department: newCand.subjectExpertise || 'Academic',
      designation: newCand.appliedPosition,
      feedbackNotes: `Applied for ${newCand.appliedPosition}`,
      rating: 'New Application',
      status: 'New'
    });

    return newCand;
  };

  const addRating = (candidateId: string, rating: InterviewerRating) => {
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

          return {
            ...c,
            ratings: updatedRatings,
            overallScore: finalPercent,
            status: 'In Interview'
          };
        }
        return c;
      })
    );
  };

  const updateCandidateStatus = (candidateId: string, status: CandidateApplicant['status'], extra?: { salary?: number; joiningDate?: string }) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            status,
            offeredSalary: extra?.salary ?? c.offeredSalary,
            joiningDate: extra?.joiningDate ?? c.joiningDate
          };
        }
        return c;
      })
    );
  };

  return {
    candidates,
    addCandidate,
    addRating,
    updateCandidateStatus
  };
}
