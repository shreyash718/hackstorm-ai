import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchProblem } from '../services/interviewApi';

const PHASES = {
  PLANNING: { id: 'PLANNING', name: 'Approach & Planning', duration: 5 * 60, next: 'CODING' },
  CODING: { id: 'CODING', name: 'Implementation', duration: 20 * 60, next: 'REVIEW' },
  REVIEW: { id: 'REVIEW', name: 'Review & Follow-up', duration: 5 * 60, next: null }
};

export default function useInterviewSession(problemId) {
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('PLANNING');
  const [timeLeft, setTimeLeft] = useState(PHASES.PLANNING.duration);
  const [loading, setLoading] = useState(true);
  const [voiceMode, setVoiceMode] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });
  }, [router]);

  useEffect(() => {
    if (!problemId) return;
    setLoading(true);
    fetchProblem(problemId)
      .then(data => {
        setProblem(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [problemId]);

  const startTimer = useCallback((onPhaseChange) => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextPhaseId = PHASES[currentPhase].next;
          if (nextPhaseId) {
            setCurrentPhase(nextPhaseId);
            if (onPhaseChange) onPhaseChange(nextPhaseId);
            return PHASES[nextPhaseId].duration;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentPhase]);

  return {
    problem,
    user,
    currentPhase,
    timeLeft,
    loading,
    voiceMode,
    setVoiceMode,
    startTimer,
    PHASES
  };
}
