'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { checkRecruiter } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Search, Code2, Sparkles, UserCheck } from 'lucide-react';

// Background Animation Component simulating a Recruiter analyzing candidates
const CandidateScannerAnimation = () => {
  const [candidateIndex, setCandidateIndex] = useState(0);

  const candidates = [
    { name: "Alex R.", role: "Senior Rust Engineer", code: "fn optimize_mem() -> Result<()>", score: 98 },
    { name: "Sarah M.", role: "Frontend Architect", code: "const app = useMemo(() => build())", score: 95 },
    { name: "David K.", role: "Go Systems Dev", code: "go func() { handleReq() }()", score: 92 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCandidateIndex((prev) => (prev + 1) % candidates.length);
    }, 8000); // Switch candidate every 8 seconds
    return () => clearInterval(interval);
  }, [candidates.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-50 dark:bg-[#050505] hidden lg:block transition-colors duration-300">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
      
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="w-full max-w-2xl h-[600px] relative">
            
            {/* Header */}
            <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 flex items-center gap-3 text-violet-500 font-mono text-sm tracking-widest font-bold"
            >
                <Search size={18} /> INITIATING CANDIDATE SCAN...
            </motion.div>

            {/* Main Scanning Interface */}
            <div className="absolute top-12 left-0 w-full h-[500px] border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl flex flex-col justify-between transition-colors duration-300">
                
                {/* Scanning Laser Line */}
                <motion.div 
                    animate={{ y: [0, 430, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-8 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.8)] z-50"
                />

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={candidateIndex}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-lg">
                                    <UserCheck size={32} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">{candidates[candidateIndex].name}</h2>
                                    <p className="text-violet-600 dark:text-violet-400 font-mono tracking-wider">{candidates[candidateIndex].role}</p>
                                </div>
                            </div>
                            
                            <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }}
                                className="w-24 h-24 rounded-full border-4 border-green-500/30 flex items-center justify-center relative bg-green-500/10"
                            >
                                <span className="text-2xl font-bold text-green-400">{candidates[candidateIndex].score}</span>
                                <div className="absolute -bottom-3 bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Match</div>
                            </motion.div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-6">
                            <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden transition-colors">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-500 tracking-widest uppercase mb-4">
                                    <Code2 size={14}/> Live Code Analysis
                                </div>
                                <motion.div 
                                    initial={{ height: 0 }} animate={{ height: "auto" }} transition={{ duration: 2 }}
                                    className="font-mono text-sm text-green-600 dark:text-green-400 overflow-hidden whitespace-nowrap"
                                >
                                    {"> "} {candidates[candidateIndex].code}
                                    <br/>
                                    <span className="text-gray-500">{"// Time Complexity: O(1)"}</span>
                                    <br/>
                                    <span className="text-gray-500">{"// Space Complexity: O(1)"}</span>
                                    <br/>
                                    <span className="text-blue-500 dark:text-blue-400">{"[✓] All tests passed."}</span>
                                </motion.div>
                            </div>

                            <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden transition-colors">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-500 tracking-widest uppercase mb-4">
                                    <BrainCircuit size={14}/> AI Interviewer Notes
                                </div>
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
                                    className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-colors"
                                >
                                    "Candidate demonstrated excellent problem-solving skills. They communicated their thought process clearly before writing code. Handled edge cases without prompting."
                                </motion.div>
                            </div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }}
                            className="mt-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-sm"
                        >
                            <CheckCircle2 size={18} /> Candidate Recommended for Hire
                        </motion.div>

                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
      </div>
    </div>
  );
};

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! Ask an admin to grant recruiter access before signing in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const checkData = await checkRecruiter();
        if (!checkData.is_recruiter) {
          await supabase.auth.signOut();
          throw new Error('Your account does not have recruiter access yet.');
        }
        
        router.push('/recruiter/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // Navigate to the OAuth initiator page which sets localStorage + starts Google flow
    window.location.href = '/auth/google?next=/recruiter/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex relative font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      
      {/* Background Animation Area (Left 50%) */}
      <div className="w-1/2 relative hidden lg:block border-r border-gray-200 dark:border-white/10 transition-colors">
        <CandidateScannerAnimation />
      </div>

      {/* Login Form Area (Right 50%) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative px-6 z-10">
        
        {/* Subtle background glow for the form side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>

        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full max-w-md"
        >
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                    <Sparkles className="text-white" size={24}/>
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-widest uppercase transition-colors">
                        Recruiter HQ
                    </h1>
                    <p className="text-violet-600 dark:text-violet-400 text-xs font-mono font-bold tracking-widest transition-colors">SECURE ACCESS</p>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors">
                    {isSignUp 
                    ? "Initialize your recruiter workspace to start deploying AI-powered technical assessments." 
                    : "Authenticate to manage your technical assessments and review candidate analysis."}
                </p>

                {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                        ⚠️ {error}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-2 tracking-widest uppercase transition-colors">Work Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:bg-gray-50 dark:focus:bg-black/60 transition-all shadow-sm dark:shadow-inner"
                            placeholder="recruiter@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-2 tracking-widest uppercase transition-colors">Security Key</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:bg-gray-50 dark:focus:bg-black/60 transition-all shadow-sm dark:shadow-inner"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(139,92,246,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold tracking-widest py-4 rounded-xl transition-all shadow-lg border border-white/10"
                    >
                        {loading ? 'PROCESSING...' : (isSignUp ? 'INITIALIZE WORKSPACE' : 'AUTHENTICATE')}
                    </motion.button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-white/10"></div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">OR</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-white/10"></div>
                </div>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold tracking-widest py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm uppercase text-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </motion.button>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                    }}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white text-xs font-bold tracking-widest transition-colors uppercase"
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Are you a recruiter? Sign Up here"}
                </button>
            </div>

        </motion.div>
      </div>
    </div>
  );
}
