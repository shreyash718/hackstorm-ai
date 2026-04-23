'use client';
import { Mic, MicOff, Square, Send, Activity, RotateCcw, Loader2 } from 'lucide-react';
import useVoiceInput from '../features/interview/hooks/useVoiceInput';

export default function VoiceController({ onSendMessage, isSpeaking, loading, voiceMode }) {
  const {
    status,
    transcript,
    setTranscript,
    volume,
    recordingTime,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceInput({
    onSend: () => handleSend(),
    disabled: loading || isSpeaking
  });

  const handleSend = () => {
    if (!transcript.trim() || loading) return;
    onSendMessage(transcript);
    resetTranscript();
  };

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
                  <Activity size={14} /> Recording... {recordingTime}s
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
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Review your transcript..."
                  className="w-full bg-white dark:bg-[#0f172a] border border-blue-500/30 rounded-xl text-gray-800 dark:text-slate-200 p-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none font-mono transition-all shadow-inner italic"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={resetTranscript}
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
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
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
            disabled={loading || !transcript.trim() || isSpeaking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold tracking-wider py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            SEND <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
