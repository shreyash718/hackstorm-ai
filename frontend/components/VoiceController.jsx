'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Send, Activity, RotateCcw, Loader2 } from 'lucide-react';

export default function VoiceController({ onSendMessage, isSpeaking, loading, voiceMode }) {
  const [status, setStatus] = useState('idle'); // idle, recording, uploading, transcribing, ready
  const [input, setInput] = useState('');
  const [volume, setVolume] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const isDisabled = loading || isSpeaking;

  // --- Initialize Speech Recognition ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        lastSpeechTimeRef.current = Date.now();
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        console.error("Speech Recognition Error:", event.error);
        setStatus('idle');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // --- Handlers ---

  const startRecording = useCallback(async () => {
    try {
      window.speechSynthesis.cancel();
      setInput('');
      lastSpeechTimeRef.current = Date.now();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // Setup Visualizer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateVolume = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        setVolume(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Start Recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setStatus('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        // Check for total recording limit (max 90s)
        setRecordingTime(prev => {
          const next = prev + 1;
          if (next >= 90) {
            stopRecording();
          }
          return next;
        });

        // Check for silence (30s)
        const secondsSinceLastSpeech = (Date.now() - lastSpeechTimeRef.current) / 1000;
        if (secondsSinceLastSpeech >= 30) {
          console.log("Silence detected (30s), stopping recording...");
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.stop(); 
        // Abort as a fallback to ensure it really stops in all browsers
        setTimeout(() => {
          try { recognitionRef.current.abort(); } catch(e) {}
        }, 100);
      } catch(e) {
        try { recognitionRef.current.abort(); } catch(e2) {}
      }
    }
    cleanupStream();
    setStatus('ready');
  }, []);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    analyzerRef.current = null;
    setVolume(0);
  };

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput('');
    setStatus('idle');
  }, [input, loading, onSendMessage]);

  const handleReset = () => {
    setInput('');
    setStatus('idle');
    cleanupStream();
  };

  // --- Effects ---

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        console.log("VoiceController: 'S' pressed. Status:", status);
        if (status === 'recording') {
          stopRecording();
        } else if (status === 'idle' && !isDisabled) {
          startRecording();
        }
      } else if (e.key === 'Enter' && status === 'ready') {
        e.preventDefault();
        handleSend();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, isDisabled, startRecording, stopRecording, handleSend]);

  useEffect(() => {
    return () => cleanupStream();
  }, []);

  // If AI starts speaking or we start loading, stop recording if active
  useEffect(() => {
    if ((isSpeaking || loading) && status === 'recording') {
      stopRecording();
    }
  }, [isSpeaking, loading, status, stopRecording]);


  return (
    <div className="flex flex-col border-t border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0a0e1a] p-4 flex-shrink-0 font-mono rounded-b-xl transition-colors">
      {voiceMode ? (
        <div className="flex flex-col items-center gap-4">
          
          {/* Main Action Area */}
          <div className="relative flex items-center justify-center w-full min-h-[80px]">
            {status === 'idle' && (
              <button
                onClick={startRecording}
                disabled={isDisabled}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isDisabled
                    ? 'bg-gray-300 dark:bg-slate-800 text-gray-400 dark:text-slate-600 opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 text-white'
                }`}
              >
                <Mic size={24} />
              </button>
            )}

            {status === 'recording' && (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                    style={{ transform: `scale(${1 + volume / 50})` }}
                  />
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30 relative z-10"
                  >
                    <Square size={20} className="fill-current" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest animate-pulse">
                    <Activity size={14} /> Recording... {recordingTime}s
                  </div>
                  {recordingTime > 30 && (
                    <div className="text-[10px] text-orange-500 font-bold uppercase tracking-tight">
                      Long answer, transcribing may take longer
                    </div>
                  )}
                </div>
              </div>
            )}

            {(status === 'uploading' || status === 'transcribing') && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                  {status === 'uploading' ? 'Uploading Audio...' : 'AI is Transcribing...'}
                </span>
              </div>
            )}

            {status === 'ready' && (
              <div className="w-full flex flex-col gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Review your transcript..."
                  className="w-full bg-white dark:bg-[#0f172a] border border-blue-500/30 rounded-xl text-gray-800 dark:text-slate-200 p-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none font-mono transition-all shadow-inner italic"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-slate-700 text-xs tracking-widest"
                  >
                    <RotateCcw size={14} /> RE-RECORD
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-xs tracking-widest"
                  >
                    <Send size={14} /> SEND RESPONSE
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Helper Status */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] tracking-widest font-bold uppercase text-gray-400 dark:text-slate-600">
              {loading ? 'Processing...' : isSpeaking ? 'AI Speaking...' : status === 'recording' ? 'Speaking...' : 'Ready to Start'}
            </span>
            <span className="text-[9px] tracking-tight font-medium text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-slate-900/50 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-800">
              Press <kbd className="font-bold text-blue-500 px-1">S</kbd> to Start/Stop speaking • <kbd className="font-bold text-blue-500 px-1">Enter</kbd> to Send
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your response..."
            rows={3}
            className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-[#1e293b] rounded-lg text-gray-800 dark:text-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none font-mono transition-colors"
            disabled={loading || isSpeaking}
          />
          <button
            onClick={handleSend}
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
