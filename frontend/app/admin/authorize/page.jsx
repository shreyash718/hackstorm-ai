'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Laptop, ShieldCheck, Key, ArrowRight, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminAuthorizePage() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleAuthorize = (e) => {
    e.preventDefault();
    setStatus('loading');

    // Set the cookie (valid for 1 year)
    // In a real app, you'd verify this against the server, 
    // but for this "device lock" we'll set it and the middleware will verify it.
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `hackstorm_admin_auth=${secret}; path=/; expires=${expires.toUTCString()}; SameSite=Strict; Secure`;
      
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      }, 1000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 px-6">
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <Laptop size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">Device Authorization</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Link this laptop to the HackStorm AI Admin Network.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl transition-all">
          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-6 text-center"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">Device Linked</h2>
              <p className="text-sm text-gray-500">Redirecting to secure login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleAuthorize} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2 ml-1">
                  Device Secret Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Key size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="Enter device secret..."
                  />
                </div>
                <p className="mt-3 text-[10px] text-gray-400 leading-relaxed ml-1">
                  Once authorized, this laptop will bypass IP restrictions for 365 days. Keep your secret key confidential.
                </p>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                {status === 'loading' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Authorize This Laptop
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Hardware ID Tracking Enabled • Secure Session
          </p>
        </div>
      </motion.div>
    </div>
  );
}
