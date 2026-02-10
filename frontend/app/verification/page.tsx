'use client';

import { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function VerificationPage() {
  const [eventId, setEventId] = useState('');
  const [activeTab, setActiveTab] = useState<'eventId' | 'artifact'>('eventId');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    recomputedHash?: string;
    merkleRoot?: string;
    blockchainRoot?: string;
  } | null>(null);

  const handleVerify = () => {
    if (!eventId) return;

    // Mock verification
    setVerificationResult({
      valid: Math.random() > 0.3, // 70% chance of valid
      recomputedHash: '0x7f83b165ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069d',
      merkleRoot: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef123456cdef12',
      blockchainRoot: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef123456cdef12',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Verification</h1>
        <p className="text-gray-400">
          Verify the integrity and authenticity of audit events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verify Event Panel */}
        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-[#6C4EFF]" />
          <h2 className="text-xl font-bold text-white">Verify Event</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('eventId')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'eventId'
                ? 'bg-[#2A2A2C] text-white'
                : 'bg-[#1B1B1D] text-gray-400 hover:text-white'
            }`}
          >
            By Event ID
          </button>
          <button
            onClick={() => setActiveTab('artifact')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'artifact'
                ? 'bg-[#2A2A2C] text-white'
                : 'bg-[#1B1B1D] text-gray-400 hover:text-white'
            }`}
          >
            By Artifact
          </button>
        </div>

        {/* Input */}
        {activeTab === 'eventId' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event ID</label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Enter Event ID (e.g., EVT-001)"
                className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Artifact</label>
              <div className="border-2 border-dashed border-[#2A2A2C] rounded-lg p-8 text-center hover:border-[#6C4EFF] transition-colors cursor-pointer">
                <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JSON, CSV, or other artifact files</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleVerify}
          className="w-full mt-6 px-6 py-3 bg-[#6C4EFF] hover:bg-[#5a3fe6] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          Verify Event
        </button>
      </div>

      {/* Verification Result Panel */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <h2 className="text-xl font-bold text-white mb-6">Verification Result</h2>

        {!verificationResult ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <AlertCircle className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400">
              Enter an Event ID or upload an artifact to verify.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              verificationResult.valid
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {verificationResult.valid ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <div className={`font-bold ${
                  verificationResult.valid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {verificationResult.valid ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
                </div>
                <div className="text-sm text-gray-400">
                  {verificationResult.valid
                    ? 'Event integrity confirmed. Hash matches blockchain record.'
                    : 'Event integrity check failed. Hash mismatch detected.'}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Recomputed Hash
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-sm">
                  {verificationResult.recomputedHash}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Merkle Root
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-sm">
                  {verificationResult.merkleRoot}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Blockchain Root
                </label>
                <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-sm">
                  {verificationResult.blockchainRoot}
                </div>
              </div>

              {verificationResult.valid && (
                <div className="pt-4 border-t border-[#2A2A2C]">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All hashes match. Event is authentic and unaltered.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

