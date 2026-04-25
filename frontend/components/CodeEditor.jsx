'use client';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

export default function CodeEditor({ code, onChange, language, onLanguageChange }) {
  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0e1a] rounded-xl overflow-hidden border border-gray-200 dark:border-[#1e293b] shadow-sm dark:shadow-none transition-colors">
      <div className="bg-gray-50 dark:bg-[#070b14] border-b border-gray-200 dark:border-[#0f172a] px-4 h-10 flex items-center justify-between flex-shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
          </div>
          <span className="text-gray-500 dark:text-slate-500 text-xs ml-2 font-mono">
            {`solution.${language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'js' ? 'js' : language === 'go' ? 'go' : 'rs'}`}
          </span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-gray-100 dark:bg-[#0f172a] text-gray-700 dark:text-slate-300 text-xs border border-gray-300 dark:border-[#1e293b] rounded px-2 py-1 outline-none font-mono transition-colors"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="js">JavaScript</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          key={`${language}`} // Force re-mount on language change to update defaultValue
          height="100%"
          language={language}
          defaultValue={code}
          onChange={(val) => onChange(val || '')}
          theme={editorTheme}
          options={{
            fontSize: 14,
            lineHeight: 22,
            letterSpacing: 0,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontLigatures: false, // Disabling ligatures fixes cursor offset issues
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            tabSize: 4,
            automaticLayout: true,
            cursorSmoothCaretAnimation: "on",
            renderWhitespace: "none",
          }}
        />
      </div>
    </div>
  );
}
