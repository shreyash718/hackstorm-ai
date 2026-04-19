'use client';
import { useEffect, useRef } from 'react';

export default function ChatPanel({ messages, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] rounded-lg overflow-hidden border border-[#1e293b]">
      <div className="bg-[#070b14] border-b border-[#0f172a] px-4 h-9 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-slate-500 text-xs">AI Interviewer</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} className={`flex flex-col animate-fade-in ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="text-[10px] text-slate-500 mb-1 tracking-wider">
                {isUser ? 'YOU' : 'INTERVIEWER'}
              </div>
              <div
                className={`max-w-[92%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                  isUser
                    ? 'rounded-t-xl rounded-l-xl rounded-br-sm bg-blue-900/30 border border-blue-800/50 text-slate-200'
                    : 'rounded-t-xl rounded-r-xl rounded-bl-sm bg-slate-800/40 border border-slate-700/50 text-slate-300'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex flex-col items-start">
            <div className="text-[10px] text-slate-500 mb-1 tracking-wider">INTERVIEWER</div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-t-xl rounded-r-xl rounded-bl-sm bg-slate-800/40 border border-slate-700/50">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    style={{ animation: `pulse 1s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <span className="text-slate-400 text-xs ml-1">thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
