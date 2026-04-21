'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldX, Home, ArrowLeft, Lock, Fingerprint } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const clientIp = searchParams.get('ip') || 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 px-6">

      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-500/15 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[-15%] left-[-5%] w-[35%] h-[35%] bg-red-600/10 blur-[150px] rounded-full pointer-events-none"
      />

      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      }} />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="flex flex-col items-center z-10"
      >
        {/* Shield icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/20 dark:border-amber-500/10 flex items-center justify-center backdrop-blur-sm shadow-[0_0_60px_rgba(245,158,11,0.15)]">
            <ShieldX size={48} className="text-amber-500 dark:text-amber-400" />
          </div>
        </motion.div>

        {/* 403 text */}
        <div className="relative mb-4">
          <h1 className="text-[100px] md:text-[150px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-100 dark:from-white/20 dark:to-white/5 select-none">
            403
          </h1>
          <motion.div
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-[100px] md:text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500 select-none">
              403
            </span>
          </motion.div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
          Access <span className="text-amber-500">Denied</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
          This area is restricted to authorized personnel only. Your access request has been logged.
        </p>

        {/* Access info box */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-amber-500/10 rounded-2xl p-5 max-w-lg w-full mb-10 shadow-lg dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint size={14} className="text-amber-500" />
            <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase font-bold">Access Log</span>
          </div>
          <div className="font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Detected IP</span>
              <span className="text-red-500 dark:text-red-400 font-bold">{clientIp}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className="text-amber-500 font-bold flex items-center gap-1.5">
                <Lock size={11} /> BLOCKED
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Timestamp</span>
              <span className="text-gray-600 dark:text-gray-300">{new Date().toISOString()}</span>
            </div>
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

export default function ForbiddenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
        <p className="text-gray-500 font-mono tracking-widest text-sm">VERIFYING ACCESS...</p>
      </div>
    }>
      <ForbiddenContent />
    </Suspense>
  );
}
