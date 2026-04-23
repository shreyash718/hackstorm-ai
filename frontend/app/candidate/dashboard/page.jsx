'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchCandidateProgress, fetchTargetCompany, fetchCandidateReports } from '@/lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  LayoutDashboard, History, Target, TrendingUp, Award, Clock, 
  ArrowRight, ChevronRight, Brain, Zap, MessageSquare, ShieldCheck,
  TrendingDown, Minus, Trophy, Star
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [reports, setReports] = useState([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=candidate/dashboard');
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });
  }, []);

  const loadData = async (userId) => {
    try {
      const [progressData, reportsData] = await Promise.all([
        fetchCandidateProgress(userId),
        fetchCandidateReports(userId)
      ]);
      setProgress(progressData);
      setReports(reportsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }} 
          className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  const radarData = progress?.skill_gaps ? Object.entries(progress.skill_gaps).map(([skill, gap]) => ({
    subject: skill.charAt(0).toUpperCase() + skill.slice(1).replace('_', ' '),
    A: 100 + gap, // Gap is candidate - required, so 100+gap shows candidate score relative to required (where 100 is benchmark)
    fullMark: 100,
  })) : [];

  const latestReport = reports[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] text-foreground font-sans transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-4">
        <div className="max-w-7xl mx-auto bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm transition-colors">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-sm tracking-widest cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Brain size={16} className="text-white" />
              </div>
              HACKSTORM
            </div>
            <div className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <ChevronRight size={14} /> Dashboard
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-28 px-4 pb-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Readiness & Target */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Target Company Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#111] border border-border rounded-3xl p-6 shadow-sm dark:shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Company</h3>
                  <div className="text-2xl font-bold">{progress?.target_company || 'Not Set'}</div>
                  <div className="text-sm text-muted-foreground">{progress?.target_level || 'Set a target to track readiness'}</div>
                </div>
                <button 
                  onClick={() => router.push('/candidate/target')}
                  className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Target size={20} />
                </button>
              </div>

              <div className="flex items-end gap-4 mb-4 relative z-10">
                <div className="text-6xl font-black text-blue-500">{progress?.current_readiness}%</div>
                <div className="pb-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Readiness</div>
                  <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                    <TrendingUp size={14} /> +12% since last month
                  </div>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${progress?.current_readiness}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Deterministic weighted score based on latest interview performance vs {progress?.target_company} benchmarks.</p>
            </motion.div>

            {/* Skill Gaps Radar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#111] border border-border rounded-3xl p-6 shadow-sm dark:shadow-2xl"
            >
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Skill Breakdown</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} />
                    <Radar
                      name="Candidate"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {progress?.skill_gaps && Object.entries(progress.skill_gaps).map(([skill, gap]) => (
                  <div key={skill} className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase truncate">
                      {skill.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-bold flex items-center gap-1 ${gap >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {gap >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {gap >= 0 ? '+' : ''}{gap}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Center Column - Progress Graph & History */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Progress History Graph */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#111] border border-border rounded-3xl p-6 shadow-sm dark:shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Readiness Over Time</h3>
                  <div className="text-sm font-medium">Tracking your journey to {progress?.target_company || 'Dream Company'}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Readiness</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progress?.history || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="readiness_score" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Latest Interview & Reports List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Latest Result Quick View */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#111] border border-border rounded-3xl p-6 shadow-sm dark:shadow-2xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Latest Result</h3>
                  <Award size={18} className="text-blue-500" />
                </div>

                {latestReport ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xl font-bold mb-1 truncate">{latestReport.problem_title}</div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          latestReport.hire_recommendation.includes('Strong') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          latestReport.hire_recommendation.includes('No') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {latestReport.hire_recommendation.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(latestReport.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Overall</div>
                          <div className="text-2xl font-black text-primary">{latestReport.overall_score}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Solving</div>
                          <div className="text-2xl font-black text-primary">{latestReport.problem_solving}</div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => router.push(`/candidate/reports/${latestReport.id}`)}
                      className="w-full py-3 bg-primary text-background rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      View Full Report <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Zap size={32} className="text-muted-foreground mb-4 opacity-20" />
                    <p className="text-sm text-muted-foreground mb-4">No interviews completed yet.</p>
                    <button onClick={() => router.push('/')} className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline">Start Practice</button>
                  </div>
                )}
              </motion.div>

              {/* Quick History List */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#111] border border-border rounded-3xl p-6 shadow-sm dark:shadow-2xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">History</h3>
                  <History size={18} className="text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto max-h-[200px] pr-2 scrollbar-hide">
                  {reports.length > 0 ? reports.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => router.push(`/candidate/reports/${r.id}`)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-sm">
                          {r.overall_score}
                        </div>
                        <div>
                          <div className="text-sm font-bold group-hover:text-blue-500 transition-colors truncate max-w-[120px]">{r.problem_title}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  )) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Empty history</div>
                  )}
                </div>

                {reports.length > 0 && (
                  <button 
                    onClick={() => router.push('/candidate/reports')}
                    className="w-full mt-4 py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border pt-4"
                  >
                    VIEW ALL REPORTS
                  </button>
                )}
              </motion.div>

            </div>

          </div>

        </div>

        {/* Bottom AI Recommendations Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-3xl rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                <Zap size={14} className="text-yellow-400" /> AI Growth Analysis
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight">You&apos;re getting closer to {progress?.target_company || 'your target'}!</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6 opacity-90">
                Your problem-solving skills have improved by 15% this week. To hit the benchmark for {progress?.target_company || 'Senior roles'}, 
                we recommend focusing on <b>Dynamic Programming</b> and explaining your <b>Space Complexity</b> tradeoffs more clearly during the intro phase.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <ShieldCheck size={16} className="text-emerald-400" /> High Confidence in: Arrays, Two-Pointer
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <TrendingDown size={16} className="text-yellow-400" /> Practice more: Sliding Window
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button 
                onClick={() => router.push('/')}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                Recommended Next Problem <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
