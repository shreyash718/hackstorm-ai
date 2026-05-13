'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchAssessmentResults } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, FileText, ArrowLeft, Star, Award, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function AssessmentResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { id: assessmentId } = params;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/recruiter/login');
        return;
      }
      setUser(session.user);

      try {
        const data = await fetchAssessmentResults(assessmentId);
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [assessmentId, router]);

  if (loading) return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center text-violet-500 font-mono tracking-widest relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mr-3" />
        ANALYZING CANDIDATE DATA...
      </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="text-4xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">ACCESS DENIED</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md transition-colors">{error}</p>
      <button onClick={() => router.push('/recruiter/dashboard')} className="mt-8 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-6 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10 shadow-sm">
        Return to Dashboard
      </button>
    </div>
  );

  const getScoreColor = (score) => {
    if (!score) return "text-gray-400";
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getRecommendationBadge = (rec) => {
    if (!rec) return <span className="bg-gray-100 dark:bg-white/5 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-white/10">PENDING</span>;
    const isStrong = rec.toLowerCase().includes('strong');
    const isHire = rec.toLowerCase().includes('hire') && !rec.toLowerCase().includes('no');
    
    if (isStrong) return <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]">STRONG HIRE</span>;
    if (isHire) return <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">HIRE</span>;
    return <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">NO HIRE</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-32 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Header */}
      <div className="fixed top-0 w-full z-50 p-4">
        <motion.div 
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-6xl mx-auto bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-2xl transition-colors"
        >
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/recruiter/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300"/>
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            <div className="flex items-center gap-2">
                <span className="font-bold tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 transition-colors">ASSESSMENT RESULTS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 transition-colors" />
            <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              SIGN OUT
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto mt-32 px-6 relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">Candidate Telemetry</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md transition-colors">Review AI-evaluated interview sessions and technical performance metrics for this assessment.</p>
        </motion.div>

        {/* Results List */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-4">
            {results.length === 0 ? (
                <motion.div variants={fadeUpVariant} className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm dark:shadow-2xl transition-colors">
                    <Search size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Candidates Evaluated</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">Candidates who complete this assessment will appear here with their detailed AI evaluations.</p>
                </motion.div>
            ) : (
                results.map((result) => (
                    <motion.div variants={fadeUpVariant} whileHover={{ scale: 1.01 }} key={result.session_id} className="group bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm dark:shadow-2xl relative overflow-hidden transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30">
                        {/* Glow indicator */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex-1 mb-4 md:mb-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 transition-colors">
                                <Users size={16} className="text-indigo-500"/>
                                {result.candidate_name || "Anonymous Candidate"}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-xs font-mono font-bold text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-black/40 px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/5">
                                    <FileText size={12} className="text-blue-500"/> {result.problem_title || "Unknown Problem"}
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-black/40 px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/5">
                                    <Calendar size={12} className="text-yellow-600 dark:text-yellow-500"/> {new Date(result.started_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                            
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Score</span>
                                <div className={`text-2xl font-black ${getScoreColor(result.overall_score)} flex items-baseline gap-1`}>
                                    {result.overall_score ? result.overall_score.toFixed(1) : '-'}
                                    <span className="text-sm font-bold text-gray-400 dark:text-gray-600">/10</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center min-w-[100px]">
                                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">Decision</span>
                                {getRecommendationBadge(result.hire_recommendation)}
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                                disabled={!result.report_id}
                                onClick={() => router.push(`/admin/dashboard?report=${result.report_id}`)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${result.report_id ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-white/5 cursor-not-allowed'}`}
                            >
                                <Award size={14} /> FULL REPORT
                            </motion.button>

                        </div>
                    </motion.div>
                ))
            )}
        </motion.div>
      </div>
    </div>
  );
}
