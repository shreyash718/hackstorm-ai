'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrainCircuit, Clock, Code2, Users, AlertTriangle, CheckCircle2, ChevronRight, Zap, Target } from 'lucide-react';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function RecruiterLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-violet-500/30 overflow-hidden relative transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 bg-amber-400/40 rounded-full pointer-events-none animate-sparkle" style={{animationDelay: '0s'}} />
      <div className="absolute top-[35%] right-[8%] w-1 h-1 bg-yellow-300/30 rounded-full pointer-events-none animate-sparkle" style={{animationDelay: '1.2s'}} />
      <div className="absolute top-[65%] left-[25%] w-1 h-1 bg-amber-300/25 rounded-full pointer-events-none animate-sparkle" style={{animationDelay: '2s'}} />

      {/* Floating Header */}
      <nav className="fixed top-0 w-full z-50 p-6">
        <motion.div 
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-7xl mx-auto bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-red-800 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div>
              <div className="font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 transition-colors">INTERVIEW BLITZ</div>
              <div className="text-[10px] font-bold text-violet-600 dark:text-violet-400 tracking-widest uppercase transition-colors">For Enterprise</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/recruiter/login')}
              className="hidden sm:flex text-sm font-bold bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl transition-all shadow-sm dark:shadow-none"
            >
              Recruiter Login
            </motion.button>
          </div>
        </motion.div>
        {/* Golden shimmer */}
        <div className="max-w-7xl mx-auto mt-1">
          <div className="h-[2px] border-shimmer rounded-full" />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-32 pb-20 max-w-5xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col items-center">
          
          <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 text-xs font-bold tracking-widest uppercase mb-8 transition-colors shadow-sm dark:shadow-none">
            <Zap size={14} /> The Next Generation of Tech Hiring
          </motion.div>

          <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gray-900 dark:text-white transition-colors">
            Stop Wasting Engineering Hours on <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-400">Bad Interviews.</span>
          </motion.h1>
          
          <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed transition-colors">
            Deploy autonomous AI interviewers that evaluate candidates on communication, code quality, and problem-solving in real-time. Scale your technical hiring without sacrificing your engineering team's bandwidth.
          </motion.p>

          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 40px rgba(139,92,246,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/recruiter/login')} 
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold tracking-widest text-sm px-10 py-5 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all uppercase"
            >
              Initialize Workspace <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* The Problem Section */}
      <section className="py-32 px-6 bg-white dark:bg-black/20 border-y border-gray-200 dark:border-white/5 transition-colors relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant} className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white transition-colors">Traditional Hiring is <span className="text-red-500">Broken.</span></h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors">You are losing top candidates to slow processes, and passing bad candidates due to inconsistent human bias.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Code2 size={24} />,
                title: "The LeetCode Illusion",
                desc: "Candidates memorize algorithms but fail at real-world problem solving. Static tests can't measure communication or logic.",
                color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20"
              },
              {
                icon: <Clock size={24} />,
                title: "Burned Engineering Time",
                desc: "Your Senior Engineers waste hundreds of hours conducting initial phone screens instead of shipping critical product features.",
                color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20"
              },
              {
                icon: <AlertTriangle size={24} />,
                title: "Inconsistent Baselines",
                desc: "Human interviewers have varying standards, moods, and biases, leading to inaccurate 'Hire' signals and costly bad hires.",
                color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20"
              }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="bg-gray-50 dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-2xl transition-colors relative overflow-hidden group hover:-translate-y-2 hover:shadow-xl">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color} border ${item.border}`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white transition-colors">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant} className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold tracking-widest uppercase mb-6 transition-colors shadow-sm dark:shadow-none">
              <CheckCircle2 size={14} /> The Interview Blitz Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white transition-colors">Standardized. Scalable. Precise.</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Rep */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 60 }}
              className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 shadow-lg dark:shadow-2xl transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
              
              <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-white/10 pb-4 transition-colors">
                <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Candidate Report Card</div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase transition-colors">Strong Hire</div>
              </div>

              <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2 text-gray-900 dark:text-white transition-colors"><span>Communication</span><span className="text-violet-600 dark:text-violet-400">95/100</span></div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "95%" }} transition={{ duration: 1.5 }} className="h-full bg-violet-500" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2 text-gray-900 dark:text-white transition-colors"><span>Code Quality</span><span className="text-indigo-600 dark:text-indigo-400">88/100</span></div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "88%" }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-indigo-500" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2 text-gray-900 dark:text-white transition-colors"><span>Optimization</span><span className="text-blue-600 dark:text-blue-400">92/100</span></div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "92%" }} transition={{ duration: 1.5, delay: 0.4 }} className="h-full bg-blue-500" />
                    </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl transition-colors">
                <div className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-widest">AI Notes</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic transition-colors">&quot;Candidate clearly articulated their decision to use a Hash Map over a Trie. Handled edge cases seamlessly when prompted.&quot;</p>
              </div>

            </motion.div>

            {/* Text Points */}
            <div className="space-y-12">
              {[
                {
                  icon: <Target />, color: "text-violet-500",
                  title: "Modular Assessments",
                  desc: "Create bespoke interview slates. Combine LeetCode-style algorithms with system design constraints and set strict time limits."
                },
                {
                  icon: <BrainCircuit />, color: "text-indigo-500",
                  title: "Voice-Activated AI Probing",
                  desc: "The AI listens to the candidate's thought process. If they write a suboptimal solution, the AI verbally asks them to optimize for space complexity."
                },
                {
                  icon: <Users />, color: "text-blue-500",
                  title: "Instant Standardized Grading",
                  desc: "Receive a detailed rubric scoring the candidate immediately after the session ends. No more waiting days for interviewer feedback."
                }
              ].map((item, i) => (
                <motion.div 
                  key={i} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                  className="flex gap-6"
                >
                  <div className={`mt-1 w-12 h-12 shrink-0 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center ${item.color} shadow-sm dark:shadow-none transition-colors`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-[3rem] p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/30 blur-[100px] rounded-full"></div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Ready to scale your technical hiring?</h2>
          <p className="text-violet-200 text-lg mb-12 max-w-2xl mx-auto relative z-10">Stop guessing. Start measuring. Build your first technical assessment in under 60 seconds.</p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/recruiter/login')} 
            className="relative z-10 bg-white text-violet-900 font-extrabold tracking-widest text-sm px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all uppercase"
          >
            Access Recruiter HQ
          </motion.button>
        </motion.div>
      </section>

    </div>
  );
}
