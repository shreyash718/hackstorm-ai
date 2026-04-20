'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { API_URL } from '@/lib/api';

import { motion } from 'framer-motion';

export default function AssessmentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [candidateName, setCandidateName] = useState('');
  
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`${API_URL}/assessment/${params.id}`);
        if (!res.ok) throw new Error("Assessment not found or invalid link.");
        const data = await res.json();
        setAssessment(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [params.id]);

  const handleStart = (e) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    // Store candidate details in local storage for the interview session
    localStorage.setItem('assessment_candidate', JSON.stringify({
      assessment_id: params.id,
      candidate_name: candidateName,
      assessment_data: assessment,
      current_q_index: 0
    }));

    router.push(`/assessment/${params.id}/interview`);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-secondary font-mono tracking-widest"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mr-3" />LOADING ASSESSMENT...</div>;
  if (error) return <div className="min-h-screen bg-background flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center"><div className="text-4xl mb-4">⚠️</div><h1 className="text-2xl font-bold mb-2">INVALID LINK</h1><p className="text-secondary max-w-md">{error}</p></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-primary transition-colors duration-300 relative overflow-hidden p-6">
      
      {/* Background decoration */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-surface border border-muted p-8 rounded-xl shadow-2xl relative z-10 text-center"
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}
          className="w-16 h-16 bg-violet-500/10 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        >
          <span className="text-2xl text-violet-500">⚡</span>
        </motion.div>
        
        <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
        <p className="text-secondary text-sm mb-8">
          This assessment contains {assessment.questions.length} technical challenge(s). You will be required to write code and optionally explain your thought process to our AI Interviewer.
        </p>

        <form onSubmit={handleStart} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-xs font-bold text-secondary mb-1">CANDIDATE FULL NAME</label>
            <input
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-background border border-muted rounded-lg px-4 py-3 text-primary outline-none focus:border-violet-500 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(139,92,246,0.4)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white font-bold tracking-widest py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-violet-500/20"
          >
            START ASSESSMENT →
          </motion.button>
        </form>
        
        <div className="mt-6 text-xs text-secondary border-t border-muted pt-6 text-left space-y-2">
            <div className="font-bold mb-3">ASSESSMENT GUIDELINES:</div>
            <ul className="list-disc pl-4 space-y-1">
                <li>Ensure you have a stable internet connection.</li>
                <li>Each question has a strict time limit.</li>
                <li>Your code and explanations will be recorded.</li>
            </ul>
        </div>
      </motion.div>
    </div>
  );
}
