'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getBatches, Batch, anchorMerkleRoot } from '@/lib/api';
import { mockMerkleTree } from '@/lib/mockData';
import { MerkleNode } from '@/lib/mockData';

interface TreeNodeProps {
  node: MerkleNode;
  level: number;
  maxLevel: number;
  selectedPath: string[];
  onNodeClick: (hash: string) => void;
}

function TreeNode({ node, level, maxLevel, selectedPath, onNodeClick }: TreeNodeProps) {
  const isSelected = selectedPath.includes(node.hash);
  const isRoot = level === 0;
  const isLeaf = !node.children || node.children.length === 0;

  const getNodeColor = () => {
    if (isRoot) return 'bg-[#6C4EFF] text-white';
    if (isLeaf) return 'bg-green-500 text-white';
    return 'bg-gray-600 text-white';
  };

  const getNodeSize = () => {
    if (isRoot) return 'w-16 h-16 text-sm';
    if (isLeaf) return 'w-12 h-12 text-xs';
    return 'w-10 h-10 text-xs';
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onNodeClick(node.hash)}
        className={`${getNodeColor()} ${getNodeSize()} rounded-full flex items-center justify-center font-mono font-bold transition-all hover:scale-110 ${
          isSelected ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-[#0E0E0F]' : ''
        }`}
      >
        {node.hash.substring(0, 6)}
      </button>
      {isLeaf && node.eventId && (
        <div className="mt-1 text-xs text-gray-400">{node.eventId}</div>
      )}
      {node.children && node.children.length > 0 && level < maxLevel && (
        <div className="flex gap-4 mt-2">
          {node.children.map((child, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-px h-4 bg-[#2A2A2C]" />
              <TreeNode
                node={child}
                level={level + 1}
                maxLevel={maxLevel}
                selectedPath={selectedPath}
                onNodeClick={onNodeClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MerkleTreeVisualization({ tree }: { tree: MerkleNode }) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const findPathToRoot = (targetHash: string, node: MerkleNode, path: string[] = []): string[] | null => {
    const currentPath = [...path, node.hash];
    
    if (node.hash === targetHash) {
      return currentPath;
    }

    if (node.children) {
      for (const child of node.children) {
        const result = findPathToRoot(targetHash, child, currentPath);
        if (result) return result;
      }
    }

    return null;
  };

  const handleNodeClick = (hash: string) => {
    const path = findPathToRoot(hash, tree);
    if (path) {
      setSelectedPath(path);
    }
  };

  const maxDepth = 3;

  return (
    <div className="bg-[#161618] rounded-xl p-8 border border-[#2A2A2C] overflow-x-auto">
      <div className="flex flex-col items-center min-h-[400px]">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-2">Merkle Tree Visualization</h3>
          <p className="text-sm text-gray-400">
            Click on a leaf node to highlight the proof path to the root
          </p>
        </div>
        <div className="relative">
          <TreeNode
            node={tree}
            level={0}
            maxLevel={maxDepth}
            selectedPath={selectedPath}
            onNodeClick={handleNodeClick}
          />
        </div>
        <div className="mt-8 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#6C4EFF]" />
            <span className="text-gray-400">Root</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-gray-400">Leaf (Event)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-600" />
            <span className="text-gray-400">Internal Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-orange-400" />
            <span className="text-gray-400">Proof Path</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">BATCH-042</div>
      </div>
    </div>
  );
}

export default function MerkleBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchoringBatchId, setAnchoringBatchId] = useState<string | null>(null);
  const [anchorError, setAnchorError] = useState('');
  const [anchorSuccess, setAnchorSuccess] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await getBatches();
      setBatches(data || []);
    } catch (error) {
      console.error('Failed to load batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnchorBatch = async (batch: Batch) => {
    setAnchoringBatchId(batch.batch_id);
    setAnchorError('');
    setAnchorSuccess('');

    try {
      const result = await anchorMerkleRoot({
        batch_id: batch.batch_id,
        merkle_root: batch.merkle_root,
      });

      const statusLabel = result.status || 'success';
      setAnchorSuccess(
        `Batch ${batch.batch_id} anchored on blockchain (status: ${statusLabel}).`,
      );

      // Refresh batches so status updates to "Anchored"
      await loadBatches();
    } catch (err: any) {
      setAnchorError(err.message || 'Failed to anchor Merkle root for this batch.');
    } finally {
      setAnchoringBatchId(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Anchored' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 14)}...${hash.substring(hash.length - 6)}`;
  };

  const totalBatches = batches.length;
  const anchoredBatches = batches.filter(b => b.status === 'Anchored').length;
  const pendingBatches = batches.filter(b => b.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Merkle Batches</h1>
        <p className="text-gray-400">
          View all Merkle tree batches and their anchoring status
        </p>
      </div>

      {/* Anchor feedback */}
      {anchorError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
          {anchorError}
        </div>
      )}
      {anchorSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-300 text-sm">
          {anchorSuccess}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#6C4EFF]/20 rounded-lg">
              <svg className="w-6 h-6 text-[#6C4EFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {loading ? '...' : totalBatches.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">TOTAL BATCHES</div>
            </div>
          </div>
        </div>

        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {loading ? '...' : anchoredBatches.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">ANCHORED</div>
            </div>
          </div>
        </div>

        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {loading ? '...' : pendingBatches.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">PENDING</div>
            </div>
          </div>
        </div>
      </div>

      {/* Merkle Tree Visualization */}
      <MerkleTreeVisualization tree={mockMerkleTree} />

      {/* Batches Table */}
      <div className="bg-[#161618] rounded-xl border border-[#2A2A2C] overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2C]">
          <h2 className="text-xl font-bold text-white">All Batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1B1B1D] border-b border-[#2A2A2C]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Merkle Root
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2C]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Loading batches...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    No batches yet. Create events and build batches!
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.batch_id} className="hover:bg-[#1B1B1D] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {batch.batch_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {batch.event_count} events
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {truncateHash(batch.merkle_root)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(batch.status)}`} />
                        <span className="text-sm text-gray-300">{batch.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(batch.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button className="text-[#6C4EFF] hover:text-[#5a3fe6] transition-colors flex items-center gap-1 text-sm font-medium">
                          View Tree
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        {batch.status !== 'Anchored' && (
                          <button
                            onClick={() => handleAnchorBatch(batch)}
                            disabled={anchoringBatchId === batch.batch_id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#6C4EFF] hover:bg-[#5a3fe6] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {anchoringBatchId === batch.batch_id ? 'Anchoring...' : 'Anchor'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

