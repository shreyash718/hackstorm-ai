'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sendChatMessage, evaluateInterview, generateTTS } from '@/lib/api';
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

let currentAudio = null;

function speakLegacy(text, onEnd) {
  console.warn("AI Voice: Premium TTS failed, falling back to browser default.");
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

async function speak(text, onEnd) {
  if (!text) return;
  console.log("AI Voice: Preparing to speak...", text.substring(0, 30) + "...");
  
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }

    const res = await generateTTS(text);
    if (!res || !res.audio) {
        throw new Error("No audio data in response");
    }

    console.log("AI Voice: Audio loaded (B64), playing...");
    const audio = new Audio();
    audio.src = `data:audio/wav;base64,${res.audio}`;
    currentAudio = audio;
    
    audio.onended = () => {
      console.log("AI Voice: Finished speaking.");
      if (currentAudio === audio) currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.error("AI Voice: Browser playback error:", e);
      speakLegacy(text, onEnd);
    };

    audio.load();
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("AI Voice: Autoplay blocked, falling back to legacy...");
        speakLegacy(text, onEnd);
      });
    }
  } catch (err) {
    console.error("AI Voice: Premium TTS Error, using legacy:", err);
    speakLegacy(text, onEnd);
  }
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

  const [timeLeft, setTimeLeft] = useState(0);

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
    setCode(STARTER_CODE[initialLang] || '// Write your solution here\n');

    // Set timer
    setTimeLeft(q.time_limit_mins * 60);

    // Initial greeting if AI enabled
    if (q.ai_enabled) {
        const greeting = `Hello ${sessionInfo?.candidate_name}. Let's work on "${q.title}". You have ${q.time_limit_mins} minutes. Walk me through your thoughts.`;
        setMessages([{ role: 'assistant', content: greeting }]);
    } else {
        setMessages([]);
    }

    setLoading(false);
  }, [assessment, currentQIndex]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || loading || evaluating || !question) return;
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                handleTimeUp();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, evaluating, question]);

  const handleTimeUp = () => {
    alert("Time is up for this question!");
    handleEndQuestion(messages);
  };

  useEffect(() => {
    if (!voiceMode || !question?.ai_enabled) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && messages.length === 1) {
      setIsSpeaking(true);
      speak(last.content, () => setIsSpeaking(false));
    }
  }, [messages, voiceMode, question]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang] || '// Write your solution here\n');
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading || !question?.ai_enabled) return;
    
    const userMsg = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await sendChatMessage({
        problem_id: question.problem_id,
        code,
        chat_history: newHistory,
        candidate_message: text,
        user_id: sessionInfo?.candidate_name, // fallback
      });

      const assistantMsg = { role: 'assistant', content: res.reply };
      setMessages([...newHistory, assistantMsg]);
      
      if (res.is_complete) {
        handleEndQuestion([...newHistory, assistantMsg]);
        return;
      }

      if (voiceMode) {
        setIsSpeaking(true);
        speak(res.reply, () => setIsSpeaking(false));
      }
    } catch (e) {
      setMessages([...newHistory, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndQuestion = async (historyToUse = messages) => {
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
          <div className="text-red-500 font-bold border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded flex items-center gap-2">
            ⏱ {formatTime(timeLeft)}
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
        <Group direction="horizontal" className="h-full">
          
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
