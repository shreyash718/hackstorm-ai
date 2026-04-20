'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Send } from 'lucide-react';

export default function VoiceController({ onSendMessage, isSpeaking, loading, voiceMode }) {
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState('');
  const recogRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const inputRef = useRef('');
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recogRef.current) {
        try { recogRef.current.abort(); } catch (e) {}
        recogRef.current = null;
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const handleSubmit = useCallback((textOverride) => {
    const text = textOverride !== undefined ? textOverride : inputRef.current;
    if (!text.trim() || loading) return;

    // Stop listening before sending
    shouldRestartRef.current = false;
    if (recogRef.current) {
      try { recogRef.current.abort(); } catch (e) {}
      recogRef.current = null;
    }
    setListening(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    onSendMessage(text);
    setInput('');
    inputRef.current = '';
  }, [loading, onSendMessage]);

  const resetSilenceTimer = useCallback((currentTranscript) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (currentTranscript.trim()) {
        handleSubmit(currentTranscript);
      }
    }, 2000); // 2s of silence before auto-submit
  }, [handleSubmit]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recogRef.current) {
      try { recogRef.current.abort(); } catch (e) {}
      recogRef.current = null;
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    // Cancel any ongoing TTS so we can listen
    window.speechSynthesis.cancel();

    // Clean up any existing recognition
    if (recogRef.current) {
      try { recogRef.current.abort(); } catch (e) {}
      recogRef.current = null;
    }

    const r = new SR();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = true;

    r.onstart = () => {
      console.log('[Voice] Recognition started');
      setListening(true);
    };

    r.onresult = (e) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < e.results.length; ++i) {
        const result = e.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();
      if (fullTranscript && fullTranscript !== inputRef.current) {
        setInput(fullTranscript);
        resetSilenceTimer(fullTranscript);
      }
    };

    r.onerror = (e) => {
      console.log('[Voice] Recognition error:', e.error);
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      shouldRestartRef.current = false;
      setListening(false);
      recogRef.current = null;
    };

    r.onend = () => {
      console.log('[Voice] Recognition ended, shouldRestart:', shouldRestartRef.current);
      if (shouldRestartRef.current) {
        try {
          const newR = new SR();
          newR.lang = 'en-US';
          newR.continuous = true;
          newR.interimResults = true;
          newR.onstart = r.onstart;
          newR.onresult = r.onresult;
          newR.onerror = r.onerror;
          newR.onend = r.onend;
          recogRef.current = newR;
          newR.start();
          console.log('[Voice] Recognition restarted');
        } catch (e) {
          console.log('[Voice] Failed to restart:', e);
          shouldRestartRef.current = false;
          setListening(false);
          recogRef.current = null;
        }
      } else {
        setListening(false);
        recogRef.current = null;
      }
    };

    recogRef.current = r;
    shouldRestartRef.current = true;

    try {
      r.start();
    } catch (e) {
      console.error('[Voice] Failed to start recognition:', e);
      shouldRestartRef.current = false;
      setListening(false);
      recogRef.current = null;
    }
  }, [resetSilenceTimer]);

  // Stop listening when loading starts
  useEffect(() => {
    if (loading && listening) {
      stopListening();
    }
  }, [loading, listening, stopListening]);

  // Handle Ctrl+Enter key
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (inputRef.current.trim() && !loading && !isSpeaking) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [loading, isSpeaking, handleSubmit]);

  const micDisabled = loading || isSpeaking;

  return (
    <div className="flex flex-col border-t border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0a0e1a] p-4 flex-shrink-0 font-mono rounded-b-xl transition-colors">
      {voiceMode ? (
        <div className="flex flex-col items-center gap-3">
          {/* Main Mic Button */}
          <button
            onClick={() => {
              if (listening) {
                if (inputRef.current.trim()) {
                  handleSubmit();
                } else {
                  stopListening();
                }
              } else {
                startListening();
              }
            }}
            disabled={micDisabled}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
              listening
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse'
                : micDisabled
                ? 'bg-gray-300 dark:bg-slate-800 text-gray-400 dark:text-slate-600 opacity-50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
            }`}
          >
            {listening ? (
              <Square size={20} className="text-white fill-current" />
            ) : (
              <Mic size={22} className="text-white" />
            )}
          </button>

          {/* Status text */}
          <span className={`text-xs tracking-wider font-semibold ${
            listening ? 'text-red-500 dark:text-red-400 animate-pulse' : micDisabled ? 'text-gray-400 dark:text-slate-600' : 'text-gray-500 dark:text-slate-500'
          }`}>
            {loading ? 'PROCESSING...' : isSpeaking ? 'AI IS SPEAKING...' : listening ? 'LISTENING... (tap to send)' : 'TAP MIC TO SPEAK'}
          </span>

          {/* Show transcript preview */}
          {input && (
            <div className="w-full mt-1 p-3 bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-slate-300 text-sm italic transition-colors">
              &ldquo;{input}&rdquo;
            </div>
          )}

          {/* Send button appears when there's text but not listening */}
          {input.trim() && !listening && !loading && (
            <button
              onClick={() => handleSubmit()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold tracking-wider py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              SEND <Send size={14} />
            </button>
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
            className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-[#1e293b] rounded-lg text-gray-800 dark:text-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none font-mono placeholder-gray-400 dark:placeholder-slate-600 transition-colors"
            disabled={loading || isSpeaking}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !input.trim() || isSpeaking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-semibold tracking-wider py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            SEND <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
