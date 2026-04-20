'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { API_URL } from '@/lib/api';
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
        // Ensure user is registered as recruiter (handles Google OAuth users)
        const checkRes = await fetch(`${API_URL}/recruiter/check/${session.user.id}`);
        const checkData = await checkRes.json();
        
        if (!checkData.is_recruiter) {
          await fetch(`${API_URL}/recruiter/make`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: session.user.id })
          });
        }

        const res = await fetch(`${API_URL}/recruiter/assessments/${session.user.id}`);
        if (!res.ok) {
            if(res.status === 403) throw new Error("Not authorized as recruiter.");
            throw new Error("Failed to load assessments.");
        }
        const data = await res.json();
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
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mr-3" />
        DECRYPTING CLEARANCE...
      </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
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
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
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
