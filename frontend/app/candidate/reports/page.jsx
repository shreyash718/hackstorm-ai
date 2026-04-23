'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchCandidateReports } from '@/lib/api';
import { 
  History, ArrowLeft, Search, Filter, 
  Calendar, Award, ChevronRight, LayoutGrid, List as ListIcon
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateReports() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=candidate/reports');
        return;
      }
      setUser(session.user);
      loadData();
    });
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchCandidateReports();
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.problem_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.hire_recommendation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-8 h-8 border-t-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] text-foreground font-sans transition-colors duration-300">
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 p-4">
        <div className="max-w-6xl mx-auto bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/candidate/dashboard')} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-sm tracking-widest uppercase">Interview History</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 px-6 pb-20">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by problem or result..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 border border-border rounded-2xl p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-background shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-background shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Reports List/Grid */}
        <AnimatePresence mode="popLayout">
          {filteredReports.length > 0 ? (
            <motion.div 
              layout
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
            >
              {filteredReports.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/candidate/reports/${r.id}`)}
                  className={`group bg-white dark:bg-[#111] border border-border rounded-3xl cursor-pointer hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl ${
                    viewMode === 'list' ? 'p-6 flex items-center justify-between' : 'p-6 flex flex-col'
                  }`}
                >
                  <div className={viewMode === 'list' ? 'flex items-center gap-6' : 'mb-6'}>
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-colors ${
                      r.overall_score >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 
                      r.overall_score >= 60 ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      <span className="text-2xl font-black">{r.overall_score}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest">Score</span>
                    </div>
                    
                    <div className={viewMode === 'list' ? '' : 'mt-4'}>
                      <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors mb-1 truncate max-w-[200px]">{r.problem_title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(r.created_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className={`font-bold ${
                          r.hire_recommendation.includes('Strong') ? 'text-emerald-500' : 
                          r.hire_recommendation.includes('No') ? 'text-red-500' : 
                          'text-blue-500'
                        }`}>
                          {r.hire_recommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-border">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Problem Solving</span>
                        <span className="font-bold text-sm">{r.problem_solving}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Code Quality</span>
                        <span className="font-bold text-sm">{r.code_quality}</span>
                      </div>
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="flex items-center gap-8">
                       <div className="hidden lg:grid grid-cols-3 gap-8">
                         <div className="text-center">
                           <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Solving</div>
                           <div className="font-bold text-sm">{r.problem_solving}</div>
                         </div>
                         <div className="text-center">
                           <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Quality</div>
                           <div className="font-bold text-sm">{r.code_quality}</div>
                         </div>
                         <div className="text-center">
                           <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Comm.</div>
                           <div className="font-bold text-sm">{r.communication}</div>
                         </div>
                       </div>
                       <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 opacity-20">
                <History size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">No reports found</h2>
              <p className="text-muted-foreground max-w-xs">Start an interview to see your detailed performance reports here.</p>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
