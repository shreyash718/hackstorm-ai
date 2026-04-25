'use client';

import { useTheme } from "next-themes";
import { Moon, Sun, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="group relative p-2 rounded-lg bg-surface border border-muted hover:border-amber-500/60 text-primary transition-all shadow-lg shadow-black/5 overflow-hidden"
      aria-label="Toggle magical theme"
      title="Toggle magical theme"
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity spell-gradient" />
      <span className="relative flex items-center gap-1.5">
        <WandSparkles size={14} />
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
