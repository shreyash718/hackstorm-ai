'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchProblem, sendChatMessage, streamChatMessage, evaluateInterview } from '@/lib/api';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { supabase } from '@/lib/supabase';
import CodeEditor from '@/components/CodeEditor';
import ChatPanel from '@/components/ChatPanel';
import VoiceController from '@/components/VoiceController';
import ReportCard from '@/components/ReportCard';

const STARTER_CODE = {
  1: {
    python: `def two_sum(nums, target):\n    # Your solution here\n    pass`,
    cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n    }\n};`,
    java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n    }\n}`
  },
  2: {
    python: `def is_valid(s):\n    # Your solution here\n    pass`,
    cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Your solution here\n    }\n};`,
    java: `class Solution {\n    public boolean isValid(String s) {\n        // Your solution here\n    }\n}`
  }
};

function speak(text, onEnd, queue = true) {
  if (!text) return;
  
  if (!queue) {
    window.speechSynthesis.cancel();
  }

  const utter = new SpeechSynthesisUtterance(text);
  
  // Find a decent browser voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => 
    v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))
  ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
  
  if (preferred) utter.voice = preferred;
  utter.onend = onEnd || null;
  window.speechSynthesis.speak(utter);
}

const PHASES = {
  PLANNING: { id: 'PLANNING', name: 'Approach & Planning', duration: 5 * 60, next: 'CODING' },
  CODING: { id: 'CODING', name: 'Implementation', duration: 20 * 60, next: 'REVIEW' },
  REVIEW: { id: 'REVIEW', name: 'Review & Follow-up', duration: 5 * 60, next: null }
};

export default function InterviewScreen() {
  const params = useParams();
  const router = useRouter();
  const problemId = parseInt(params.id);

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE[problemId]?.python || '# Write your solution here\n');

  const [codesPerLanguage, setCodesPerLanguage] = useState({});

  function handleLanguageChange(newLang) {
    setCodesPerLanguage(prev => ({
      ...prev,
      [language]: code
    }));
    setLanguage(newLang);
    setCode(codesPerLanguage[newLang] || STARTER_CODE[problemId]?.[newLang] || '// Write your solution here\n');
  }
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [voiceMode, setVoiceMode] = useState(true);
  const [user, setUser] = useState(null);

  const [sessionInfo, setSessionInfo] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('PLANNING');
  const [timeLeft, setTimeLeft] = useState(PHASES.PLANNING.duration);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Phase Timer Logic
  useEffect(() => {
    if (loading || evaluating || !currentPhase || report) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextPhaseId = PHASES[currentPhase].next;
          if (nextPhaseId) {
            setCurrentPhase(nextPhaseId);
            const nextDuration = PHASES[nextPhaseId].duration;
            
            // Inform AI about phase transition
            const transitionMsg = `[SYSTEM: Phase changed to ${PHASES[nextPhaseId].name}. Please guide the candidate accordingly.]`;
            handleSendMessage(transitionMsg, true); // Hidden system message
            
            return nextDuration;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, loading, evaluating, report]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    // Load voices
    window.speechSynthesis.getVoices();
    
    const sess = JSON.parse(localStorage.getItem('interview_session') || '{}');
    setSessionInfo(sess);

    fetchProblem(problemId)
      .then((data) => {
        setProblem(data);
        
        // Initialize codes for languages
        const initialCodes = {};
        const langs = ['python', 'cpp', 'java'];
        langs.forEach(l => {
          initialCodes[l] = STARTER_CODE[problemId]?.[l] || '// Write your solution here\n';
        });
        setCodesPerLanguage(initialCodes);
        setCode(initialCodes['python']);

        const greeting = `Hey! I'm Arjun. Let's work through "${data.title}" together. Take a moment to read the problem, and whenever you're ready, walk me through your initial thoughts.`;
        setMessages([{ role: 'assistant', content: greeting }]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [problemId]);

  useEffect(() => {
    if (!voiceMode) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && messages.length === 1) { // Speak initial greeting
      setIsSpeaking(true);
      speak(last.content, () => setIsSpeaking(false));
    }
  }, [messages, voiceMode]);

  async function handleSendMessage(text, isSystem = false) {
    if (!text.trim() || (loading && !isSystem)) return;
    
    // Interrupt AI if it's speaking
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    let newHistory;
    if (!isSystem) {
      const userMsg = { role: 'user', content: text };
      newHistory = [...messages, userMsg];
      setMessages(newHistory);
    } else {
      newHistory = [...messages];
    }
    
    setLoading(true);
    window.speechSynthesis.cancel(); // Interrupt any old speech
    setIsSpeaking(false);

    try {
      const response = await streamChatMessage({
        problem_id: problemId,
        code,
        chat_history: newHistory,
        candidate_message: text,
        user_id: user?.id,
        phase: currentPhase
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      console.log("Reader obtained");
      const decoder = new TextDecoder();
      
      let assistantContent = '';
      let spokenContent = '';
      let isComplete = false;
      let buffer = '';

      // Add a placeholder message for the assistant
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                
                // Update the last message
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantContent;
                  return updated;
                });

                // Incremental TTS: Speak finished sentences
                if (voiceMode) {
                  const currentText = assistantContent.slice(spokenContent.length);
                  // Look for sentence terminators
                  if (/[.!?](\s|$)/.test(currentText) || (currentText.length > 40 && /[,;](\s|$)/.test(currentText))) {
                    const toSpeak = currentText.trim();
                    if (toSpeak) {
                      setIsSpeaking(true);
                      speak(toSpeak);
                      spokenContent = assistantContent;
                    }
                  } else if (currentText.length > 60 && /\s$/.test(currentText)) {
                    // Force speak if sentence is getting too long
                    const toSpeak = currentText.trim();
                    if (toSpeak) {
                      setIsSpeaking(true);
                      speak(toSpeak);
                      spokenContent = assistantContent;
                    }
                  }
                }
              }
              if (data.is_complete !== undefined) {
                isComplete = data.is_complete;
              }
            } catch (e) {
              console.error("Parse error:", e, line);
            }
          }
        }
      }

      // Final speak for any remaining text
      if (voiceMode && assistantContent.length > spokenContent.length) {
        const toSpeak = assistantContent.slice(spokenContent.length).trim();
        if (toSpeak) {
          setIsSpeaking(true);
          speak(toSpeak, () => setIsSpeaking(false));
        } else {
          setIsSpeaking(false);
        }
      } else if (voiceMode) {
        // Wait for all utterances to finish
        const checkDone = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(checkDone);
          }
        }, 100);
      }

      if (isComplete) {
        handleEndInterview([...newHistory, { role: 'assistant', content: assistantContent }]);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Is the backend running?' }]);
    } finally {
      setLoading(false);
    }
  };

  async function handleEndInterview(historyToUse = messages) {
    window.speechSynthesis.cancel();
    setEvaluating(true);
    try {
      const res = await evaluateInterview({
        problem_id: problemId,
        code,
        chat_history: historyToUse,
        user_id: user?.id
      });
      
      if (res.id) {
        router.push(`/candidate/reports/${res.id}`);
        return;
      }
      setReport(res);
    } catch (e) {
      alert("Failed to generate report.");
    } finally {
      setEvaluating(false);
    }
  };

  if (report) {
    return <ReportCard report={report} onHome={() => router.push('/')} />;
  }

  if (!problem) return <div className="min-h-screen bg-background text-primary flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-gray-100 font-mono overflow-hidden transition-colors duration-300">
      {/* Topbar */}
      <div className="h-14 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-[#1e293b] px-6 flex items-center justify-between shrink-0 shadow-sm dark:shadow-none z-10 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
            ← back
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-[#1e293b]" />
          <span className="text-gray-900 dark:text-white text-sm font-semibold">{problem.title}</span>
          <span className={`text-[10px] tracking-widest font-bold px-2 py-0.5 rounded border ${
            problem.difficulty === 'Easy' ? 'border-green-400/50 dark:border-green-500/50 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' :
            problem.difficulty === 'Medium' ? 'border-yellow-400/50 dark:border-yellow-500/50 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
            'border-red-400/50 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
          }`}>
            {problem.difficulty.toUpperCase()}
          </span>

          <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-50 dark:bg-[#030712] border border-gray-200 dark:border-[#1e293b] rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.1em]">{PHASES[currentPhase].name}</span>
              <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (voiceMode) window.speechSynthesis.cancel();
              setVoiceMode(!voiceMode);
            }}
            className="flex items-center gap-2 bg-gray-100 dark:bg-[#030712] border border-gray-200 dark:border-[#1e293b] rounded-lg px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-colors"
          >
            <span className="text-sm">🎤</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${voiceMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-[#1e293b]'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${voiceMode ? 'left-[18px]' : 'left-1'}`} />
            </div>
            <span className={`text-xs font-semibold ${voiceMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {voiceMode ? 'VOICE ON' : 'VOICE OFF'}
            </span>
          </button>

          <button 
            onClick={() => handleEndInterview(messages)}
            disabled={evaluating}
            className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            {evaluating ? 'EVALUATING...' : 'END INTERVIEW →'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <Group direction={isMobile ? "vertical" : "horizontal"} className="h-full">
          
          {/* Problem Description Panel */}
          <Panel defaultSize={25} minSize={15}>
            <div className="h-full overflow-y-auto p-6 bg-white dark:bg-[#030712] transition-colors">
              <div className="text-[10px] tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6 font-bold">PROBLEM DESCRIPTION</div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {problem.description.split('\\n').map((line, i) => (
                  <p key={i} className="mb-4 text-gray-600 dark:text-gray-400">{line}</p>
                ))}

                {problem.examples && problem.examples.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 tracking-wider">EXAMPLES:</h3>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-lg p-4 mb-4 font-mono text-xs transition-colors">
                        <div className="text-blue-600 dark:text-blue-400 mb-2"><span className="text-gray-400 dark:text-gray-500">Input:</span> {ex.input}</div>
                        <div className="text-green-600 dark:text-green-400"><span className="text-gray-400 dark:text-gray-500">Output:</span> {ex.output}</div>
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 tracking-wider">CONSTRAINTS:</h3>
                    <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-2 font-mono">
                      {problem.constraints.split('\\n').map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {problem.tags && problem.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {problem.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 text-[10px] px-2 py-1 rounded-md tracking-wider border border-gray-200 dark:border-[#334155] font-semibold transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Separator className="w-1.5 bg-gray-200 dark:bg-[#1e293b] hover:bg-blue-500/50 transition-colors cursor-col-resize active:bg-blue-500 flex items-center justify-center">
            <div className="h-8 w-0.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
          </Separator>

          {/* Code Editor Panel */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full p-4 bg-gray-100 dark:bg-[#0f172a] transition-colors">
              <CodeEditor code={code} onChange={setCode} language={language} onLanguageChange={handleLanguageChange} />
            </div>
          </Panel>

          <Separator className="w-1.5 bg-gray-200 dark:bg-[#1e293b] hover:bg-blue-500/50 transition-colors cursor-col-resize active:bg-blue-500 flex items-center justify-center">
            <div className="h-8 w-0.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
          </Separator>

          {/* Chat & Voice Control Panel */}
          <Panel defaultSize={25} minSize={20}>
            <div className="h-full flex flex-col bg-gray-50 dark:bg-[#030712] transition-colors">
              <div className="flex-1 overflow-hidden p-4 pb-0">
                <ChatPanel messages={messages} loading={loading} />
              </div>
              <div className="p-4 pt-4">
                <VoiceController 
                  onSendMessage={handleSendMessage} 
                  isSpeaking={isSpeaking} 
                  loading={loading}
                  voiceMode={voiceMode}
                />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
