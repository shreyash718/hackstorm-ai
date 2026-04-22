'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchAdminDashboard, addProblem, updateProblem, deleteProblem, toggleProblemVisibility, addUser, deleteUser, addAdmin, removeAdmin, addRecruiter, removeRecruiter } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Trash2, UserPlus, Shield, Users, Database, LayoutTemplate, UserCog, Building2, LogOut, Edit, Eye, EyeOff, Globe, Lock } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal State
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [newProblem, setNewProblem] = useState({
    title: '', difficulty: 'Medium', description: '', constraints: '', tags: '',
    examples: '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}]',
    is_public: true
  });
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [targetId, setTargetId] = useState('');

  const loadDashboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/admin/login'); return; }
    setUser(session.user);
    try {
      const dashboardData = await fetchAdminDashboard(session.user.id);
      setData(dashboardData);
    } catch (err) {
      if (err.response?.status === 403) setError("You do not have administrative privileges to access this system.");
      else setError("System Error: Failed to retrieve dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [router]);

  const handleAction = async (actionFn, ...args) => {
    setSubmitting(true);
    try {
      await actionFn(user.id, ...args);
      await loadDashboard();
      setTargetId('');
      setIsUserModalOpen(false);
    } catch (err) {
      alert("Operation failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const problemData = {
        title: newProblem.title, difficulty: newProblem.difficulty,
        description: newProblem.description, constraints: newProblem.constraints,
        tags: newProblem.tags.split(',').map(t => t.trim()),
        examples: JSON.parse(newProblem.examples), user_id: user.id,
        is_public: newProblem.is_public
      };

      if (editingProblemId) {
        await updateProblem(user.id, editingProblemId, problemData);
        alert('Record updated successfully.');
      } else {
        await addProblem(problemData);
        alert('Record inserted successfully.');
      }
      
      setIsProblemModalOpen(false);
      setEditingProblemId(null);
      await loadDashboard();
    } catch (err) { alert("Operation failed."); } 
    finally { setSubmitting(false); }
  };

  const openEditModal = (problem) => {
    setEditingProblemId(problem.id);
    setNewProblem({
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      constraints: problem.constraints,
      tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : (problem.tags || ''),
      examples: typeof problem.examples === 'string' ? problem.examples : JSON.stringify(problem.examples),
      is_public: problem.is_public
    });
    setIsProblemModalOpen(true);
  };

  if (loading) return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center font-sans text-sm text-gray-500">
          <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mb-4" />
          Authenticating System Access...
      </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center font-sans p-6 text-center">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-md border border-gray-300 dark:border-gray-800 shadow-sm max-w-md w-full">
          <Shield size={48} className="mx-auto mb-6 text-red-700" />
          <h1 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">{error}</p>
          <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="w-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white py-2 rounded-md font-medium text-sm transition-colors">Return to Homepage</button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: LayoutTemplate },
    { id: 'problems', label: 'Assessment Database', icon: Database },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'recruiters', label: 'Recruiter Access', icon: UserCog },
    { id: 'admins', label: 'Administrator Access', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
      {/* Enterprise Header */}
      <header className="h-14 bg-[#0F172A] border-b border-gray-800 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 text-white">
          <Building2 size={20} className="text-blue-400" />
          <span className="font-semibold text-sm tracking-wide">HackStorm AI Enterprise Administration</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-md">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-300 font-medium">System Online</span>
          </div>
          <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex-shrink-0 py-6 flex flex-col">
            <div className="px-6 mb-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Management</p>
            </div>
            <nav className="flex-1 flex flex-col gap-1 px-3">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    )
                })}
            </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Overview</h2>
                            <p className="text-xs text-gray-500">Data retrieved at {new Date().toLocaleTimeString()}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-5 rounded-md shadow-sm flex flex-col">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Assessments</span>
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.stats.total_interviews}</span>
                            </div>
                            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-5 rounded-md shadow-sm flex flex-col">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Generated Reports</span>
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.stats.completed_interviews}</span>
                            </div>
                            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-5 rounded-md shadow-sm flex flex-col">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Average Evaluation Score</span>
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.stats.average_score}%</span>
                            </div>
                            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-5 rounded-md shadow-sm flex flex-col">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Repository Items</span>
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.stats.total_problems}</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm mt-8">
                            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0B0F19]/50">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Session Activity Log</h3>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
                                {data.sessions.map((s, i) => (
                                    <div key={i} className="px-5 py-3 flex justify-between items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-xs text-gray-500 w-24 truncate">{s.id.split('-')[0]}</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">User: {s.user_id ? s.user_id.split('-')[0] : 'Anonymous'}</span>
                                            <span className="text-gray-500">| Problem ID: {s.problem_id}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <span className="text-xs">{new Date(s.started_at).toLocaleString()}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${s.phase === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {s.phase}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Directory</h2>
                            <button onClick={() => setIsUserModalOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors">
                                <UserPlus size={16}/> Provision New User
                            </button>
                        </div>
                        
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-3">Account Identifier (UUID)</th>
                                        <th className="px-6 py-3">Email Address</th>
                                        <th className="px-6 py-3">Date Provisioned</th>
                                        <th className="px-6 py-3 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {data.users.map((u, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{u.email}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(u.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => { if(confirm(`Confirm deletion of user ${u.email}? This action is irreversible.`)) handleAction(deleteUser, u.id) }} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 flex items-center gap-1 justify-end w-full font-medium transition-colors">
                                                    <Trash2 size={14}/> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* RECRUITERS TAB */}
                {activeTab === 'recruiters' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recruiter Access Management</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage platform privileges for enterprise recruiters.</p>
                        </div>
                        
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-md p-6 shadow-sm mb-6">
                            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Grant Recruiter Privileges</h3>
                            <div className="flex items-end gap-4 max-w-2xl">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Account UUID</label>
                                    <input value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" />
                                </div>
                                <button onClick={() => handleAction(addRecruiter, targetId)} disabled={submitting || !targetId} className="bg-[#0F172A] hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium text-sm disabled:opacity-50 transition-colors h-[38px]">
                                    Authorize Role
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-3">Account Identifier (UUID)</th>
                                        <th className="px-6 py-3">Role Assignment Date</th>
                                        <th className="px-6 py-3 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {data.recruiters.map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900 dark:text-gray-300">{r.user_id}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => { if(confirm('Revoke recruiter privileges?')) handleAction(removeRecruiter, r.user_id) }} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-medium transition-colors">
                                                    Revoke Privileges
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ADMINS TAB */}
                {activeTab === 'admins' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={20} className="text-red-700"/> Administrator Access Management</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage global administrative privileges. Exercise caution.</p>
                        </div>
                        
                        <div className="bg-white dark:bg-[#111827] border border-red-200 dark:border-red-900/30 rounded-md p-6 shadow-sm mb-6">
                            <h3 className="text-sm font-semibold mb-3 text-red-700 dark:text-red-400">Elevate to Administrator</h3>
                            <div className="flex items-end gap-4 max-w-2xl">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Account UUID</label>
                                    <input value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" />
                                </div>
                                <button onClick={() => { if(confirm('WARNING: Granting admin privileges provides full access to the system. Continue?')) handleAction(addAdmin, targetId) }} disabled={submitting || !targetId} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md font-medium text-sm disabled:opacity-50 transition-colors h-[38px]">
                                    Grant Clearance
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-red-50 dark:bg-red-900/10 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-3">Administrator UUID</th>
                                        <th className="px-6 py-3">Elevation Date</th>
                                        <th className="px-6 py-3 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {data.admins.map((a, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900 dark:text-gray-300">{a.user_id}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                {a.user_id !== user?.id ? (
                                                    <button onClick={() => { if(confirm('Revoke administrative privileges?')) handleAction(removeAdmin, a.user_id) }} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-medium transition-colors">
                                                        Revoke Clearance
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Current Active Session</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PROBLEM BANK TAB */}
                {activeTab === 'problems' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assessment Database</h2>
                            <button onClick={() => { setEditingProblemId(null); setNewProblem({ title: '', difficulty: 'Medium', description: '', constraints: '', tags: '', examples: '[]', is_public: true }); setIsProblemModalOpen(true); }} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors">
                                <Database size={16}/> Provision New Assessment
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Title / Difficulty</th>
                                        <th className="px-6 py-3">Source</th>
                                        <th className="px-6 py-3">Visibility</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {data.problems.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{p.title}</div>
                                                <div className={`text-[10px] font-bold uppercase mt-0.5 ${p.difficulty === 'Easy' ? 'text-green-600' : p.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {p.difficulty}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.created_by ? (
                                                    <div className="flex flex-col">
                                                        <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                            <Building2 size={12}/> Recruiter
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono">{p.created_by.split('-')[0]}...</span>
                                                    </div>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                        <Shield size={12}/> Platform
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleAction(toggleProblemVisibility, p.id, !p.is_public)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                                                        p.is_public 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {p.is_public ? <Globe size={10}/> : <Lock size={10}/>}
                                                    {p.is_public ? 'Public' : 'Private'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => openEditModal(p)} className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                                        <Edit size={16}/>
                                                    </button>
                                                    <button onClick={() => { if(confirm(`Confirm deletion of problem "${p.title}"?`)) handleAction(deleteProblem, p.id) }} className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </main>
      </div>

      {/* Provision User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="font-semibold text-gray-900 dark:text-white">Provision New Account</h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAction(addUser, newUser.email, newUser.password); }} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Corporate Email Address</label>
                <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                <input type="password" required minLength={6} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-6 py-2 rounded-md disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision Problem Modal */}
      {isProblemModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 w-full max-w-2xl rounded-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 dark:text-white">{editingProblemId ? 'Modify Assessment Definition' : 'Provision Assessment Definition'}</h2>
              <button onClick={() => setIsProblemModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleAddProblem} className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment Title</label>
                  <input required value={newProblem.title} onChange={e => setNewProblem({...newProblem, title: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Classification</label>
                  <select value={newProblem.difficulty} onChange={e => setNewProblem({...newProblem, difficulty: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Problem Specification</label>
                <textarea required rows={4} value={newProblem.description} onChange={e => setNewProblem({...newProblem, description: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Technical Constraints (newline separated)</label>
                <textarea required rows={2} value={newProblem.constraints} onChange={e => setNewProblem({...newProblem, constraints: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categorization Tags (comma separated)</label>
                <input required value={newProblem.tags} onChange={e => setNewProblem({...newProblem, tags: e.target.value})} placeholder="e.g. Array, Hash Table" className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Example IO (JSON Payload)</label>
                <textarea required rows={3} value={newProblem.examples} onChange={e => setNewProblem({...newProblem, examples: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-800">
                <input 
                  type="checkbox" 
                  id="is_public" 
                  checked={newProblem.is_public} 
                  onChange={e => setNewProblem({...newProblem, is_public: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Globe size={14}/> Make this problem public on the repository
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-gray-200 dark:border-gray-800 pt-4">
                <button type="button" onClick={() => setIsProblemModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-6 py-2 rounded-md disabled:opacity-50 transition-colors">
                  {submitting ? 'Processing...' : (editingProblemId ? 'Update Record' : 'Commit Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
