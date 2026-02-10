/**
 * API client for AuditChain backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  username: string;
}

export interface Event {
  id: number;
  model_id: string;
  model_name?: string;
  model_version?: string;
  framework?: string;
  dataset_name?: string;
  dataset_version?: string;
  dataset_hash?: string;
  source?: string;
  event_type: string;
  actor?: string;
  environment?: string;
  timestamp: string;
  summary?: string;
  metadata_hash: string;
  merkle_leaf_hash?: string;
  batch_id?: string;
  status: string;
  created_at: string;
}

export interface EventCreate {
  model_id: string;
  model_name?: string;
  model_version?: string;
  framework?: string;
  dataset_name?: string;
  dataset_version?: string;
  dataset_hash?: string;
  source?: string;
  event_type: string;
  actor?: string;
  environment?: string;
  timestamp: string;
  summary?: string;
}

export interface Batch {
  batch_id: string;
  merkle_root: string;
  event_count: number;
  status: string;
  created_at: string;
}

export interface VerifyRequest {
  event_id?: number;
  model_id?: string;
  event_type?: string;
  timestamp?: string;
  summary?: string;
  metadata_hash?: string;
}

export interface VerifyResponse {
  valid: boolean;
  message: string;
  details?: any;
}

// Auth functions
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  return response.json();
}

// Event functions
export async function createEvent(event: EventCreate): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create event');
  }
  
  return response.json();
}

export async function getEvents(limit = 100, offset = 0): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getEvent(eventId: number): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  
  return response.json();
}

// Batch functions
export async function getBatches(): Promise<Batch[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/merkle/batches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch batches:', response.status, errorText);
      // Return empty array instead of throwing to prevent page crash
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching batches:', error);
    // Return empty array on network errors
    return [];
  }
}

export async function buildMerkleBatch(eventIds?: number[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/merkle/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_ids: eventIds || null }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to build Merkle batch');
  }
  
  return response.json();
}

// Blockchain functions
export interface AnchorRequest {
  batch_id: string;
  merkle_root: string;
}

export interface AnchorResponse {
  anchor_id: number | null;
  transaction_hash: string | null;
  block_number: number | null;
  block_hash: string | null;
  status: string;
  error?: string;
}

export interface BlockchainVerifyRequest {
  event_id?: number;
  batch_id?: string;
}

export interface BlockchainVerifyResponse {
  status: 'PASS' | 'FAIL';
  computed_merkle_root?: string;
  onchain_merkle_root?: string;
  anchor_id?: number;
  transaction_hash?: string;
  block_number?: number;
  message: string;
  details?: {
    network?: string;
    explorer_url?: string;
    error?: string;
    stored_root?: string;
    onchain_root?: string;
    mismatch?: string;
  };
}

export async function anchorMerkleRoot(request: AnchorRequest): Promise<AnchorResponse> {
  const response = await fetch(`${API_BASE_URL}/blockchain/anchor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to anchor Merkle root');
  }
  
  return response.json();
}

export async function getAnchor(anchorId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/blockchain/anchor/${anchorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get anchor');
  }
  
  return response.json();
}

export async function verifyOnBlockchain(request: BlockchainVerifyRequest): Promise<BlockchainVerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/blockchain/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Verification failed');
  }
  
  return response.json();
}

export async function getBlockchainStatus(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/blockchain/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    return { connected: false, error: 'Failed to get status' };
  }
  
  return response.json();
}

// Dashboard stats
export async function getDashboardStats() {
  try {
    const [events, batches] = await Promise.all([
      getEvents(1000, 0),
      getBatches(),
    ]);
    
    const totalEvents = events?.length || 0;
    const totalBatches = batches?.length || 0;
    const anchoredBatches = batches?.filter(b => b.status === 'Anchored').length || 0;
    const pendingBatches = batches?.filter(b => b.status === 'Pending').length || 0;
    
    // Count verification requests (placeholder - would come from separate endpoint)
    const verificationRequests = 0;
    
    return {
      totalEvents,
      totalBatches,
      anchoredRoots: anchoredBatches,
      verificationRequests,
      eventsChange: 0, // Would calculate from historical data
      batchesChange: 0,
      anchoredChange: 0,
      verificationChange: 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalEvents: 0,
      totalBatches: 0,
      anchoredRoots: 0,
      verificationRequests: 0,
      eventsChange: 0,
      batchesChange: 0,
      anchoredChange: 0,
      verificationChange: 0,
    };
  }
}

// Verification functions
export async function verifyEvent(request: VerifyRequest): Promise<VerifyResponse> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Verification failed');
  }
  
  return response.json();
}


