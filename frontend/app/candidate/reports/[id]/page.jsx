'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchCandidateReport } from '@/lib/api';
import { 
  ArrowLeft, Download, Share2, Award, CheckCircle2, 
  XCircle, Zap, Code2, MessageSquare, Terminal, Clock,
  ChevronRight, Brain, Sparkles, AlertCircle
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

export default function CandidateReportDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const data = await fetchCandidateReport(id);
      setReport(data);
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-8 h-8 border-t-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
        <p className="text-muted-foreground mb-6">The report you are looking for does not exist or you do not have permission to view it.</p>
        <button onClick={() => router.push('/candidate/dashboard')} className="px-6 py-2 bg-primary text-background rounded-xl font-bold">Back to Dashboard</button>
      </div>
    );
  }

  const scores = [
    { label: 'Overall', value: report.overall_score, icon: Award, color: 'text-blue-500' },
    { label: 'Problem Solving', value: report.problem_solving, icon: Brain, color: 'text-violet-500' },
    { label: 'Code Quality', value: report.code_quality, icon: Code2, color: 'text-emerald-500' },
    { label: 'Communication', value: report.communication, icon: MessageSquare, color: 'text-amber-500' },
    { label: 'Optimization', value: report.optimization, icon: Zap, color: 'text-orange-500' },
    { label: 'Debugging', value: report.debugging || 0, icon: Terminal, color: 'text-rose-500' },
  ];

  const isHire = report.hire_recommendation.includes('Hire');
  const isStrong = report.hire_recommendation.includes('Strong');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] text-foreground font-sans transition-colors duration-300">
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 p-4">
        <div className="max-w-6xl mx-auto bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <h1 className="font-bold text-xs tracking-widest uppercase hidden sm:block">Detailed Performance Analysis</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"><Download size={20} /></button>
            <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"><Share2 size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 px-6 pb-20">
        
        {/* Top Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111] border border-border rounded-[40px] p-8 md:p-12 shadow-sm dark:shadow-2xl relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full">Interview Result</span>
                <span className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">{report.problem_title || 'Session Analysis'}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8 opacity-80">{report.summary}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Clock size={16} className="text-muted-foreground" /> Complexity: <span className="text-blue-500 font-mono">{report.time_complexity} Time, {report.space_complexity} Space</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className={`p-8 rounded-[32px] flex flex-col items-center text-center shadow-2xl relative ${
                isStrong ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20' :
                isHire ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20' :
                'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/20'
              }`}>
                {isStrong && <Sparkles className="absolute top-4 right-4 text-white/50" size={24} />}
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 opacity-80">VERDICT</div>
                <div className="text-4xl font-black mb-2 leading-none">{report.hire_recommendation.toUpperCase()}</div>
                <div className="text-xs font-medium opacity-70 mb-8">Performance relative to Senior bar</div>
                
                <div className="w-24 h-24 rounded-full border-8 border-white/20 flex items-center justify-center mb-2">
                  <span className="text-4xl font-black">{report.overall_score}</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Overall Score</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {scores.map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#111] border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} className={`h-full ${s.color.replace('text', 'bg')}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#111] border border-border rounded-[32px] p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-xl font-bold">Key Strengths</h3>
            </div>
            <div className="space-y-4">
              {report.strengths?.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-border transition-colors hover:border-emerald-500/30">
                  <span className="text-emerald-500 font-bold text-sm">#0{i+1}</span>
                  <p className="text-sm leading-relaxed opacity-90">{s}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#111] border border-border rounded-[32px] p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <h3 className="text-xl font-bold">Growth Areas</h3>
            </div>
            <div className="space-y-4">
              {report.improvements?.map((imp, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-border transition-colors hover:border-rose-500/30">
                  <span className="text-rose-500 font-bold text-sm">#0{i+1}</span>
                  <p className="text-sm leading-relaxed opacity-90">{imp}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Final Code Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111] border border-border rounded-[32px] overflow-hidden shadow-sm"
        >
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-muted-foreground" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Final Submission</h3>
            </div>
            <button className="text-[10px] font-bold text-blue-500 hover:underline">COPY CODE</button>
          </div>
          <div className="p-8 bg-[#0a0a0a] overflow-x-auto">
            <pre className="font-mono text-sm text-blue-300/90 leading-relaxed">
              <code>{report.final_code || '// No code submitted during this session.'}</code>
            </pre>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
