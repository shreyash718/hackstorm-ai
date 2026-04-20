'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.user?.id) {
          await fetch('http://localhost:8000/recruiter/make', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: data.user.id })
          });
        }
        
        alert('Account created! You can now sign in.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const res = await fetch(`http://localhost:8000/recruiter/check/${data.user.id}`);
        const checkData = await res.json();
        
        if (!checkData.is_recruiter) {
          await fetch('http://localhost:8000/recruiter/make', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: data.user.id })
          });
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/recruiter/dashboard`,
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
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
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>

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
