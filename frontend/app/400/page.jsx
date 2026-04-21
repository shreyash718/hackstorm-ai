'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileWarning, Home, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function BadRequest() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 px-6">

      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"
      />

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
        {/* Warning icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20 dark:border-indigo-500/10 flex items-center justify-center backdrop-blur-sm shadow-[0_0_60px_rgba(79,70,229,0.15)]">
            <FileWarning size={48} className="text-indigo-500 dark:text-indigo-400" />
          </div>
        </motion.div>

        {/* 400 text */}
        <div className="relative mb-4">
          <h1 className="text-[100px] md:text-[150px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-100 dark:from-white/20 dark:to-white/5 select-none">
            400
          </h1>
          <motion.div
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-[100px] md:text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500 select-none">
              400
            </span>
          </motion.div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
          Bad <span className="text-indigo-500">Request</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
          The request sent to the server was malformed or incomplete. This usually happens when the data is invalid.
        </p>

        {/* Help box */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full mb-10 shadow-lg dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-white/10">
            <HelpCircle size={14} className="text-gray-400" />
            <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Debugging Tips</span>
          </div>
          <ul className="text-xs space-y-3 font-medium text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">01.</span> Check if the URL contains any illegal characters.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">02.</span> Ensure your session hasn&apos;t expired.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">03.</span> Try clearing your browser cache or cookies.
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 30px rgba(79,70,229,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg uppercase cursor-pointer"
          >
            <RefreshCw size={16} /> Refresh Page
          </motion.div>
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold tracking-widest text-xs px-8 py-4 rounded-xl transition-all uppercase cursor-pointer"
            >
              <Home size={16} /> Return Home
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
