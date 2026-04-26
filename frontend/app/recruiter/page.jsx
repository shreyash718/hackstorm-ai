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
      <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>
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
          <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] opacity-20 mix-blend-overlay pointer-events-none"></div>
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
