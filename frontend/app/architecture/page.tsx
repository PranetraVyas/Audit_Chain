'use client';

import { Database, Hash, Network, Anchor, ShieldCheck, ArrowRight } from 'lucide-react';

const pipelineSteps = [
  {
    icon: Database,
    title: 'Audit Ingestion',
    description: 'Captures ML lifecycle events including training runs, evaluations, and deployments. Events are serialized with metadata.',
  },
  {
    icon: Hash,
    title: 'Cryptographic Hashing',
    description: 'Generates SHA-256 hashes of event payloads ensuring content integrity and creating unique fingerprints.',
  },
  {
    icon: Network,
    title: 'Merkle Tree Engine',
    description: 'Batches event hashes into Merkle trees, computing leaf nodes and generating compact proofs for verification.',
  },
  {
    icon: Anchor,
    title: 'Blockchain Anchoring',
    description: 'Anchors Merkle roots to a public blockchain (Ethereum/Polygon), creating immutable timestamps.',
  },
  {
    icon: ShieldCheck,
    title: 'Verification Engine',
    description: 'Validates event integrity by recomputing hashes, reconstructing Merkle proofs, and comparing on-chain roots.',
  },
];

const configSections = [
  {
    title: 'Hash Algorithm',
    items: [
      { label: 'Algorithm', value: 'SHA-256' },
      { label: 'Output Size', value: '256 bits' },
      { label: 'Encoding', value: 'Hexadecimal' },
    ],
  },
  {
    title: 'Merkle Tree',
    items: [
      { label: 'Structure', value: 'Binary Tree' },
      { label: 'Batch Size', value: '16 events' },
      { label: 'Proof Type', value: 'Inclusion Proof' },
    ],
  },
  {
    title: 'Blockchain',
    items: [
      { label: 'Network', value: 'Polygon Mumbai' },
      { label: 'Contract Type', value: 'Solidity 0.8+' },
      { label: 'Gas Strategy', value: 'EIP-1559' },
    ],
  },
  {
    title: 'Storage',
    items: [
      { label: 'Database', value: 'PostgreSQL' },
      { label: 'Event Store', value: 'Append-only' },
      { label: 'Indexing', value: 'B-Tree + Hash' },
    ],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Architecture</h1>
        <p className="text-gray-400">
          Overview of the blockchain-backed audit logging pipeline.
        </p>
      </div>

      {/* Data Flow Pipeline */}
      <div className="bg-[#161618] rounded-xl p-8 border border-[#2A2A2C]">
        <h2 className="text-xl font-bold text-white mb-6">Data Flow Pipeline</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 overflow-x-auto pb-4">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center min-w-[200px]">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-[#6C4EFF]/20 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-[#6C4EFF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < pipelineSteps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-600 mx-4 flex-shrink-0 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configSections.map((section, index) => (
          <div key={index} className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
            <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-[#2A2A2C] last:border-0">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}






