'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function GoogleAuthRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get('next') || '/';
    
    // Store the redirect destination in localStorage on THIS domain (student domain)
    // This is the key fix: localStorage is now set on the same domain as the callback
    localStorage.setItem('redirectAfterAuth', next);
    
    // Now initiate Google OAuth with the callback on THIS same domain
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse">
          <Sparkles className="text-white" size={32} />
        </div>
        <p className="text-sm font-mono text-gray-500 dark:text-gray-400 tracking-widest uppercase">
          Redirecting to Google...
        </p>
      </motion.div>
    </div>
  );
}

export default function GoogleAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 font-mono tracking-widest">Loading...</p>
      </div>
    }>
      <GoogleAuthRedirect />
    </Suspense>
  );
}
