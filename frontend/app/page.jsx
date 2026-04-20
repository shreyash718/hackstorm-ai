'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProblems, startSession } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Bot, Code2, Sparkles, ArrowRight, Mic, Filter, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

const DIFFICULTY_COLORS = {
  Easy: { bg: '#1a3a2a', text: '#4ade80', border: '#166534' },
  Medium: { bg: '#3a2a0a', text: '#fbbf24', border: '#92400e' },
  Hard: { bg: '#3a0a0a', text: '#f87171', border: '#991b1b' },
};

// Framer Motion Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const slideInLeftVariant = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 70, damping: 20 } }
};

export default function Home() {
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
      
      // Handle fallback redirects if Supabase ignores the redirectTo param
      if (session?.user) {
        const redirectPath = localStorage.getItem('redirectAfterAuth');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterAuth');
          router.push(redirectPath);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const redirectPath = localStorage.getItem('redirectAfterAuth');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterAuth');
          router.push(redirectPath);
        }
      }
    });

    fetchProblems()
      .then((data) => {
        setProblems(data);
        setLoadingProblems(false);
      })
      .catch((err) => {
        console.error('Failed to fetch problems', err);
        setLoadingProblems(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = async (id) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const session = await startSession(id);
      localStorage.setItem('interview_session', JSON.stringify(session));
      router.push(`/interview/${id}`);
    } catch (e) {
      alert("Failed to start session. Is the backend running?");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // -------------------------------------------------------------
  // STATE: LOADING AUTH
  // -------------------------------------------------------------
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }} 
          className="w-8 h-8 rounded-full border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: LOGGED OUT (LANDING PAGE)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans selection:bg-blue-500/30 overflow-hidden relative transition-colors duration-300">
        
        {/* Navbar */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute top-0 w-full p-6 flex justify-between items-center z-50"
        >
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code2 size={18} className="text-white" />
            </div>
            HackStorm <span className="text-blue-500">AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')} 
              className="text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Sign In
            </motion.button>
          </div>
        </motion.nav>

        {/* Ambient Glow Effects */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" 
        />

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
          
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col items-center">
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-sm font-medium mb-8">
              <Sparkles size={14} />
              <span>The future of technical interviewing</span>
            </motion.div>

            <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Pass your next tech interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-400 dark:to-violet-500">Hyper-Realistic AI.</span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Practice algorithmic coding challenges with a conversational AI interviewer that thinks, probes, and gives senior-level feedback in real-time.
            </motion.p>

            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 60px rgba(59,130,246,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')} 
                className="group relative flex items-center justify-center gap-2 bg-primary text-background font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-colors"
              >
                Start Interviewing <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={20} /></motion.div>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 bg-surface hover:bg-muted border border-muted text-primary font-medium text-lg px-8 py-4 rounded-xl transition-colors"
              >
                See how it works
              </motion.button>
            </motion.div>
          </motion.div>

          {/* The Problem vs Solution Section */}
          <div id="features" className="mt-32 w-full max-w-6xl mx-auto pb-32 text-left">
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Grinding LeetCode is <span className="text-red-500">Broken.</span></h2>
              <p className="text-secondary text-lg max-w-3xl mx-auto">
                You can memorize 500 algorithms, but when a real Senior Engineer asks you <i>"Why did you choose a Hash Map over a Trie?"</i>, you freeze. Real interviews aren't just about passing test cases—they are about <b>communication</b>, <b>trade-offs</b>, and <b>collaboration</b>.
              </p>
            </motion.div>

            {/* Workflow Timeline */}
            <div className="relative border-l-2 border-muted ml-4 md:ml-12 space-y-24 pb-12">
              
              {/* Step 1 */}
              <motion.div 
                variants={slideInLeftVariant}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-12 md:pl-20"
              >
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="absolute -left-[25px] top-0 w-12 h-12 bg-background border-2 border-muted rounded-full flex items-center justify-center font-bold text-xl text-secondary shadow-lg">1</motion.div>
                <div className="bg-surface/80 backdrop-blur-md border border-muted p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-bold tracking-widest mb-4">THE ARENA</div>
                      <h3 className="text-2xl font-bold mb-4">Choose Your Battlefield</h3>
                      <p className="text-secondary leading-relaxed mb-6">
                        Log in and select from a curated database of real-world Data Structures and Algorithms questions. Every question is loaded into a high-fidelity workspace with constraints and dynamic test cases.
                      </p>
                    </div>
                    <div className="flex-1 w-full bg-background border border-muted rounded-xl p-4 font-mono text-xs text-text-muted">
                      <div className="flex justify-between items-center mb-2 border-b border-muted pb-2">
                        <span className="text-primary">PROBLEM BANK</span>
                      </div>
                      <div className="space-y-2">
                        <motion.div whileHover={{ x: 5 }} className="p-2 bg-surface rounded flex justify-between"><span className="text-blue-500 dark:text-blue-400">Two Sum</span> <span className="text-green-500 dark:text-green-400">EASY</span></motion.div>
                        <motion.div whileHover={{ x: 5 }} className="p-2 bg-surface rounded flex justify-between"><span className="text-blue-500 dark:text-blue-400">Valid Parentheses</span> <span className="text-green-500 dark:text-green-400">EASY</span></motion.div>
                        <motion.div whileHover={{ x: 5 }} className="p-2 bg-surface rounded flex justify-between"><span className="text-blue-500 dark:text-blue-400">LRU Cache</span> <span className="text-red-500 dark:text-red-400">HARD</span></motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                variants={slideInLeftVariant}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-12 md:pl-20"
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -left-[25px] top-0 w-12 h-12 bg-background border-2 border-blue-500 rounded-full flex items-center justify-center font-bold text-xl text-blue-500 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">2</motion.div>
                <div className="bg-surface/80 backdrop-blur-md border border-blue-500/30 p-8 rounded-2xl hover:border-blue-500 transition-colors shadow-xl shadow-blue-500/10">
                  <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 rounded bg-violet-500/10 text-violet-500 dark:text-violet-400 text-xs font-bold tracking-widest mb-4">THE SIMULATION</div>
                      <h3 className="text-2xl font-bold mb-4">Voice-Powered Pair Programming</h3>
                      <p className="text-secondary leading-relaxed">
                        This is not a sterile text box. Your AI interviewer will introduce the problem, listen to your approach via microphone, and ask probing questions if you take a suboptimal path. 
                        Code in Python, C++, or Java directly in the browser while explaining your logic out loud.
                      </p>
                    </div>
                    <div className="flex-1 w-full relative">
                      <div className="bg-[#1e1e1e] border border-muted rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-[#2d2d2d] px-4 py-2 border-b border-[#3e3e3e] flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="p-4 font-mono text-xs text-blue-300">
                          <span className="text-pink-400">def</span> <span className="text-green-300">solve</span>(nums):<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-400"># Interviewer: "What is the time complexity of this approach?"</span><br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> nums
                        </div>
                      </div>
                      {/* Floating Mic */}
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.8)]">
                        <Mic size={20} className="text-white" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                variants={slideInLeftVariant}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-12 md:pl-20"
              >
                <motion.div whileHover={{ scale: 1.2, rotate: -10 }} className="absolute -left-[25px] top-0 w-12 h-12 bg-background border-2 border-muted rounded-full flex items-center justify-center font-bold text-xl text-secondary shadow-lg">3</motion.div>
                <div className="bg-surface/80 backdrop-blur-md border border-muted p-8 rounded-2xl hover:border-emerald-500/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest mb-4">THE VERDICT</div>
                      <h3 className="text-2xl font-bold mb-4">Actionable Analytics</h3>
                      <p className="text-secondary leading-relaxed">
                        When the session ends, the AI evaluates your entire transcript and code submission. 
                        You receive a brutal but fair breakdown of your <b>Communication</b>, <b>Code Quality</b>, and <b>Optimization</b> skills, along with a final "Hire" or "No Hire" recommendation.
                      </p>
                    </div>
                    <div className="flex-1 w-full bg-background border border-muted rounded-xl p-6 text-left">
                      <h4 className="text-xl font-bold text-primary mb-4">Report Card</h4>
                      <div className="space-y-3 mb-6">
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span className="text-secondary">Communication</span><span className="text-emerald-600 dark:text-emerald-400">90/100</span></div>
                          <div className="w-full h-1.5 bg-muted rounded-full">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: "90%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-emerald-500 rounded-full"></motion.div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span className="text-secondary">Code Quality</span><span className="text-blue-600 dark:text-blue-400">75/100</span></div>
                          <div className="w-full h-1.5 bg-muted rounded-full">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: "75%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-blue-500 rounded-full"></motion.div>
                          </div>
                        </div>
                      </div>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        whileInView={{ scale: 1, opacity: 1 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600 dark:text-emerald-400 text-sm font-bold text-center uppercase tracking-widest"
                      >
                        Hire Recommendation: Strong Yes
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
            
            {/* Bottom CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <h3 className="text-2xl font-bold mb-6">Ready to stop grinding and start talking?</h3>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 40px rgba(59,130,246,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')} 
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-colors"
              >
                Create Free Account
              </motion.button>
            </motion.div>

          </div>

        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: LOGGED IN (DASHBOARD)
  // -------------------------------------------------------------
  
  const filteredProblems = problems.filter(p => difficultyFilter === 'All' || p.difficulty === difficultyFilter);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-32 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Header */}
      <div className="fixed top-0 w-full z-50 p-4">
        <motion.div 
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-6xl mx-auto bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-2xl transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code2 size={16} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 transition-colors">HACKSTORM AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-gray-500 hidden sm:flex transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {user.email}
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 transition-colors" />
            <button onClick={handleSignOut} className="text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              SIGN OUT
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto pt-32 px-6 relative z-10">
        
        {/* Dashboard Header & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">Welcome to the Arena.</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md transition-colors">Select a technical challenge to begin your hyper-realistic AI interview session.</p>
            </div>
            
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-2 flex items-center shadow-sm dark:shadow-none transition-colors">
                <div className="px-3 flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest border-r border-gray-200 dark:border-white/10 mr-2 transition-colors">
                    <Filter size={14}/> Sort
                </div>
                {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                    <button 
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            difficultyFilter === diff 
                            ? (diff === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : diff === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : diff === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]')
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                        {diff.toUpperCase()}
                    </button>
                ))}
            </div>
        </motion.div>

        {/* Problems List */}
        <div className="mb-12">
          <div className="text-[11px] tracking-[0.3em] text-gray-400 mb-6 pl-2 font-bold uppercase">PROBLEM BANK</div>
          
          {loadingProblems ? (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center text-gray-500 flex flex-col items-center shadow-sm dark:shadow-2xl transition-colors">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mb-4" />
              <span className="font-bold tracking-widest text-sm text-violet-500">DECRYPTING ALGORITHMS...</span>
            </div>
          ) : filteredProblems.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm dark:shadow-2xl transition-colors">
               <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No matches found</div>
               <p className="text-gray-500">Try adjusting your difficulty filter.</p>
             </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-4">
              {filteredProblems.map((p, i) => {
                const isEasy = p.difficulty === 'Easy';
                const isMedium = p.difficulty === 'Medium';
                
                return (
                  <motion.div
                    key={p.id}
                    variants={fadeUpVariant}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleStart(p.id)}
                    className="group bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer shadow-sm dark:shadow-2xl relative overflow-hidden transition-all hover:border-blue-500/30 dark:hover:border-blue-500/30"
                  >
                    {/* Glow indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        isEasy ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-gray-400 dark:text-gray-500 text-xs font-mono w-8 bg-gray-100 dark:bg-black/40 py-1 text-center rounded border border-gray-200 dark:border-white/5 transition-colors">
                                    {String(p.id).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {p.title}
                                </h3>
                            </div>
                            
                            {p.tags && p.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 ml-12">
                                    {p.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold tracking-widest uppercase bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-white/10 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 ml-12 md:ml-0">
                            <span
                                className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-md border transition-colors ${
                                    isEasy 
                                    ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                                    : isMedium 
                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' 
                                    : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                }`}
                            >
                                {p.difficulty.toUpperCase()}
                            </span>
                            
                            <motion.button 
                                whileHover={{ scale: 1.1, x: 5 }}
                                className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 opacity-50 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            >
                                <ArrowRight size={16} />
                            </motion.button>
                        </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
