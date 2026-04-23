'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchBenchmarks, setTargetCompany, fetchTargetCompany } from '@/lib/api';
import { 
  Target, ArrowLeft, ChevronRight, Search, Building2, 
  Briefcase, GraduationCap, CheckCircle2, Sparkles
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function TargetSelection() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [benchmarks, setBenchmarks] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=candidate/target');
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });
  }, []);

  const loadData = async (userId) => {
    try {
      const [benchData, targetData] = await Promise.all([
        fetchBenchmarks(),
        fetchTargetCompany(userId)
      ]);
      setBenchmarks(benchData);
      setCurrentTarget(targetData);
      if (targetData) {
        setSelectedCompany(targetData.company_name);
        setSelectedRole(targetData.role);
        setSelectedLevel(targetData.target_level);
      }
    } catch (err) {
      console.error('Error loading target data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCompany || !selectedRole || !selectedLevel) {
      alert('Please select all options');
      return;
    }

    setSaving(true);
    try {
      await setTargetCompany({
        user_id: user.id,
        company_name: selectedCompany,
        role: selectedRole,
        target_level: selectedLevel
      });
      router.push('/candidate/dashboard');
    } catch (err) {
      alert('Failed to save target company');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-8 h-8 border-t-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  // Get unique companies from benchmarks
  const companies = [...new Set(benchmarks.map(b => b.company_name))];
  const roles = [...new Set(benchmarks.filter(b => b.company_name === selectedCompany).map(b => b.role))];
  const levels = [...new Set(benchmarks.filter(b => b.company_name === selectedCompany && b.role === selectedRole).map(b => b.level))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] text-foreground font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 p-4">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm transition-colors">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-32 px-6 pb-20 relative z-10">
        
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} /> Journey Configuration
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">Where are you heading?</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Set your target company and role to get precise readiness scoring and AI-driven growth tips tailored to their bar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Selection Panels */}
          <div className="space-y-6">
            
            {/* Company Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">1. Select Company</label>
              <div className="grid grid-cols-2 gap-3">
                {companies.map(company => (
                  <button
                    key={company}
                    onClick={() => { setSelectedCompany(company); setSelectedRole(''); setSelectedLevel(''); }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${
                      selectedCompany === company 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10' 
                      : 'bg-white dark:bg-white/5 border-border hover:border-blue-500/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedCompany === company ? 'bg-blue-500 text-white' : 'bg-muted group-hover:bg-blue-500/20 group-hover:text-blue-500'
                    }`}>
                      <Building2 size={16} />
                    </div>
                    <span className="font-bold text-sm">{company}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <AnimatePresence mode="wait">
              {selectedCompany && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">2. Target Role</label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(role => (
                      <button
                        key={role}
                        onClick={() => { setSelectedRole(role); setSelectedLevel(''); }}
                        className={`px-6 py-3 rounded-xl border font-bold text-xs transition-all ${
                          selectedRole === role 
                          ? 'bg-primary text-background border-primary' 
                          : 'bg-white dark:bg-white/5 border-border hover:border-primary/50'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level Selection */}
            <AnimatePresence mode="wait">
              {selectedRole && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">3. Experience Level</label>
                  <div className="flex flex-wrap gap-2">
                    {levels.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`px-6 py-3 rounded-xl border font-bold text-xs transition-all ${
                          selectedLevel === level 
                          ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20' 
                          : 'bg-white dark:bg-white/5 border-border hover:border-violet-500/50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Preview Card */}
          <div className="relative">
            <div className="sticky top-32">
              <motion.div 
                layout
                className="bg-white dark:bg-[#111] border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">Career Target</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                      <Building2 size={24} className={selectedCompany ? 'text-primary' : 'text-muted-foreground opacity-30'} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">Company</div>
                      <div className="text-lg font-bold">{selectedCompany || 'Select a company...'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                      <Briefcase size={24} className={selectedRole ? 'text-primary' : 'text-muted-foreground opacity-30'} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">Role</div>
                      <div className="text-lg font-bold">{selectedRole || 'Select a role...'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                      <GraduationCap size={24} className={selectedLevel ? 'text-primary' : 'text-muted-foreground opacity-30'} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">Level</div>
                      <div className="text-lg font-bold">{selectedLevel || 'Select a level...'}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-2xl border border-border mb-8">
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    By setting this target, HackStorm AI will compare your future interview performance against actual {selectedCompany || 'Big Tech'} standards for {selectedRole || 'Engineering'} positions.
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !selectedLevel}
                  className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    saving || !selectedLevel 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-primary text-background shadow-xl hover:opacity-90 active:scale-95'
                  }`}
                >
                  {saving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-4 h-4 border-2 border-background border-t-transparent rounded-full" />
                  ) : (
                    <>Confirm Target Journey <CheckCircle2 size={18} /></>
                  )}
                </button>
              </motion.div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
