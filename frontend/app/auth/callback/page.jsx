'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { API_URL } from '@/lib/api';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error.message);
        router.push('/login?error=auth_callback_failed');
        return;
      }

      if (session) {
        const next = searchParams.get('next') || '/';
        const userId = session.user.id;

        if (next.includes('recruiter')) {
          try {
            const res = await fetch(`${API_URL}/recruiter/check/${userId}`);
            const checkData = await res.json();

            if (!checkData.is_recruiter) {
              await fetch(`${API_URL}/recruiter/make`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
              });
            }
          } catch (err) {
            console.error('Error during recruiter check/make:', err);
          }
        }

        router.push(next);
      } else {
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return <AuthCallbackLoading />;
}

function AuthCallbackLoading() {
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
        
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-widest text-gray-900 dark:text-white uppercase mb-2">
            Authenticating
          </h1>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
              />
            ))}
          </div>
        </div>
        
        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 tracking-tight transition-colors">
          Establishing secure session with HackStorm AI...
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
