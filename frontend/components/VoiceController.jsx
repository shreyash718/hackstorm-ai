'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Send } from 'lucide-react';

export default function VoiceController({ onSendMessage, isSpeaking, loading, voiceMode }) {
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState('');
  const recogRef = useRef(null);

  const stopListening = useCallback(() => {
    if (recogRef.current) {
      recogRef.current.stop();
    }
    setListening(false);
  }, []);

  const silenceTimerRef = useRef(null);
  const inputRef = useRef('');

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const handleSubmit = useCallback((textOverride) => {
    const text = textOverride !== undefined ? textOverride : inputRef.current;
    if (!text.trim() || loading || isSpeaking) return;
    
    onSendMessage(text);
    setInput('');
    inputRef.current = '';
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, [loading, isSpeaking, onSendMessage]);

  const resetSilenceTimer = useCallback((currentTranscript) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (currentTranscript.trim()) {
        handleSubmit(currentTranscript);
      }
    }, 1500); // 1.5s of silence
  }, [handleSubmit]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    
    const r = new SR();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = true;
    
    r.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const fullText = inputRef.current + " " + finalTranscript;
        setInput(fullText.trim());
        resetSilenceTimer(fullText.trim());
      }
    };
    
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    recogRef.current = r;
    r.start();
    setListening(true);
  }, [resetSilenceTimer]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || voiceMode)) {
        if (inputRef.current.trim() && !loading && !isSpeaking) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [voiceMode, loading, isSpeaking, handleSubmit]);

  useEffect(() => {
    if (listening && input && !recogRef.current) {
      handleSubmit();
    }
  }, [listening]);

  return (
    <div className="flex flex-col border-t border-[#1e293b] bg-[#0a0e1a] p-4 flex-shrink-0 font-mono">
      {voiceMode ? (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={listening ? stopListening : handleSubmit}
            disabled={loading || isSpeaking || (!listening && !input.trim())}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : input.trim()
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-800 text-slate-400'
            } ${(loading || isSpeaking) && 'opacity-50 cursor-not-allowed'}`}
          >
            {listening ? <Square size={20} className="text-white fill-current" /> : <Send size={20} className={input.trim() ? "text-white" : ""} />}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={loading || isSpeaking}
              className={`p-3 rounded-full ${listening ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-blue-400'} transition-colors`}
            >
              <Mic size={18} />
            </button>
            <span className="text-xs text-slate-500 tracking-wider">
              {listening ? 'LISTENING...' : 'TAP MIC TO SPEAK'}
            </span>
          </div>

          {input && (
            <div className="w-full mt-2 p-3 bg-slate-900/50 border border-slate-800 rounded text-slate-300 text-sm italic">
              "{input}"
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your response... (Enter to send)"
            rows={3}
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg text-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 resize-none font-mono placeholder-slate-600"
            disabled={loading || isSpeaking}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim() || isSpeaking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold tracking-wider py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            SEND <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
