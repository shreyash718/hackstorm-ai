'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Building2, LockKeyhole, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Navigate to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
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
                Please enter your credentials to access the secure portal.
            </p>
        </div>

        {/* Formal Login Card */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm relative transition-colors">
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm flex items-start gap-3">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

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
