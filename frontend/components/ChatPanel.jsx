'use client';
import { useEffect, useRef } from 'react';

export default function ChatPanel({ messages, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl overflow-hidden border border-muted shadow-sm dark:shadow-none transition-colors backdrop-blur-xl">
      <div className="bg-amber-50/75 dark:bg-[#070b14]/80 border-b border-muted px-4 h-10 flex items-center gap-2 flex-shrink-0 transition-colors">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
        <span className="text-secondary text-xs font-semibold tracking-wider">PENSIEVE INTERVIEWER</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} className={`flex flex-col animate-fade-in ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="text-[10px] text-text-muted mb-1 tracking-wider font-bold">
                {isUser ? 'YOU' : 'PENSIEVE'}
              </div>
              <div
                className={`max-w-[92%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                  isUser
                    ? 'rounded-t-xl rounded-l-xl rounded-br-sm bg-amber-100/80 dark:bg-amber-500/15 border border-amber-300/70 dark:border-amber-500/30 text-primary'
                    : 'rounded-t-xl rounded-r-xl rounded-bl-sm bg-white/70 dark:bg-slate-900/50 border border-muted text-secondary'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex flex-col items-start">
            <div className="text-[10px] text-text-muted mb-1 tracking-wider font-bold">PENSIEVE</div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-t-xl rounded-r-xl rounded-bl-sm bg-white/70 dark:bg-slate-900/50 border border-muted">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-amber-500"
                    style={{ animation: `pulse 1s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <span className="text-text-muted text-xs ml-1">consulting the scroll...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
