'use client';
import { Editor } from '@monaco-editor/react';

export default function CodeEditor({ code, onChange, language, onLanguageChange }) {
  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] rounded-lg overflow-hidden border border-[#1e293b]">
      <div className="bg-[#070b14] border-b border-[#0f172a] px-4 h-9 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
          </div>
          <span className="text-slate-500 text-xs ml-2 font-mono">
            {language === 'python' ? 'solution.py' : language === 'cpp' ? 'solution.cpp' : 'Solution.java'}
          </span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-[#0f172a] text-slate-300 text-xs border border-[#1e293b] rounded px-2 py-1 outline-none font-mono"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => onChange(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
