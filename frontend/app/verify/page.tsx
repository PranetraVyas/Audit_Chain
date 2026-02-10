'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { verifyEvent, VerifyResponse } from '@/lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const [verificationMode, setVerificationMode] = useState<'event_id' | 'metadata'>('event_id');
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Event ID form
  const [eventId, setEventId] = useState('');

  // Metadata form
  const [metadata, setMetadata] = useState({
    model_id: '',
    event_type: 'training',
    timestamp: '',
    summary: '',
    metadata_hash: '',
  });

  useEffect(() => {
    // Check auth
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const handleVerifyById = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await verifyEvent({ event_id: parseInt(eventId) });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyByMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const timestamp = metadata.timestamp ? new Date(metadata.timestamp).toISOString() : undefined;
      const response = await verifyEvent({
        model_id: metadata.model_id,
        event_type: metadata.event_type,
        timestamp: timestamp,
        summary: metadata.summary || undefined,
        metadata_hash: metadata.metadata_hash,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] bg-clip-text text-transparent">
            Verification
          </h1>
          <p className="text-gray-400 text-lg">Verify the integrity of audit events</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              setVerificationMode('event_id');
              setResult(null);
              setError('');
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              verificationMode === 'event_id'
                ? 'bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] shadow-lg shadow-[#6C4EFF]/30'
                : 'glass border border-white/10 hover:border-[#6C4EFF]'
            }`}
          >
            Verify by Event ID
          </button>
          <button
            onClick={() => {
              setVerificationMode('metadata');
              setResult(null);
              setError('');
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              verificationMode === 'metadata'
                ? 'bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] shadow-lg shadow-[#6C4EFF]/30'
                : 'glass border border-white/10 hover:border-[#6C4EFF]'
            }`}
          >
            Verify by Metadata
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {result && (
          <div
            className={`mb-6 border rounded-xl p-6 ${
              result.valid
                ? 'bg-[#00C48C]/10 border-[#00C48C]/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{result.valid ? '✓' : '✗'}</span>
              <span className={`font-semibold text-lg ${result.valid ? 'text-[#00C48C]' : 'text-red-400'}`}>
                {result.message}
              </span>
            </div>
            {result.details && (
              <div className="mt-4 text-sm opacity-90 glass rounded-xl p-4 border border-white/10">
                <pre className="font-mono text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="glass rounded-2xl p-8 md:p-10">
          {verificationMode === 'event_id' ? (
            <form onSubmit={handleVerifyById} className="space-y-6">
              <div>
                <label htmlFor="event_id" className="block text-sm font-medium mb-2">
                  Event ID *
                </label>
                <input
                  id="event_id"
                  type="number"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full glass border border-white/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#6C4EFF] focus:ring-2 focus:ring-[#6C4EFF]/20 transition-all duration-200"
                  placeholder="Enter event ID"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] px-6 py-3.5 rounded-xl font-medium hover:shadow-lg hover:shadow-[#6C4EFF]/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Verifying...' : 'Verify Event'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyByMetadata} className="space-y-6">
              <div>
                <label htmlFor="model_id" className="block text-sm font-medium mb-2">
                  Model ID *
                </label>
                <input
                  id="model_id"
                  type="text"
                  value={metadata.model_id}
                  onChange={(e) => setMetadata({ ...metadata, model_id: e.target.value })}
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
                  value={metadata.event_type}
                  onChange={(e) => setMetadata({ ...metadata, event_type: e.target.value })}
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
                  value={metadata.timestamp}
                  onChange={(e) => setMetadata({ ...metadata, timestamp: e.target.value })}
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
                  value={metadata.summary}
                  onChange={(e) => setMetadata({ ...metadata, summary: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg px-4 py-3 focus:outline-none focus:border-[#6C4EFF] transition-colors resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label htmlFor="metadata_hash" className="block text-sm font-medium mb-2">
                  Metadata Hash *
                </label>
                <input
                  id="metadata_hash"
                  type="text"
                  value={metadata.metadata_hash}
                  onChange={(e) => setMetadata({ ...metadata, metadata_hash: e.target.value })}
                  className="w-full bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg px-4 py-3 focus:outline-none focus:border-[#6C4EFF] transition-colors font-mono text-sm"
                  placeholder="Enter SHA-256 hash"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] px-6 py-3.5 rounded-xl font-medium hover:shadow-lg hover:shadow-[#6C4EFF]/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Verifying...' : 'Verify Metadata'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="font-semibold mb-3 text-lg">How Verification Works</h3>
          <ul className="text-sm text-gray-400 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#6C4EFF] mt-1">•</span>
              <span><strong className="text-gray-300">Event ID verification:</strong> Recomputes the hash from stored event data and compares with stored hash</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#6C4EFF] mt-1">•</span>
              <span><strong className="text-gray-300">Metadata verification:</strong> Computes hash from provided metadata and verifies against stored hash</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00C48C] mt-1">✓</span>
              <span><strong className="text-gray-300">Valid:</strong> Event integrity confirmed, no tampering detected</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">✗</span>
              <span><strong className="text-gray-300">Tampered:</strong> Hash mismatch indicates data modification</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

