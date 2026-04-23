'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sendChatMessage, streamChatMessage, evaluateInterview } from '@/lib/api';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CodeEditor from '@/components/CodeEditor';
import ChatPanel from '@/components/ChatPanel';
import VoiceController from '@/components/VoiceController';
import ReportCard from '@/components/ReportCard';

const STARTER_CODE = {
    python: `# Write your solution here\n`,
    cpp: `// Write your solution here\n`,
    java: `// Write your solution here\n`,
    js: `// Write your solution here\n`,
    go: `// Write your solution here\n`,
    rust: `// Write your solution here\n`
};

const PHASES = {
  PLANNING: { id: 'PLANNING', name: 'Approach & Planning', duration: 5 * 60, next: 'CODING' },
  CODING: { id: 'CODING', name: 'Implementation', duration: 20 * 60, next: 'REVIEW' },
  REVIEW: { id: 'REVIEW', name: 'Review & Follow-up', duration: 5 * 60, next: null }
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

export default function AssessmentInterviewScreen() {
  const params = useParams();
  const router = useRouter();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [voiceMode, setVoiceMode] = useState(true);

  const [currentPhase, setCurrentPhase] = useState('PLANNING');
  const [timeLeft, setTimeLeft] = useState(0);
  const [codesPerLanguage, setCodesPerLanguage] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPhaseDuration = useCallback((phaseId, totalMins) => {
    const totalSecs = totalMins * 60;
    const planningSecs = Math.max(60, Math.floor(totalSecs * 0.15)); // 15% for planning
    const reviewSecs = Math.max(60, Math.floor(totalSecs * 0.15));   // 15% for review
    const codingSecs = totalSecs - planningSecs - reviewSecs;
    
    if (phaseId === 'PLANNING') return planningSecs;
    if (phaseId === 'REVIEW') return reviewSecs;
    return codingSecs;
  }, []);

  useEffect(() => {
    // Load voices
    window.speechSynthesis.getVoices();
    
    const sess = JSON.parse(localStorage.getItem('assessment_candidate'));
    if (!sess || sess.assessment_id !== params.id) {
        router.push(`/assessment/${params.id}`);
        return;
    }
    
    setSessionInfo(sess);
    setAssessment(sess.assessment_data);
    setCurrentQIndex(sess.current_q_index || 0);
  }, [params.id, router]);

  useEffect(() => {
    if (!assessment) return;
    
    if (currentQIndex >= assessment.questions.length) {
        // Assessment completely finished
        setReport({ overall_score: 'PENDING', summary: "Assessment complete! Your results have been sent to the recruiter." });
        return;
    }

    const q = assessment.questions[currentQIndex];
    setQuestion(q);
    
    // Set initial language from allowed languages
    const initialLang = q.allowed_languages.length > 0 ? q.allowed_languages[0] : 'python';
    setLanguage(initialLang);
    
    // Initialize codes for all allowed languages
    const initialCodes = {};
    q.allowed_languages.forEach(l => {
        initialCodes[l] = STARTER_CODE[l] || '// Write your solution here\n';
    });
    setCodesPerLanguage(initialCodes);
    setCode(initialCodes[initialLang]);

    // Reset phase and timer
    setCurrentPhase('PLANNING');
    setTimeLeft(getPhaseDuration('PLANNING', q.time_limit_mins));

    // Initial greeting if AI enabled
    if (q.ai_enabled) {
        const greeting = `Hello ${sessionInfo?.candidate_name}. Let's work on "${q.title}". You have ${q.time_limit_mins} minutes total. We'll start with a short planning phase. Walk me through your thoughts.`;
        setMessages([{ role: 'assistant', content: greeting }]);
    } else {
        setMessages([]);
    }

    setLoading(false);
  }, [assessment, currentQIndex, getPhaseDuration, sessionInfo?.candidate_name]);

  // Phase Timer Logic
  useEffect(() => {
    if (loading || evaluating || !currentPhase || report || !question) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextPhaseId = PHASES[currentPhase].next;
          if (nextPhaseId) {
            setCurrentPhase(nextPhaseId);
            const nextDuration = getPhaseDuration(nextPhaseId, question.time_limit_mins);
            
            // Inform AI about phase transition
            const transitionMsg = `[SYSTEM: Phase changed to ${PHASES[nextPhaseId].name}. Total duration for this phase: ${Math.floor(nextDuration/60)}m. Please guide the candidate accordingly.]`;
            handleSendMessage(transitionMsg, true); // Hidden system message
            
            return nextDuration;
          }
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, loading, evaluating, report, question]);



  function handleTimeUp() {
    alert("Time is up for this question!");
    handleEndQuestion(messages);
  }

  useEffect(() => {
    if (!voiceMode || !question?.ai_enabled) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && messages.length === 1) {
      setIsSpeaking(true);
      speak(last.content, () => setIsSpeaking(false));
    }
  }, [messages, voiceMode, question]);

  function handleLanguageChange(newLang) {
    // Save current code before switching
    setCodesPerLanguage(prev => ({
        ...prev,
        [language]: code
    }));
    setLanguage(newLang);
    setCode(codesPerLanguage[newLang] || STARTER_CODE[newLang] || '// Write your solution here\n');
  }

  async function handleSendMessage(text, isSystem = false) {
    if (!text.trim() || (loading && !isSystem) || !question?.ai_enabled) return;
    
    const userMsg = { role: 'user', content: text };
    let newHistory;
    if (!isSystem) {
      newHistory = [...messages, userMsg];
      setMessages(newHistory);
    } else {
      newHistory = [...messages];
    }

    setLoading(true);
    window.speechSynthesis.cancel(); // Interrupt AI if it's speaking
    setIsSpeaking(false);

    try {
      const response = await streamChatMessage({
        problem_id: question.problem_id,
        code,
        chat_history: newHistory,
        candidate_message: text,
        user_id: sessionInfo?.candidate_name,
        phase: currentPhase
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
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
        buffer = lines.pop() || '';
        
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

                // Incremental TTS
                if (voiceMode) {
                  const currentText = assistantContent.slice(spokenContent.length);
                  if (/[.!?](\s|$)/.test(currentText) || (currentText.length > 40 && /[,;](\s|$)/.test(currentText))) {
                    const toSpeak = currentText.trim();
                    if (toSpeak) {
                      setIsSpeaking(true);
                      speak(toSpeak);
                      spokenContent = assistantContent;
                    }
                  } else if (currentText.length > 60 && /\s$/.test(currentText)) {
                    const toSpeak = currentText.trim();
                    if (toSpeak) {
                      setIsSpeaking(true);
                      speak(toSpeak);
                      spokenContent = assistantContent;
                    }
                  }
                }
              }
              if (data.is_complete !== undefined) isComplete = data.is_complete;
            } catch (e) { console.error("Parse error:", e); }
          }
        }
      }

      // Final speak
      if (voiceMode && assistantContent.length > spokenContent.length) {
        const toSpeak = assistantContent.slice(spokenContent.length).trim();
        if (toSpeak) {
          setIsSpeaking(true);
          speak(toSpeak, () => setIsSpeaking(false));
        } else {
          setIsSpeaking(false);
        }
      } else if (voiceMode) {
        setIsSpeaking(false);
      }

      if (isComplete) {
        handleEndQuestion([...newHistory, { role: 'assistant', content: assistantContent }]);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  async function handleEndQuestion(historyToUse = messages) {
    window.speechSynthesis.cancel();
    setEvaluating(true);
    try {
      await evaluateInterview({
        problem_id: question.problem_id,
        code,
        chat_history: historyToUse,
        user_id: null,
        assessment_id: assessment.id,
        candidate_name: sessionInfo.candidate_name
      });
      
      // Move to next question
      const nextIndex = currentQIndex + 1;
      
      // Update local storage
      const sess = { ...sessionInfo, current_q_index: nextIndex };
      localStorage.setItem('assessment_candidate', JSON.stringify(sess));
      
      setCurrentQIndex(nextIndex);
    } catch (e) {
      alert("Failed to submit answer.");
    } finally {
      setEvaluating(false);
    }
  };



  // If entire assessment is done
  if (report) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-primary p-6">
            <div className="w-full max-w-md bg-surface border border-muted p-8 rounded-xl shadow-2xl text-center">
                <div className="text-4xl mb-4 text-green-500">🎉</div>
                <h1 className="text-2xl font-bold mb-4">Assessment Complete</h1>
                <p className="text-secondary">{report.summary}</p>
                <button onClick={() => router.push('/')} className="mt-8 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded transition-colors">
                    Return to Home
                </button>
            </div>
        </div>
    );
  }

  if (!question) return <div className="min-h-screen bg-background text-primary flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-background text-primary font-mono overflow-hidden transition-colors duration-300">
      {/* Topbar */}
      <div className="h-14 bg-surface border-b border-muted px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <span className="text-primary text-sm font-semibold">{question.title}</span>
          <span className="text-[10px] tracking-widest font-bold px-2 py-0.5 rounded border border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400">
            {currentQIndex + 1} OF {assessment.questions.length}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-background border border-muted rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-secondary font-bold uppercase tracking-[0.1em]">{PHASES[currentPhase].name}</span>
              <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
        </div>

          {question.ai_enabled && (
              <button 
                onClick={() => {
                  if (voiceMode) window.speechSynthesis.cancel();
                  setVoiceMode(!voiceMode);
                }}
                className="flex items-center gap-2 bg-background border border-muted rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
              >
                <span className="text-sm">🎤</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${voiceMode ? 'bg-blue-600' : 'bg-muted'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${voiceMode ? 'left-[18px]' : 'left-1'}`} />
                </div>
              </button>
          )}

          <button 
            onClick={() => handleEndQuestion(messages)}
            disabled={evaluating}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            {evaluating ? 'SUBMITTING...' : 'SUBMIT & NEXT →'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <Group direction={isMobile ? "vertical" : "horizontal"} className="h-full">
          
          {/* Problem Description Panel */}
          <Panel defaultSize={question.ai_enabled ? 25 : 40} minSize={15}>
            <div className="h-full overflow-y-auto p-6 bg-background">
              <div className="text-[10px] tracking-[0.2em] text-secondary mb-6">PROBLEM DESCRIPTION</div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-primary">
                {question.description.split('\\n').map((line, i) => (
                  <p key={i} className="mb-4 text-secondary">{line}</p>
                ))}

                {question.examples && question.examples.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-primary mb-4 tracking-wider">EXAMPLES:</h3>
                    {question.examples.map((ex, i) => (
                      <div key={i} className="bg-surface border border-muted rounded-lg p-4 mb-4 font-mono text-xs">
                        <div className="text-blue-600 dark:text-blue-400 mb-2"><span className="text-text-muted">Input:</span> {ex.input}</div>
                        <div className="text-green-600 dark:text-green-400"><span className="text-text-muted">Output:</span> {ex.output}</div>
                      </div>
                    ))}
                  </div>
                )}

                {question.constraints && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-primary mb-3 tracking-wider">CONSTRAINTS:</h3>
                    <ul className="list-disc list-inside text-xs text-secondary space-y-2 font-mono">
                      {question.constraints.split('\\n').map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Separator className="w-1.5 bg-muted hover:bg-violet-500/50 transition-colors cursor-col-resize active:bg-violet-500 flex items-center justify-center">
            <div className="h-8 w-0.5 bg-text-muted rounded-full" />
          </Separator>

          {/* Code Editor Panel */}
          <Panel defaultSize={question.ai_enabled ? 50 : 60} minSize={30}>
            <div className="h-full p-4 bg-surface flex flex-col">
              {/* Only show allowed languages */}
              <div className="mb-4 flex gap-2">
                  {question.allowed_languages.map(lang => (
                      <button 
                        key={lang} 
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${language === lang ? 'bg-violet-500/20 border-violet-500 text-violet-500' : 'bg-background border-muted text-secondary hover:text-primary'}`}
                      >
                          {lang.toUpperCase()}
                      </button>
                  ))}
              </div>
              <div className="flex-1 rounded-lg overflow-hidden border border-muted">
                <CodeEditor code={code} onChange={setCode} language={language} onLanguageChange={handleLanguageChange} />
              </div>
            </div>
          </Panel>

          {question.ai_enabled && (
              <>
                <Separator className="w-1.5 bg-muted hover:bg-violet-500/50 transition-colors cursor-col-resize active:bg-violet-500 flex items-center justify-center">
                    <div className="h-8 w-0.5 bg-text-muted rounded-full" />
                </Separator>

                {/* Chat & Voice Control Panel */}
                <Panel defaultSize={25} minSize={20}>
                    <div className="h-full flex flex-col bg-background">
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
              </>
          )}
        </Group>
      </div>
    </div>
  );
}
