'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, BrainCircuit, Terminal, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

// Background Animation Component simulating an AI Interview session
const InterviewSimulationAnimation = () => {
  const [step, setStep] = useState(0);

  const sequence = [
    { type: 'ai', text: "Hello! I'll be your AI interviewer today. Let's start with a classic problem: Two Sum." },
    { type: 'code', text: "def two_sum(nums, target):\n    # Initialize a hash map\n    seen = {}" },
    { type: 'ai', text: "Great start. What is the time complexity of using a hash map here?" },
    { type: 'code', text: "    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []" },
    { type: 'ai', text: "Excellent! Your solution is O(N) time and O(N) space. All tests passed. Well done!" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % sequence.length);
    }, 4000); // Switch every 4 seconds
    return () => clearInterval(interval);
  }, [sequence.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-50 dark:bg-[#050505] hidden lg:block transition-colors duration-300">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="w-full max-w-2xl h-[600px] relative">
            
            {/* Header */}
            <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 flex items-center gap-3 text-blue-500 font-mono text-sm tracking-widest font-bold"
            >
                <Terminal size={18} /> INITIALIZING ARENA ENVIRONMENT...
            </motion.div>

            {/* Main Interface */}
            <div className="absolute top-12 left-0 w-full h-[500px] border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl flex flex-col transition-colors duration-300">
                
                <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-white/10 pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Code2 size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white transition-colors">Technical Interview</h2>
                        <p className="text-blue-600 dark:text-blue-400 font-mono text-sm tracking-widest uppercase">Session Active</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
                    <AnimatePresence mode="popLayout">
                        {sequence.slice(0, step + 1).map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className={`p-4 rounded-2xl max-w-[85%] ${
                                    item.type === 'ai' 
                                    ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-gray-800 dark:text-blue-100 self-start'
                                    : 'bg-gray-100 dark:bg-black/60 border border-gray-200 dark:border-white/5 font-mono text-sm text-green-600 dark:text-green-400 self-end shadow-inner whitespace-pre-wrap'
                                }`}
                            >
                                {item.type === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                                        <BrainCircuit size={12}/> AI Interviewer
                                    </div>
                                )}
                                {item.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default function CandidateLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirectInfo, setRedirectInfo] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');
    const id = searchParams.get('id');
    if (redirect && id) {
      setRedirectInfo({ redirect, id });
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! Check your email for confirmation.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (redirectInfo && redirectInfo.redirect === 'problem') {
            router.push(`/interview/${redirectInfo.id}`);
        } else {
            router.push('/');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    let nextPath = '/';
    if (redirectInfo && redirectInfo.redirect === 'problem') {
        nextPath = `/interview/${redirectInfo.id}`;
    }
    window.location.href = `/auth/google?next=${nextPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex relative font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      
      {/* Background Animation Area (Left 50%) */}
      <div className="w-1/2 relative hidden lg:block border-r border-gray-200 dark:border-white/10 transition-colors z-0">
        <InterviewSimulationAnimation />
      </div>

      {/* Login Form Area (Right 50%) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative px-6 z-10">
        
        {/* Subtle background glow for the form side */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <Sparkles className="text-white" size={24}/>
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-widest uppercase transition-colors">
                        Candidate Portal
                    </h1>
                    <p className="text-blue-600 dark:text-blue-400 text-xs font-mono font-bold tracking-widest transition-colors uppercase">Enter the Arena</p>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors">
                    {isSignUp 
                    ? "Create an account to start practicing with our hyper-realistic AI interviewer." 
                    : "Sign in to continue your interview preparation and access your past session reports."}
                </p>

                {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                        <AlertTriangle size={16}/> {error}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-2 tracking-widest uppercase transition-colors">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-black/60 transition-all shadow-sm dark:shadow-inner"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-2 tracking-widest uppercase transition-colors">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-black/60 transition-all shadow-sm dark:shadow-inner"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(59,130,246,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold tracking-widest py-4 rounded-xl transition-all shadow-lg border border-white/10 uppercase"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        {!loading && <ArrowRight size={18} />}
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
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>

        </motion.div>
      </div>
    </div>
  );
}
