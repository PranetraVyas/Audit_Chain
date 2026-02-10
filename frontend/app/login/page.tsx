'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });
      
      // Store auth info
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      localStorage.setItem('username', response.username);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400">Access AuditChain with your credentials</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass border border-white/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#6C4EFF] focus:ring-2 focus:ring-[#6C4EFF]/20 transition-all duration-200"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass border border-white/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#6C4EFF] focus:ring-2 focus:ring-[#6C4EFF]/20 transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] px-6 py-3.5 rounded-xl font-medium hover:shadow-lg hover:shadow-[#6C4EFF]/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-3 font-medium">Test Credentials:</p>
            <div className="text-xs text-gray-500 space-y-2">
              <div className="p-2 rounded-lg glass border border-white/10">
                <span className="font-medium text-gray-300">Admin:</span> admin / admin123
              </div>
              <div className="p-2 rounded-lg glass border border-white/10">
                <span className="font-medium text-gray-300">ML Engineer:</span> ml_engineer / engineer123
              </div>
              <div className="p-2 rounded-lg glass border border-white/10">
                <span className="font-medium text-gray-300">Auditor:</span> auditor / auditor123
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

