'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RotateCcw, Bug, FileWarning, Fingerprint } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ErrorPage({ error, reset }) {
  const [ip, setIp] = useState('Detecting...');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ip`)
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(err => setIp('Unknown'));
    console.error('Application error:', error);
  }, [error]);

  // Try to extract a status code or use a generic one
  const isBadRequest = error?.message?.includes('400') || error?.status === 400;
  const isForbidden = error?.message?.includes('403') || error?.status === 403;
  
  const statusCode = isBadRequest ? '400' : isForbidden ? '403' : '500';
  const title = isBadRequest ? 'Bad Request' : isForbidden ? 'Access Denied' : 'Runtime Exception';
  const description = isBadRequest 
    ? 'The request was malformed. Please check your data and try again.'
    : isForbidden 
    ? 'You do not have permission to access this resource.'
    : 'Something unexpected broke during execution. Our AI is analyzing the crash logs.';

  const colorClass = isBadRequest ? 'indigo' : isForbidden ? 'amber' : 'red';
  const gradientFrom = isBadRequest ? 'indigo-600' : isForbidden ? 'amber-500' : 'red-600';
  const gradientTo = isBadRequest ? 'blue-600' : isForbidden ? 'red-500' : 'orange-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 px-6">

      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-${colorClass}-600/15 blur-[150px] rounded-full pointer-events-none`}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-${isBadRequest ? 'blue' : 'orange'}-500/15 blur-[150px] rounded-full pointer-events-none`}
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
        {/* Pulsing icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="mb-8"
        >
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-${gradientFrom}/20 to-${gradientTo}/20 border border-${gradientFrom}/20 dark:border-${gradientFrom}/10 flex items-center justify-center backdrop-blur-sm shadow-[0_0_60px_rgba(239,68,68,0.2)]`}>
            {isBadRequest ? (
              <FileWarning size={48} className="text-indigo-500" />
            ) : (
              <AlertTriangle size={48} className={`text-${colorClass}-500 dark:text-${colorClass}-400`} />
            )}
          </div>
        </motion.div>

        {/* Status code text */}
        <div className="relative mb-4">
          <h1 className="text-[100px] md:text-[150px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-100 dark:from-white/20 dark:to-white/5 select-none">
            {statusCode}
          </h1>
          <motion.div
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className={`text-[100px] md:text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-${gradientFrom} to-${gradientTo} select-none`}>
              {statusCode}
            </span>
          </motion.div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
          {title.split(' ')[0]} <span className={`text-${colorClass}-500`}>{title.split(' ')[1]}</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
          {description}
        </p>

        {/* Error detail box */}
        <div className={`bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-${colorClass}-500/10 rounded-2xl p-5 max-w-lg w-full mb-10 shadow-lg dark:shadow-2xl transition-colors`}>
          <div className="flex items-center gap-2 mb-3">
            <Bug size={14} className={`text-${colorClass}-500`} />
            <span className={`text-[10px] font-mono text-${colorClass}-500 tracking-widest uppercase font-bold`}>Diagnostic Info</span>
          </div>
          <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all leading-relaxed mb-4">
            {error?.message || 'An unexpected error occurred during execution.'}
          </p>
          <div className={`pt-3 border-t border-${colorClass}-500/10 flex items-center justify-between`}>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Fingerprint size={12} />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Node IP</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-500">{ip}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0px 0px 30px rgba(239,68,68,0.4)` }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className={`flex items-center gap-2 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} text-white font-bold tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg uppercase cursor-pointer`}
          >
            <RotateCcw size={16} /> Try Again
          </motion.button>
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
