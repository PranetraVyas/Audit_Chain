'use client';

import { useState } from 'react';
import { Save, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [batchSize, setBatchSize] = useState(16);
  const [anchorInterval, setAnchorInterval] = useState(60);
  const [environment, setEnvironment] = useState('mumbai');
  const [autoAnchor, setAutoAnchor] = useState(true);
  const [gasOptimization, setGasOptimization] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Configure system parameters and preferences
        </p>
      </div>

      {/* Batch Configuration */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <h2 className="text-lg font-semibold text-white mb-6">Batch Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Batch Size</label>
              <span className="text-sm text-[#6C4EFF] font-medium">{batchSize} events</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Number of events per Merkle batch</p>
            <input
              type="range"
              min="8"
              max="32"
              step="1"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full h-2 bg-[#1B1B1D] rounded-lg appearance-none cursor-pointer accent-[#6C4EFF]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8</span>
              <span>32</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Anchor Interval</label>
              <span className="text-sm text-[#6C4EFF] font-medium">{anchorInterval} min</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Time between blockchain anchoring</p>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={anchorInterval}
              onChange={(e) => setAnchorInterval(Number(e.target.value))}
              className="w-full h-2 bg-[#1B1B1D] rounded-lg appearance-none cursor-pointer accent-[#6C4EFF]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15</span>
              <span>120</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <h2 className="text-lg font-semibold text-white mb-6">Network Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Environment</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
            >
              <option value="mumbai">Testnet (Mumbai)</option>
              <option value="polygon">Mainnet (Polygon)</option>
              <option value="ethereum">Ethereum</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Auto-anchor Batches
              </label>
              <p className="text-xs text-gray-500">
                Automatically anchor batches when full
              </p>
            </div>
            <button
              onClick={() => setAutoAnchor(!autoAnchor)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                autoAnchor ? 'bg-[#6C4EFF]' : 'bg-[#2A2A2C]'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoAnchor ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Gas Optimization
              </label>
              <p className="text-xs text-gray-500">
                Wait for optimal gas prices
              </p>
            </div>
            <button
              onClick={() => setGasOptimization(!gasOptimization)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                gasOptimization ? 'bg-[#6C4EFF]' : 'bg-[#2A2A2C]'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  gasOptimization ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Research Mode */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-blue-400" />
          <p className="text-sm text-blue-300">
            Research Mode. These settings are read-only in research configuration.
          </p>
        </div>
      </div>

      {/* Research Parameters */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <h2 className="text-lg font-semibold text-white mb-6">Research Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Hash Algorithm</label>
            <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-500">
              SHA-256
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tree Type</label>
            <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-500">
              Binary Merkle
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Consensus</label>
            <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-500">
              Proof of Stake
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Data Format</label>
            <div className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-gray-500">
              JSON-LD
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full px-6 py-3 bg-[#6C4EFF] hover:bg-[#5a3fe6] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Changes
      </button>
    </div>
  );
}






