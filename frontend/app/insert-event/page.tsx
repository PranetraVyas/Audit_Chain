'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { createEvent, EventCreate } from '@/lib/api';

export default function InsertEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    modelId: '',
    modelName: '',
    modelVersion: '',
    framework: '',
    datasetName: '',
    datasetVersion: '',
    datasetHash: '',
    source: '',
    eventType: '',
    actor: '',
    environment: '',
  });
  const [eventHash, setEventHash] = useState('');
  const [merkleLeafHash, setMerkleLeafHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear hashes when form changes
    setEventHash('');
    setMerkleLeafHash('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const eventData: EventCreate = {
        model_id: formData.modelId,
        model_name: formData.modelName || undefined,
        model_version: formData.modelVersion || undefined,
        framework: formData.framework || undefined,
        dataset_name: formData.datasetName || undefined,
        dataset_version: formData.datasetVersion || undefined,
        dataset_hash: formData.datasetHash || undefined,
        source: formData.source || undefined,
        event_type: formData.eventType,
        actor: formData.actor || undefined,
        environment: formData.environment || undefined,
        timestamp: currentTimestamp,
        summary: undefined,
      };

      const createdEvent = await createEvent(eventData);
      
      // Update preview hashes
      setEventHash(createdEvent.metadata_hash);
      setMerkleLeafHash(createdEvent.merkle_leaf_hash || createdEvent.metadata_hash);
      
      // Redirect to audit logs after a short delay
      setTimeout(() => {
        router.push('/audit-logs');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit event');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      modelId: '',
      modelName: '',
      modelVersion: '',
      framework: '',
      datasetName: '',
      datasetVersion: '',
      datasetHash: '',
      source: '',
      eventType: '',
      actor: '',
      environment: '',
    });
    setEventHash('');
    setMerkleLeafHash('');
    setError('');
  };

  const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Insert Audit Event</h1>
          <p className="text-gray-400">
            Register ML lifecycle events for cryptographic hashing and blockchain anchoring.
          </p>
        </div>

        {/* Process Flow */}
        <div className="flex items-center justify-between bg-[#161618] rounded-xl p-4 border border-[#2A2A2C]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6C4EFF] flex items-center justify-center text-white font-bold">
              1
            </div>
            <span className="text-sm text-white">Input</span>
          </div>
          <div className="flex-1 h-px bg-[#2A2A2C] mx-4" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2A2A2C] flex items-center justify-center text-gray-400 font-bold">
              2
            </div>
            <span className="text-sm text-gray-400"># Hash</span>
          </div>
          <div className="flex-1 h-px bg-[#2A2A2C] mx-4" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2A2A2C] flex items-center justify-center text-gray-400 font-bold">
              3
            </div>
            <span className="text-sm text-gray-400">Batch</span>
          </div>
          <div className="flex-1 h-px bg-[#2A2A2C] mx-4" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2A2A2C] flex items-center justify-center text-gray-400 font-bold">
              4
            </div>
            <span className="text-sm text-gray-400">Anchor</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Information */}
          <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
            <h2 className="text-lg font-semibold text-white mb-4">MODEL INFORMATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="modelId"
                  value={formData.modelId}
                  onChange={handleChange}
                  placeholder="e.g., MODEL-001"
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model Name</label>
                <input
                  type="text"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleChange}
                  placeholder="e.g., ResNet-50"
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model Version</label>
                <input
                  type="text"
                  name="modelVersion"
                  value={formData.modelVersion}
                  onChange={handleChange}
                  placeholder="e.g., 1.0.0"
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Framework</label>
                <select
                  name="framework"
                  value={formData.framework}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
                >
                  <option value="">Select framework</option>
                  <option value="pytorch">PyTorch</option>
                  <option value="tensorflow">TensorFlow</option>
                  <option value="keras">Keras</option>
                  <option value="sklearn">Scikit-learn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model Hash (auto-generated)
                </label>
                <input
                  type="text"
                  readOnly
                  value=""
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Dataset Information */}
          <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
            <h2 className="text-lg font-semibold text-white mb-4">DATASET INFORMATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dataset Name</label>
                <input
                  type="text"
                  name="datasetName"
                  value={formData.datasetName}
                  onChange={handleChange}
                  placeholder="e.g., ImageNet-1K"
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dataset Version</label>
                <input
                  type="text"
                  name="datasetVersion"
                  value={formData.datasetVersion}
                  onChange={handleChange}
                  placeholder="e.g., 2024.1"
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dataset Hash</label>
                <input
                  type="text"
                  name="datasetHash"
                  value={formData.datasetHash}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
                >
                  <option value="">Select source</option>
                  <option value="local">Local</option>
                  <option value="s3">S3</option>
                  <option value="gcs">Google Cloud Storage</option>
                  <option value="azure">Azure Blob</option>
                </select>
              </div>
            </div>
          </div>

          {/* Event Metadata */}
          <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
            <h2 className="text-lg font-semibold text-white mb-4">EVENT METADATA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
                  required
                >
                  <option value="">Select event type</option>
                  <option value="Train">Train</option>
                  <option value="Evaluate">Evaluate</option>
                  <option value="Deploy">Deploy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Actor</label>
                <select
                  name="actor"
                  value={formData.actor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
                >
                  <option value="">Select actor</option>
                  <option value="user">User</option>
                  <option value="system">System</option>
                  <option value="automated">Automated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Environment</label>
                <select
                  name="environment"
                  value={formData.environment}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
                >
                  <option value="">Select environment</option>
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timestamp (auto-filled)
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentTimestamp}
                  className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Cryptographic Preview */}
        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <h2 className="text-lg font-semibold text-white mb-4">CRYPTOGRAPHIC PREVIEW</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                EVENT HASH (SHA-256)
              </label>
              <input
                type="text"
                readOnly
                value={eventHash || ''}
                className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-sm cursor-not-allowed"
                placeholder="Will be generated on submit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                MERKLE LEAF HASH
              </label>
              <input
                type="text"
                readOnly
                value={merkleLeafHash || ''}
                className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-300 font-mono text-sm cursor-not-allowed"
                placeholder="Will be generated on submit"
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-400">Pending Batch Inclusion</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">
              Once submitted, event data becomes immutable and cannot be altered. Verify all information before proceeding.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.modelId || !formData.eventType}
            className="w-full px-6 py-3 bg-[#6C4EFF] hover:bg-[#5a3fe6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </button>
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-[#1B1B1D] hover:bg-[#2A2A2C] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-[#2A2A2C]"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Form
          </button>
        </div>

        {/* Info */}
        <div className="bg-[#161618] rounded-xl p-4 border border-[#2A2A2C]">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#6C4EFF] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              Events are batched into Merkle trees and periodically anchored to the blockchain for tamper-proof verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

