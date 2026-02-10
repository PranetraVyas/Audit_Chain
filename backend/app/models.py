"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Authentication models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    role: str
    username: str

# Event models
class EventCreate(BaseModel):
    model_id: str
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    framework: Optional[str] = None
    dataset_name: Optional[str] = None
    dataset_version: Optional[str] = None
    dataset_hash: Optional[str] = None
    source: Optional[str] = None
    event_type: str  # Train, Evaluate, Deploy
    actor: Optional[str] = None
    environment: Optional[str] = None
    timestamp: str
    summary: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    model_id: str
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    framework: Optional[str] = None
    dataset_name: Optional[str] = None
    dataset_version: Optional[str] = None
    dataset_hash: Optional[str] = None
    source: Optional[str] = None
    event_type: str
    actor: Optional[str] = None
    environment: Optional[str] = None
    timestamp: str
    summary: Optional[str] = None
    metadata_hash: str
    merkle_leaf_hash: Optional[str] = None
    batch_id: Optional[str] = None
    status: str
    created_at: str

# Hashing models
class HashRequest(BaseModel):
    metadata: dict

class HashResponse(BaseModel):
    hash: str

# Merkle models
class MerkleBuildRequest(BaseModel):
    event_ids: Optional[List[int]] = None  # If None, use all events

class MerkleProof(BaseModel):
    event_id: int
    proof: List[str]
    leaf_hash: str

class MerkleResponse(BaseModel):
    merkle_root: str
    batch_id: str
    proofs: List[MerkleProof]
    event_count: int

# Verification models
class VerifyRequest(BaseModel):
    event_id: Optional[int] = None
    model_id: Optional[str] = None
    event_type: Optional[str] = None
    timestamp: Optional[str] = None
    summary: Optional[str] = None
    metadata_hash: Optional[str] = None

class VerifyResponse(BaseModel):
    valid: bool
    message: str
    details: Optional[dict] = None

# Batch models
class BatchResponse(BaseModel):
    batch_id: str
    merkle_root: str
    event_count: int
    status: str
    created_at: str


