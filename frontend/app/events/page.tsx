'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createEvent } from '@/lib/api';

export default function LogEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    model_id: '',
    event_type: 'training',
    timestamp: new Date().toISOString().slice(0, 16),
    summary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check auth
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Convert timestamp to ISO string
      const timestamp = new Date(formData.timestamp).toISOString();
      
      await createEvent({
        ...formData,
        timestamp,
        summary: formData.summary || undefined,
      });
      
      setSuccess(true);
      setFormData({
        model_id: '',
        event_type: 'training',
        timestamp: new Date().toISOString().slice(0, 16),
        summary: '',
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Log Event</h1>
          <p className="text-gray-400">Create a new ML audit event</p>
        </div>

        <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl">
          {success && (
            <div className="bg-[#00C48C]/10 border border-[#00C48C]/30 rounded-lg p-4 text-[#00C48C] mb-6">
              Event created successfully! Redirecting to dashboard...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="model_id" className="block text-sm font-medium mb-2">
                Model ID *
              </label>
              <input
                id="model_id"
                type="text"
                value={formData.model_id}
                onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                className="w-full glass border border-white/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#6C4EFF] focus:ring-2 focus:ring-[#6C4EFF]/20 transition-all duration-200"
                placeholder="e.g., model-v1.0"
                required
              />
            </div>

            <div>
              <label htmlFor="event_type" className="block text-sm font-medium mb-2">
                Event Type *
              </label>
              <select
                id="event_type"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full glass border border-white/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#6C4EFF] focus:ring-2 focus:ring-[#6C4EFF]/20 transition-all duration-200"
                required
              >
                <option value="training">Training</option>
                <option value="evaluation">Evaluation</option>
                <option value="deployment">Deployment</option>
              </select>
            </div>

            <div>
              <label htmlFor="timestamp" className="block text-sm font-medium mb-2">
                Timestamp *
              </label>
              <input
                id="timestamp"
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="w-full glass border border-white/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#6C4EFF] focus:ring-2 focus:ring-[#6C4EFF]/20 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium mb-2">
                Summary (Optional)
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                className="w-full bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg px-4 py-3 focus:outline-none focus:border-[#6C4EFF] transition-colors resize-none"
                placeholder="Brief description of the event..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] px-6 py-3.5 rounded-xl font-medium hover:shadow-lg hover:shadow-[#6C4EFF]/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2A2A2C]">
            <p className="text-xs text-gray-500 mb-2">Note:</p>
            <p className="text-xs text-gray-400">
              Only metadata is stored. No datasets, model files, or raw predictions are logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

