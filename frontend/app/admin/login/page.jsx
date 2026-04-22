'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { sendAdminOTP, verifyAdminOTP } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Building2, LockKeyhole, Mail, Fingerprint, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: Password, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ip, setIp] = useState('Detecting...');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ip`)
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(err => setIp('Unknown'));
  }, []);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      setUserId(data.user.id);
      
      // Request OTP
      await sendAdminOTP(data.user.id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyAdminOTP(userId, otpCode);
      // Navigate to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex flex-col items-center justify-center font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 relative px-6">
      
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        
        {/* Corporate Header */}
        <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-900 dark:bg-blue-800 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
                System Administration
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === 1 ? 'Please enter your credentials to access the secure portal.' : 'Multi-factor authentication required.'}
            </p>
        </div>

        {/* Formal Login Card */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm relative transition-colors">
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm flex items-start gap-3">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleAdminAuth} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Corporate Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white dark:bg-[#0f141e] border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="admin@hackstorm.ai"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <LockKeyhole size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white dark:bg-[#0f141e] border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleOTPVerify} className="flex flex-col gap-6">
                    <div className="text-center mb-2">
                        <ShieldCheck size={40} className="mx-auto text-blue-600 mb-3" />
                        <h2 className="text-lg font-semibold">Verify Identity</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            We've sent a 6-digit verification code to your registered email.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full bg-white dark:bg-[#0f141e] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all placeholder-gray-400"
                            placeholder="000000"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otpCode.length !== 6}
                        className="w-full bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
                    >
                        {loading ? 'Verifying...' : 'Complete Login'}
                    </button>

                    <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Back to password login
                    </button>
                </form>
            )}

            {/* IP Indicator */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <Fingerprint size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Detected IP</span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600/70 dark:text-blue-400/70">{ip}</span>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
                Unauthorized access to this system is strictly prohibited.
                <br />
                &copy; {new Date().getFullYear()} HackStorm AI Inc.
            </p>
        </div>

      </div>
    </div>
  );
}
