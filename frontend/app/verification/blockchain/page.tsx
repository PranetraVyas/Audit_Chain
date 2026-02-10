'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, Loader2, Info } from 'lucide-react';
import { verifyOnBlockchain, getBlockchainStatus, BlockchainVerifyResponse } from '@/lib/api';

export default function BlockchainVerificationPage() {
  const [eventId, setEventId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<BlockchainVerifyResponse | null>(null);
  const [error, setError] = useState('');
  const [blockchainStatus, setBlockchainStatus] = useState<any>(null);

  useEffect(() => {
    loadBlockchainStatus();
  }, []);

  const loadBlockchainStatus = async () => {
    try {
      const status = await getBlockchainStatus();
      setBlockchainStatus(status);
    } catch (err) {
      console.error('Failed to load blockchain status:', err);
    }
  };

  const handleVerify = async () => {
    if (!eventId && !batchId) {
      setError('Please provide either Event ID or Batch ID');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const request: any = {};
      if (eventId) {
        request.event_id = parseInt(eventId);
      }
      if (batchId) {
        request.batch_id = batchId;
      }

      const result = await verifyOnBlockchain(request);
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Blockchain Verification</h1>
        <p className="text-gray-400">
          Verify audit events using on-chain Merkle roots anchored to the blockchain.
        </p>
      </div>

      {/* Blockchain Status */}
      {blockchainStatus && (
        <div className={`bg-[#161618] rounded-xl p-4 border ${
          blockchainStatus.connected 
            ? 'border-green-500/30' 
            : 'border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {blockchainStatus.connected ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="text-sm font-medium text-white">
                Blockchain Status: {blockchainStatus.connected ? 'Connected' : 'Disconnected'}
              </div>
              {blockchainStatus.connected && (
                <div className="text-xs text-gray-400 mt-1">
                  Network: {blockchainStatus.network || 'Unknown'}
                </div>
              )}
              {blockchainStatus.error && (
                <div className="text-xs text-red-400 mt-1">
                  {blockchainStatus.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Input Card */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-[#6C4EFF]" />
          <h2 className="text-xl font-bold text-white">Verify Audit Event on Blockchain</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event ID
            </label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                setBatchId(''); // Clear batch ID when event ID is entered
              }}
              placeholder="e.g., 1, 2, 3..."
              className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A2C]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#161618] text-gray-400">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Batch ID (Optional)
            </label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value);
                setEventId(''); // Clear event ID when batch ID is entered
              }}
              placeholder="e.g., BATCH-042"
              className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-300">
                This process validates the audit event using on-chain Merkle roots anchored to the blockchain.
              </p>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || (!eventId && !batchId)}
            className="w-full px-6 py-3 bg-[#6C4EFF] hover:bg-[#5a3fe6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Verify on Blockchain
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <h2 className="text-xl font-bold text-white mb-6">Verification Result</h2>

          {/* Status Badge */}
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            verificationResult.status === 'PASS'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {verificationResult.status === 'PASS' ? (
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <div>
              <div className={`text-xl font-bold ${
                verificationResult.status === 'PASS' ? 'text-green-400' : 'text-red-400'
              }`}>
                {verificationResult.status === 'PASS' ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {verificationResult.message}
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {verificationResult.anchor_id && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Anchor ID
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white font-mono text-sm">
                  {verificationResult.anchor_id}
                </div>
              </div>
            )}

            {verificationResult.block_number && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Block Number
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white font-mono text-sm">
                  {verificationResult.block_number.toLocaleString()}
                </div>
              </div>
            )}

            {verificationResult.computed_merkle_root && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Computed Merkle Root
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-xs break-all">
                  {verificationResult.computed_merkle_root}
                </div>
              </div>
            )}

            {verificationResult.onchain_merkle_root && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  On-chain Merkle Root
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-xs break-all">
                  {verificationResult.onchain_merkle_root}
                </div>
              </div>
            )}

            {verificationResult.details?.network && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Blockchain Network
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 text-sm">
                  {verificationResult.details.network}
                </div>
              </div>
            )}

            {verificationResult.transaction_hash && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Transaction Hash
                </label>
                <a
                  href={verificationResult.details?.explorer_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-[#6C4EFF] font-mono text-xs break-all hover:border-[#6C4EFF] transition-colors flex items-center gap-2"
                >
                  {verificationResult.transaction_hash}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {verificationResult.details && Object.keys(verificationResult.details).length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#2A2A2C]">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Additional Details</h3>
              <div className="bg-[#1B1B1D] rounded-lg p-4">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(verificationResult.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation Panel */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <h2 className="text-lg font-semibold text-white mb-4">How Blockchain Verification Works</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            <strong className="text-white">What was verified:</strong> The system recomputed the Merkle root from the stored audit event data and compared it with the Merkle root stored on the blockchain.
          </p>
          <p>
            <strong className="text-white">Why blockchain is the source of truth:</strong> The blockchain provides an immutable, publicly verifiable record. Once a Merkle root is anchored on-chain, it cannot be altered without detection, even by system administrators.
          </p>
          <p>
            <strong className="text-white">What PASS means:</strong> The computed Merkle root matches the on-chain root, confirming that the audit event data has not been tampered with since it was anchored.
          </p>
          <p>
            <strong className="text-white">What FAIL means:</strong> The roots do not match, indicating possible tampering, data corruption, or that the event was not properly anchored to the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}


