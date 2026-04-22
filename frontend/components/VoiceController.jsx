'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Send, Activity } from 'lucide-react';

export default function VoiceController({ onSendMessage, isSpeaking, loading, voiceMode }) {
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState('');
  const [volume, setVolume] = useState(0);
  const [autoListen, setAutoListen] = useState(true);

  const recogRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const inputRef = useRef('');
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // --- Handlers ---

  const handleSubmit = useCallback((textOverride) => {
    const text = textOverride !== undefined ? textOverride : inputRef.current;
    if (!text.trim() || loading) return;

    shouldRestartRef.current = false;
    if (recogRef.current) {
      try {
        recogRef.current.onend = null;
        recogRef.current.abort(); 
      } catch (e) {}
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
      if (currentTranscript.trim().length > 2) {
        handleSubmit(currentTranscript);
      }
    }, 1500); 
  }, [handleSubmit]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recogRef.current) {
      try {
        recogRef.current.onend = null;
        recogRef.current.stop(); 
      } catch (e) {}
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

    window.speechSynthesis.cancel();

    if (recogRef.current) {
      try { recogRef.current.abort(); } catch (e) {}
    }

    const r = new SR();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
      setListening(true);
      shouldRestartRef.current = true;
    };

    r.onresult = (e) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();
      if (fullTranscript) {
        setInput(fullTranscript);
        resetSilenceTimer(fullTranscript);
      }
    };

    r.onerror = (e) => {
      console.warn('[Voice] Error:', e.error);
      if (e.error === 'network') {
        alert("Network error with speech recognition. Please check your connection.");
      }
      if (e.error === 'not-allowed') {
        alert("Microphone access denied. Please enable it in browser settings.");
      }
    };

    r.onend = () => {
      if (shouldRestartRef.current && !loading && !isSpeaking) {
        try { r.start(); } catch (e) { setListening(false); }
      } else {
        setListening(false);
      }
    };

    recogRef.current = r;
    try {
      r.start();
    } catch (e) {
      setListening(false);
    }
  }, [resetSilenceTimer, loading, isSpeaking]);

  // --- Effects (defined after handlers to avoid initialization issues) ---

  useEffect(() => {
    if (voiceMode && autoListen && !isSpeaking && !loading && !listening && !input.trim()) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, loading, voiceMode, autoListen, listening, input, startListening]);

  useEffect(() => {
    if (listening && !isSpeaking && !loading) {
      const startVisualizer = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioContext;
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setVolume(avg);
            if (listening) requestAnimationFrame(updateVolume);
          };
          updateVolume();
        } catch (e) {
          console.error("Visualizer failed:", e);
        }
      };
      startVisualizer();
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setVolume(0);
    }
  }, [listening, isSpeaking, loading]);

  useEffect(() => {
    if (loading && listening) {
      stopListening();
    }
  }, [loading, listening, stopListening]);

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

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recogRef.current) {
        try { recogRef.current.abort(); } catch (e) {}
        recogRef.current = null;
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const micDisabled = loading || isSpeaking;

  return (
    <div className="flex flex-col border-t border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0a0e1a] p-4 flex-shrink-0 font-mono rounded-b-xl transition-colors">
      {voiceMode ? (
        <div className="flex flex-col items-center gap-3">
          {/* Main Mic Button */}
          <div className="relative">
            {listening && (
                <div 
                  className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
                  style={{ transform: `scale(${1 + volume / 100})` }}
                />
            )}
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
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg relative z-10 ${
                listening
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
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
          </div>

          {/* Status text */}
          <div className="flex items-center gap-2">
            {listening && <Activity size={12} className="text-red-500 animate-pulse" />}
            <span className={`text-[10px] tracking-widest font-bold uppercase ${
                listening ? 'text-red-500 dark:text-red-400' : micDisabled ? 'text-gray-400 dark:text-slate-600' : 'text-gray-500 dark:text-slate-500'
            }`}>
                {loading ? 'Processing...' : isSpeaking ? 'AI Speaking...' : listening ? 'Listening...' : 'Tap to speak'}
            </span>
          </div>

          {/* Auto-Listen Toggle */}
          <button 
            onClick={() => setAutoListen(!autoListen)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-bold tracking-tighter transition-all ${
              autoListen 
                ? 'bg-blue-600/10 border-blue-500/50 text-blue-600' 
                : 'bg-gray-100 border-gray-300 text-gray-500'
            }`}
          >
            {autoListen ? '🤖 AUTO-LISTEN ON' : '🖐️ MANUAL TAP MODE'}
          </button>

          {/* Show transcript preview */}
          {input && (
            <div className="w-full mt-1 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-slate-300 text-sm italic transition-colors">
              &ldquo;{input}&rdquo;
            </div>
          )}

          {input.trim() && !listening && !loading && (
            <button
              onClick={() => handleSubmit()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold tracking-wider py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              SEND RESPONSE <Send size={14} />
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
            placeholder="Type your response..."
            rows={3}
            className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-[#1e293b] rounded-lg text-gray-800 dark:text-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none font-mono transition-colors"
            disabled={loading || isSpeaking}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !input.trim() || isSpeaking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold tracking-wider py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            SEND <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
