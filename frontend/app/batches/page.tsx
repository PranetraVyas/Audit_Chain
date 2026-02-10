'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getBatches, buildMerkleBatch, Batch } from '@/lib/api';

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check auth
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    loadBatches();
  }, [router]);

  const loadBatches = async () => {
    try {
      const data = await getBatches();
      setBatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildBatch = async () => {
    setBuilding(true);
    setError('');

    try {
      await buildMerkleBatch();
      await loadBatches(); // Reload batches
    } catch (err: any) {
      setError(err.message || 'Failed to build batch');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] bg-clip-text text-transparent">
              Merkle Batches
            </h1>
            <p className="text-gray-400 text-lg">Grouped audit logs with Merkle roots</p>
          </div>
          <button
            onClick={handleBuildBatch}
            disabled={building}
            className="bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#6C4EFF]/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {building ? 'Building...' : 'Build New Batch'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-400">Loading batches...</div>
        )}

        {!loading && !error && (
          <>
              {batches.length === 0 ? (
                <div className="glass rounded-2xl p-12 md:p-16 text-center">
                  <div className="text-6xl mb-4">🌳</div>
                  <p className="text-gray-300 text-lg mb-4">No Merkle batches found</p>
                  <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    Build a batch to group audit events into a Merkle tree
                  </p>
                  <button
                    onClick={handleBuildBatch}
                    disabled={building}
                    className="bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#6C4EFF]/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {building ? 'Building...' : 'Build First Batch'}
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {batches.map((batch) => (
                    <div
                      key={batch.batch_id}
                      className="glass rounded-2xl p-6 md:p-8 hover:border-[#6C4EFF]/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-white">Batch ID</h3>
                          <p className="text-sm text-gray-400 font-mono">{batch.batch_id}</p>
                        </div>
                        <div className="text-right glass rounded-xl px-4 py-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Events</div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-[#6C4EFF] to-[#944BFF] bg-clip-text text-transparent">
                            {batch.event_count}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Merkle Root</h4>
                        <p className="text-xs font-mono text-gray-300 break-all glass p-4 rounded-xl border border-white/10">
                          {batch.merkle_root}
                        </p>
                      </div>

                      <div className="text-xs text-gray-500 pt-4 border-t border-white/10">
                        Created: {new Date(batch.created_at).toLocaleString()}
                      </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="font-semibold mb-3 text-lg">About Merkle Batches</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Merkle batches group audit events into a cryptographic tree structure. Each batch has a unique Merkle root
            that anchors all events in the batch. This enables efficient verification of individual events without
            needing to verify the entire dataset.
          </p>
        </div>
      </main>
    </div>
  );
}

