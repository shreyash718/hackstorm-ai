'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { checkRecruiter, fetchRecruiterAssessments } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus, Copy, CheckCircle2, Link as LinkIcon, Users, Calendar, Code2, Sparkles, Activity } from 'lucide-react';
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

export default function RecruiterDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/recruiter/login');
        return;
      }
      setUser(session.user);

      try {
        const checkData = await checkRecruiter();
        if (!checkData.is_recruiter) {
          throw new Error("Not authorized as recruiter.");
        }

        const data = await fetchRecruiterAssessments();
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const copyToClipboard = (id) => {
    const url = `${window.location.origin}/assessment/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center text-violet-500 font-mono tracking-widest relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mr-3" />
        DECRYPTING CLEARANCE...
      </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="text-4xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">ACCESS DENIED</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md transition-colors">{error}</p>
      <button onClick={() => { supabase.auth.signOut(); router.push('/recruiter/login'); }} className="mt-8 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-6 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10 shadow-sm">
        Return to Login
      </button>
    </div>
  );

  // Quick stats calculations
  const totalAssessments = assessments.length;
  const totalQuestions = assessments.reduce((acc, curr) => acc + curr.question_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-32 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Header */}
      <div className="fixed top-0 w-full z-50 p-4">
        <motion.div 
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-6xl mx-auto bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-2xl transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            <div className="flex items-center gap-2">
                <span className="font-bold tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 transition-colors">RECRUITER HQ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-gray-500 hidden sm:flex transition-colors">
              <Users size={12}/> {user.email}
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 transition-colors" />
            <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              SIGN OUT
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto mt-32 px-6 relative z-10">
        
        {/* Dashboard Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">Command Center</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md transition-colors">Oversee your active technical assessments, generate candidate links, and monitor interview results.</p>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-colors shadow-sm dark:shadow-none">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 transition-colors">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Active Links</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{totalAssessments}</div>
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/recruiter/assessment/new')}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg border border-white/10 h-full"
                >
                    <Plus size={18} /> NEW ASSESSMENT
                </motion.button>
            </div>
        </motion.div>

        {/* Assessments List */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-6">
            {assessments.length === 0 ? (
                <motion.div variants={fadeUpVariant} className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-violet-500/10 blur-[100px] pointer-events-none" />
                    <Sparkles size={48} className="mx-auto text-violet-500/50 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No Assessments Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto transition-colors">Your workspace is currently empty. Create your first technical assessment to start evaluating candidates.</p>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/recruiter/assessment/new')}
                        className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-bold tracking-widest text-sm bg-violet-100 dark:bg-violet-500/10 hover:bg-violet-200 dark:hover:bg-violet-500/20 px-8 py-3 rounded-full transition-colors border border-violet-200 dark:border-violet-500/20"
                    >
                        + INITIALIZE FIRST ASSESSMENT
                    </motion.button>
                </motion.div>
            ) : (
                assessments.map((assessment) => (
                    <motion.div variants={fadeUpVariant} whileHover={{ scale: 1.01 }} key={assessment.id} className="group bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md dark:shadow-2xl relative overflow-hidden transition-all hover:border-violet-500/30 dark:hover:border-violet-500/30">
                        {/* Glow indicator */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="mb-6 md:mb-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3 transition-colors">
                                {assessment.title}
                            </h2>
                            <div className="flex flex-wrap gap-4 text-xs font-mono font-bold">
                                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5 transition-colors">
                                    <Code2 size={12} className="text-blue-500 dark:text-blue-400"/> {assessment.question_count} Challenges
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5 transition-colors">
                                    <Calendar size={12} className="text-yellow-600 dark:text-yellow-400"/> Created {new Date(assessment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => copyToClipboard(assessment.id)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all border ${
                                    copiedId === assessment.id 
                                    ? 'bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                                    : 'bg-white dark:bg-black/40 border-gray-300 dark:border-white/10 text-gray-700 dark:text-white hover:border-violet-300 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10'
                                }`}
                            >
                                {copiedId === assessment.id ? (
                                    <><CheckCircle2 size={14} /> LINK COPIED</>
                                ) : (
                                    <><LinkIcon size={14} /> COPY INVITE LINK</>
                                )}
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                                onClick={() => router.push(`/recruiter/assessment/${assessment.id}/results`)}
                                className="flex-1 md:flex-none px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-bold text-xs transition-colors shadow-sm dark:shadow-none"
                            >
                                VIEW RESULTS
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
