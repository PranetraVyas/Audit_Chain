// Mock data for AuditChain application

export interface AuditEvent {
  eventId: string;
  modelId: string;
  eventType: 'Train' | 'Evaluate' | 'Deploy';
  eventHash: string;
  merkleLeaf: string;
  batchId: string | null;
  status: 'Anchored' | 'Batched' | 'Pending' | 'Failed';
  timestamp: string;
  modelName?: string;
}

export interface MerkleBatch {
  batchId: string;
  events: number;
  merkleRoot: string;
  status: 'Anchored' | 'Pending';
  created: string;
}

export interface MerkleNode {
  hash: string;
  eventId?: string;
  children?: MerkleNode[];
}

export const mockEvents: AuditEvent[] = [
  {
    eventId: 'EVT-001',
    modelId: 'MODEL-001',
    eventType: 'Train',
    eventHash: '0x7f83b165ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069d',
    merkleLeaf: '0xa4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    batchId: 'BATCH-042',
    status: 'Anchored',
    timestamp: '2024-01-15 14:32:18',
    modelName: 'ResNet-50'
  },
  {
    eventId: 'EVT-002',
    modelId: 'MODEL-002',
    eventType: 'Evaluate',
    eventHash: '0x3e23e816b9234d02d6bd7bd361123ad62f615869371f1c9247aee1b87e18df4e',
    merkleLeaf: '0xb5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    batchId: 'BATCH-042',
    status: 'Batched',
    timestamp: '2024-01-15 14:28:45',
    modelName: 'GPT-NeoX'
  },
  {
    eventId: 'EVT-003',
    modelId: 'MODEL-003',
    eventType: 'Deploy',
    eventHash: '0x5d41402abc4b2a76b9719d911017c5925923c3db8a1c4b6a841904e2228887e9',
    merkleLeaf: '0xc6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
    batchId: null,
    status: 'Pending',
    timestamp: '2024-01-15 14:25:12',
    modelName: 'BERT-Base'
  },
  {
    eventId: 'EVT-004',
    modelId: 'MODEL-001',
    eventType: 'Train',
    eventHash: '0x098f6bcd4621d373cade4e832627b4f6a2f8e1f2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    merkleLeaf: '0xd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    batchId: 'BATCH-041',
    status: 'Anchored',
    timestamp: '2024-01-15 14:20:33',
    modelName: 'YOLOv8'
  },
  {
    eventId: 'EVT-005',
    modelId: 'MODEL-004',
    eventType: 'Evaluate',
    eventHash: '0xfe2594d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    merkleLeaf: '0xe8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    batchId: 'BATCH-040',
    status: 'Failed',
    timestamp: '2024-01-15 14:15:07',
    modelName: 'Whisper'
  },
  {
    eventId: 'EVT-006',
    modelId: 'MODEL-005',
    eventType: 'Train',
    eventHash: '0xab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef560p56',
    merkleLeaf: '0xf9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    batchId: 'BATCH-043',
    status: 'Pending',
    timestamp: '2024-01-15 14:10:22',
    modelName: 'Transformer-XL'
  }
];

export const mockBatches: MerkleBatch[] = [
  {
    batchId: 'BATCH-042',
    events: 16,
    merkleRoot: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef123456cdef12',
    status: 'Anchored',
    created: '2024-01-15 14:30:00'
  },
  {
    batchId: 'BATCH-041',
    events: 14,
    merkleRoot: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef123456ef1234',
    status: 'Anchored',
    created: '2024-01-15 13:30:00'
  },
  {
    batchId: 'BATCH-040',
    events: 12,
    merkleRoot: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890f1234',
    status: 'Anchored',
    created: '2024-01-15 12:30:00'
  },
  {
    batchId: 'BATCH-043',
    events: 8,
    merkleRoot: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'Pending',
    created: '2024-01-15 15:00:00'
  }
];

export const mockMerkleTree: MerkleNode = {
  hash: '7f83fe',
  children: [
    {
      hash: '7f835d',
      children: [
        {
          hash: '7f833e',
          children: [
            { hash: '7f83b1', eventId: 'EVT-001' },
            { hash: '3e23e8', eventId: 'EVT-002' }
          ]
        },
        {
          hash: '5d4109',
          children: [
            { hash: '5d4140', eventId: 'EVT-003' },
            { hash: '098f6b', eventId: 'EVT-004' }
          ]
        }
      ]
    },
    {
      hash: 'fe25c4',
      children: [
        {
          hash: 'fe25d8',
          children: [
            { hash: 'fe2594', eventId: 'EVT-005' },
            { hash: 'd8e8fc', eventId: 'EVT-006' }
          ]
        },
        {
          hash: 'c4caa8',
          children: [
            { hash: 'c4ca42', eventId: 'EVT-007' },
            { hash: 'a87ff6', eventId: 'EVT-008' }
          ]
        }
      ]
    }
  ]
};

export const dashboardStats = {
  totalEvents: 12847,
  totalBatches: 1284,
  anchoredRoots: 856,
  verificationRequests: 3421,
  eventsChange: 12,
  batchesChange: 8,
  anchoredChange: 5,
  verificationChange: 23
};






