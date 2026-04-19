'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus, Trash2, Save, ArrowLeft, Clock, Tag, Code2, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_LANGUAGES = [
  { id: 'python', label: 'Python', color: 'border-blue-500 text-blue-500 bg-blue-500/10' },
  { id: 'js', label: 'JavaScript', color: 'border-yellow-500 text-yellow-500 bg-yellow-500/10' },
  { id: 'go', label: 'Go', color: 'border-cyan-500 text-cyan-500 bg-cyan-500/10' },
  { id: 'rust', label: 'Rust', color: 'border-orange-500 text-orange-500 bg-orange-500/10' },
  { id: 'java', label: 'Java', color: 'border-red-500 text-red-500 bg-red-500/10' },
  { id: 'cpp', label: 'C++', color: 'border-indigo-500 text-indigo-500 bg-indigo-500/10' }
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{
    id: 1,
    title: '',
    difficulty: 'Medium',
    description: '',
    constraints: '',
    tags: '',
    examples: '[\n  {\n    "input": "",\n    "output": ""\n  }\n]',
    allowed_languages: ['python', 'js', 'go', 'rust', 'java', 'cpp'],
    ai_enabled: true,
    time_limit_mins: 30
  }]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/recruiter/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      title: '',
      difficulty: 'Medium',
      description: '',
      constraints: '',
      tags: '',
      examples: '[\n  {\n    "input": "",\n    "output": ""\n  }\n]',
      allowed_languages: ['python', 'js', 'go', 'rust', 'java', 'cpp'],
      ai_enabled: true,
      time_limit_mins: 30
    }]);
  };

  const handleRemoveQuestion = (idToRemove) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== idToRemove));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const toggleLanguage = (id, langId) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const langs = q.allowed_languages.includes(langId)
          ? q.allowed_languages.filter(l => l !== langId)
          : [...q.allowed_languages, langId];
        return { ...q, allowed_languages: langs };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Assessment Title is required");
    
    setSubmitting(true);
    try {
      const formattedQuestions = questions.map((q, index) => {
          let parsedExamples = [];
          try {
              parsedExamples = JSON.parse(q.examples);
          } catch(e) {
              parsedExamples = [{"input": "Error parsing JSON", "output": "Fix your syntax"}];
          }
          return {
            title: q.title,
            difficulty: q.difficulty,
            description: q.description,
            constraints: q.constraints,
            tags: q.tags.split(',').map(t => t.trim()).filter(Boolean),
            examples: parsedExamples,
            allowed_languages: q.allowed_languages,
            ai_enabled: q.ai_enabled,
            time_limit_mins: parseInt(q.time_limit_mins),
            order_index: index
          }
      });

      const res = await fetch('http://localhost:8000/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          recruiter_id: user.id,
          questions: formattedQuestions
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create assessment");
      }

      router.push('/recruiter/dashboard');
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-32 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Header */}
      <div className="fixed top-0 w-full z-50 p-4">
        <motion.div 
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-6xl mx-auto bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-2xl transition-colors"
        >
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/recruiter/dashboard')} className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors group">
              <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 transition-colors" />
            <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-600 dark:text-violet-500 transition-colors" />
                <span className="font-bold tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 transition-colors">ASSESSMENT STUDIO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit} 
              disabled={submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 transition-all border border-white/10"
            >
              {submitting ? 'GENERATING LINK...' : <><Save size={16} /> PUBLISH NOW</>}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto mt-32 px-6 relative z-10">
        
        {/* Title Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Name Your Assessment..."
                className="w-full bg-transparent border-none text-5xl font-extrabold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 focus:ring-0 p-0 mb-2 transition-all outline-none"
            />
            <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-transparent rounded-full" />
        </motion.div>

        <div className="space-y-12">
          <AnimatePresence>
            {questions.map((q, index) => (
              <motion.div 
                key={q.id} 
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative bg-white/80 dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-md dark:shadow-2xl overflow-hidden group transition-colors"
              >
                {/* Accent Glow */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 dark:border-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm border border-violet-200 dark:border-violet-500/30 transition-colors">
                        {index + 1}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-200 transition-colors">Question Configuration</h3>
                  </div>
                  {questions.length > 1 && (
                    <button onClick={() => handleRemoveQuestion(q.id)} className="text-red-500 hover:text-red-600 dark:text-red-400/50 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 p-2 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Column - Main Details */}
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">Problem Title</label>
                      <input 
                        value={q.title} 
                        onChange={e => updateQuestion(q.id, 'title', e.target.value)} 
                        className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:bg-gray-50 dark:focus:bg-black/60 transition-all shadow-sm dark:shadow-inner" 
                        placeholder="e.g. Optimize Distributed Cache" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">Description (Markdown)</label>
                      <textarea 
                        rows={6} 
                        value={q.description} 
                        onChange={e => updateQuestion(q.id, 'description', e.target.value)} 
                        className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 text-sm outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:bg-gray-50 dark:focus:bg-black/60 transition-all font-mono leading-relaxed resize-y shadow-sm dark:shadow-inner" 
                        placeholder="Explain the problem clearly..."
                      />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">Constraints</label>
                        <textarea 
                            rows={3} 
                            value={q.constraints} 
                            onChange={e => updateQuestion(q.id, 'constraints', e.target.value)} 
                            className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 text-xs outline-none focus:border-violet-500 dark:focus:border-violet-500 transition-all font-mono shadow-sm dark:shadow-inner" 
                            placeholder="- 1 <= N <= 10^5"
                        />
                        </div>
                        <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">
                            <Code2 size={12}/> Examples (JSON)
                        </label>
                        <textarea 
                            rows={8} 
                            value={q.examples} 
                            onChange={e => updateQuestion(q.id, 'examples', e.target.value)} 
                            className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 text-xs outline-none focus:border-violet-500 dark:focus:border-violet-500 transition-all font-mono shadow-sm dark:shadow-inner resize-y" 
                        />
                        </div>
                    </div>
                  </div>

                  {/* Right Column - Settings */}
                  <div className="md:col-span-4 space-y-6">
                    
                    {/* Time Limit & Difficulty */}
                    <div className="bg-gray-50 dark:bg-black/30 p-5 rounded-2xl border border-gray-200 dark:border-white/5 space-y-5 transition-colors">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">
                                <Clock size={12}/> Time Limit
                            </label>
                            <div className="flex items-center gap-2 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 transition-colors">
                                <input 
                                    type="number" min="1" 
                                    value={q.time_limit_mins} 
                                    onChange={e => updateQuestion(q.id, 'time_limit_mins', e.target.value)} 
                                    className="w-16 bg-transparent text-gray-900 dark:text-white text-center font-bold outline-none transition-colors" 
                                />
                                <span className="text-gray-400 dark:text-gray-500 text-xs font-bold transition-colors">MINS</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">Difficulty</label>
                            <div className="flex bg-white dark:bg-black/40 rounded-lg p-1 border border-gray-200 dark:border-white/10 transition-colors">
                                {['Easy', 'Medium', 'Hard'].map(diff => (
                                    <button 
                                        key={diff}
                                        onClick={() => updateQuestion(q.id, 'difficulty', diff)}
                                        className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${
                                            q.difficulty === diff 
                                            ? (diff === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : diff === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400')
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">
                                <Tag size={12}/> Tags
                            </label>
                            <input 
                                value={q.tags} 
                                onChange={e => updateQuestion(q.id, 'tags', e.target.value)} 
                                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-violet-500 transition-colors" 
                                placeholder="arrays, dp" 
                            />
                        </div>
                    </div>

                    {/* AI Toggle */}
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10 p-5 rounded-2xl border border-violet-200 dark:border-violet-500/20 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <BrainCircuit size={16} className="text-violet-600 dark:text-violet-400 transition-colors" />
                                <span className="font-bold text-sm text-violet-900 dark:text-violet-100 transition-colors">Live AI Interviewer</span>
                            </div>
                            {/* Custom Toggle Switch */}
                            <button 
                                onClick={() => updateQuestion(q.id, 'ai_enabled', !q.ai_enabled)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${q.ai_enabled ? 'bg-violet-600 dark:bg-violet-500' : 'bg-gray-300 dark:bg-white/20'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${q.ai_enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-violet-700 dark:text-violet-300/70 leading-relaxed transition-colors">
                            Candidate will be required to explain their thought process verbally via microphone to the AI.
                        </p>
                    </div>

                    {/* Language Restrictions */}
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 mb-3 tracking-widest uppercase">Allowed Languages</div>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_LANGUAGES.map(lang => {
                            const isSelected = q.allowed_languages.includes(lang.id);
                            return (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={lang.id}
                                    onClick={() => toggleLanguage(q.id, lang.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                        isSelected
                                        ? lang.color + ' shadow-[0_0_10px_currentColor] opacity-100'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 bg-white dark:bg-black/40 opacity-70 dark:opacity-50 hover:opacity-100 dark:hover:opacity-80'
                                    }`}
                                >
                                    {lang.label.toUpperCase()}
                                </motion.button>
                            );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Question Button */}
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(139, 92, 246, 0.05)", borderColor: "rgba(139, 92, 246, 0.5)", color: "rgba(139, 92, 246, 1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddQuestion}
            className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-white/10 text-gray-500 rounded-3xl flex items-center justify-center gap-3 transition-colors font-bold tracking-widest text-sm bg-white/50 dark:bg-transparent hover:bg-white dark:hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center transition-colors">
                <Plus size={16} />
            </div>
            ADD NEW QUESTION
          </motion.button>
        </div>
      </div>
    </div>
  );
}
