'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Send, Activity, RotateCcw, Loader2 } from 'lucide-react';
import { transcribeAudio } from '@/lib/api';

export default function VoiceController({ onSendMessage, isSpeaking, loading, voiceMode }) {
  const [status, setStatus] = useState('idle'); // idle, recording, transcribing, ready
  const [input, setInput] = useState('');
  const [volume, setVolume] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // --- Handlers ---

  const startRecording = useCallback(async () => {
    try {
      window.speechSynthesis.cancel();
      audioChunksRef.current = [];
      
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

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('transcribing');
    }
    cleanupStream();
  }, [status]);

  const handleTranscribe = async (blob) => {
    try {
      const data = await transcribeAudio(blob);
      setInput(data.transcript);
      setStatus('ready');
    } catch (err) {
      console.error("Transcription failed:", err);
      setStatus('idle');
      alert("Transcription failed. Please try again or type your response.");
    }
  };

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

  useEffect(() => {
    return () => cleanupStream();
  }, []);

  // If AI starts speaking or we start loading, stop recording if active
  useEffect(() => {
    if ((isSpeaking || loading) && status === 'recording') {
      stopRecording();
    }
  }, [isSpeaking, loading, status, stopRecording]);

  const isDisabled = loading || isSpeaking;

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
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest animate-pulse">
                  <Activity size={14} /> Recording...
                </div>
              </div>
            )}

            {status === 'transcribing' && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">AI is Transcribing...</span>
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
          {status === 'idle' && (
            <span className="text-[10px] tracking-widest font-bold uppercase text-gray-400 dark:text-slate-600">
              {loading ? 'Processing...' : isSpeaking ? 'AI Speaking...' : 'Tap Mic to Start Answer'}
            </span>
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
