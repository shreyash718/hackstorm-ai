'use client';
import { useParams, useRouter } from 'next/navigation';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CodeEditor from '@/components/CodeEditor';
import ChatPanel from '@/components/ChatPanel';
import VoiceController from '@/components/VoiceController';
import ReportCard from '@/components/ReportCard';

// Hooks
import useInterviewSession from '@/features/interview/hooks/useInterviewSession';
import useSpeechOutput from '@/features/interview/hooks/useSpeechOutput';
import useInterviewChat from '@/features/interview/hooks/useInterviewChat';
import { useState, useEffect, useCallback, memo } from 'react';

// Memoized Components for performance
const MemoizedCodeEditor = memo(CodeEditor);
const MemoizedChatPanel = memo(ChatPanel);
const MemoizedVoiceController = memo(VoiceController);

// Isolated Timer Component to prevent whole-page re-renders
const TimerDisplay = ({ timeLeft, phaseName }) => (
  <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-50 dark:bg-[#030712] border border-gray-200 dark:border-[#1e293b] rounded-lg shadow-sm">
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.1em]">{phaseName}</span>
      <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`}>
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </span>
    </div>
  </div>
);

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

export default function InterviewScreen() {
  const params = useParams();
  const router = useRouter();
  const problemId = parseInt(params.id);

  // 1. Session State
  const session = useInterviewSession(problemId);
  const { problem, user, currentPhase, timeLeft, loading: sessionLoading, voiceMode, setVoiceMode, startTimer, PHASES } = session;

  // 2. Editor State
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [codesPerLanguage, setCodesPerLanguage] = useState({});

  // Initial Code Setup - Only run when problem changes
  useEffect(() => {
    if (problemId) {
      const initialCodes = {};
      ['python', 'cpp', 'java', 'js', 'go', 'rust'].forEach(l => {
        initialCodes[l] = STARTER_CODE[problemId]?.[l] || '// Write your solution here\n';
      });
      setCodesPerLanguage(initialCodes);
      setCode(initialCodes['python']);
    }
  }, [problemId]);

  const handleLanguageChange = (newLang) => {
    setCodesPerLanguage(prev => ({ ...prev, [language]: code }));
    setLanguage(newLang);
    setCode(codesPerLanguage[newLang] || STARTER_CODE[problemId]?.[newLang] || '// Write your solution here\n');
  };

  // 3. Speech Output
  const speech = useSpeechOutput({ enabled: voiceMode });

  // 4. Chat State
  const chat = useInterviewChat({
    problemId,
    code,
    userId: user?.id,
    currentPhase,
    voiceMode,
    speech,
    onInterviewComplete: (finalHistory) => handleEndInterview(finalHistory)
  });
  const { messages, setMessages, loading: chatLoading, evaluating, sendMessage, runEvaluation } = chat;

  const [report, setReport] = useState(null);

  // 5. Lifecycle
  useEffect(() => {
    if (sessionLoading || !problem) return;
    
    // Greeting
    const greeting = `Hey! I'm Arjun. Let's work through "${problem.title}" together. Take a moment to read the problem, and whenever you're ready, walk me through your initial thoughts.`;
    setMessages([{ role: 'assistant', content: greeting }]);
    
    if (voiceMode) speech.speak(greeting);

    // Timer
    const cleanup = startTimer((nextPhase) => {
      sendMessage(`[SYSTEM: Phase changed to ${PHASES[nextPhase].name}. Please guide the candidate accordingly.]`, true);
    });
    
    return cleanup;
  }, [sessionLoading, problem]); // Only run once problem is loaded

  const handleEndInterview = async (historyToUse) => {
    const res = await runEvaluation(historyToUse);
    if (res?.id) router.push(`/candidate/reports/${res.id}`);
    else if (res) setReport(res);
    else alert("Failed to generate report.");
  };

  if (report) return <ReportCard report={report} onHome={() => router.push('/')} />;
  if (sessionLoading || !problem) return <div className="min-h-screen bg-background text-primary flex items-center justify-center">Loading Interview...</div>;

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

          <TimerDisplay timeLeft={timeLeft} phaseName={PHASES[currentPhase].name} />
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (voiceMode) speech.cancelSpeech();
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
        <Group direction="horizontal" className="h-full">
          {/* Problem Description Panel */}
          <Panel defaultSize={25} minSize={15}>
            <div className="h-full overflow-y-auto p-6 bg-white dark:bg-[#030712] transition-colors">
              <div className="text-[10px] tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6 font-bold">PROBLEM DESCRIPTION</div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {problem.description.split('\\n').map((line, i) => (
                  <p key={i} className="mb-4 text-gray-600 dark:text-gray-400">{line}</p>
                ))}
                {problem.examples?.map((ex, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-lg p-4 mb-4 font-mono text-xs">
                    <div className="text-blue-600 dark:text-blue-400 mb-2">Input: {ex.input}</div>
                    <div className="text-green-600 dark:text-green-400">Output: {ex.output}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Separator className="w-1.5 bg-gray-200 dark:bg-[#1e293b] hover:bg-blue-500/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="h-8 w-0.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
          </Separator>

          {/* Code Editor Panel */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full p-4 bg-gray-100 dark:bg-[#0f172a] transition-colors">
              <MemoizedCodeEditor 
                key={`${problemId}-${language}`}
                code={codesPerLanguage[language] || code} 
                onChange={setCode} 
                language={language} 
                onLanguageChange={handleLanguageChange} 
              />
            </div>
          </Panel>

          <Separator className="w-1.5 bg-gray-200 dark:bg-[#1e293b] hover:bg-blue-500/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="h-8 w-0.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
          </Separator>

          {/* Chat Panel */}
          <Panel defaultSize={25} minSize={20}>
            <div className="h-full flex flex-col bg-gray-50 dark:bg-[#030712] transition-colors">
              <div className="flex-1 overflow-hidden p-4 pb-0">
                <MemoizedChatPanel messages={messages} loading={chatLoading} />
              </div>
              <div className="p-4 pt-4">
                <MemoizedVoiceController 
                  onSendMessage={sendMessage} 
                  isSpeaking={speech.isSpeaking} 
                  loading={chatLoading}
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
