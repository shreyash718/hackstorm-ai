'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code2, Ghost, Home, ArrowLeft, Search, Fingerprint } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function NotFound() {
  const [ip, setIp] = useState('Detecting...');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ip`)
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(err => setIp('Unknown'));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 px-6">

      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/15 blur-[150px] rounded-full pointer-events-none"
      />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Glitch 404 display */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="flex flex-col items-center z-10"
      >
        {/* Ghost icon */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 dark:border-blue-500/10 flex items-center justify-center backdrop-blur-sm shadow-[0_0_60px_rgba(59,130,246,0.15)]">
            <Ghost size={48} className="text-blue-500 dark:text-blue-400" />
          </div>
        </motion.div>

        {/* 404 text */}
        <div className="relative mb-4">
          <motion.h1
            className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-100 dark:from-white/20 dark:to-white/5 select-none"
          >
            404
          </motion.h1>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-[120px] md:text-[180px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-400 dark:to-violet-400 select-none opacity-30">
              404
            </span>
          </motion.div>
        </div>

        {/* Terminal-style message */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full mb-10 shadow-lg dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="ml-2 text-[10px] font-mono text-gray-500 tracking-widest uppercase">interview blitz terminal</span>
          </div>
          <div className="font-mono text-sm space-y-2">
            <p className="text-gray-500 dark:text-gray-400">
              <span className="text-blue-500">$</span> find /page --path &quot;{typeof window !== 'undefined' ? window.location.pathname : '/unknown'}&quot;
            </p>
            <p className="text-red-500 dark:text-red-400 font-bold">
              Error: Page not found in the arena.
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              <span className="text-blue-500">$</span> <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>▋</motion.span>
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Fingerprint size={12} />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Network IP</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400">{ip}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0px 0px 30px rgba(59,130,246,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg uppercase cursor-pointer"
            >
              <Home size={16} /> Return Home
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold tracking-widest text-xs px-8 py-4 rounded-xl transition-all uppercase cursor-pointer"
          >
            <ArrowLeft size={16} /> Go Back
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
