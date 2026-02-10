"""
Event logging router - Append-only audit event storage
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models import EventCreate, EventResponse
from app.database import get_db
from app.services.hashing_service import hash_metadata
import json

router = APIRouter()

@router.post("", response_model=EventResponse)
async def create_event(event: EventCreate):
    """
    Create a new audit event
    This is append-only - events cannot be modified or deleted
    """
    # Validate event_type (case-insensitive)
    valid_types = ["train", "evaluate", "deploy", "training", "evaluation", "deployment"]
    event_type_normalized = event.event_type.lower()
    if event_type_normalized not in [vt.lower() for vt in valid_types]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event_type. Must be one of: Train, Evaluate, Deploy"
        )
    
    # Normalize event type to title case
    event_type_map = {
        "train": "Train",
        "training": "Train",
        "evaluate": "Evaluate",
        "evaluation": "Evaluate",
        "deploy": "Deploy",
        "deployment": "Deploy"
    }
    normalized_type = event_type_map.get(event_type_normalized, event.event_type)
    
    # Create metadata dict for hashing (include all fields)
    metadata = {
        "model_id": event.model_id,
        "model_name": event.model_name or "",
        "model_version": event.model_version or "",
        "framework": event.framework or "",
        "dataset_name": event.dataset_name or "",
        "dataset_version": event.dataset_version or "",
        "dataset_hash": event.dataset_hash or "",
        "source": event.source or "",
        "event_type": normalized_type,
        "actor": event.actor or "",
        "environment": event.environment or "",
        "timestamp": event.timestamp,
        "summary": event.summary or ""
    }
    
    # Compute event hash (SHA-256)
    metadata_hash = hash_metadata(metadata)
    
    # Merkle leaf hash is the same as metadata_hash for now
    # (In a real system, this might be computed differently)
    merkle_leaf_hash = metadata_hash
    
    # Store in database
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO audit_events (
                model_id, model_name, model_version, framework,
                dataset_name, dataset_version, dataset_hash, source,
                event_type, actor, environment, timestamp, summary,
                metadata_hash, merkle_leaf_hash, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event.model_id,
            event.model_name,
            event.model_version,
            event.framework,
            event.dataset_name,
            event.dataset_version,
            event.dataset_hash,
            event.source,
            normalized_type,
            event.actor,
            event.environment,
            event.timestamp,
            event.summary,
            metadata_hash,
            merkle_leaf_hash,
            "Pending"
        ))
        
        event_id = cursor.lastrowid
        conn.commit()
        
        # Fetch created event
        cursor.execute("""
            SELECT id, model_id, model_name, model_version, framework,
                   dataset_name, dataset_version, dataset_hash, source,
                   event_type, actor, environment, timestamp, summary,
                   metadata_hash, merkle_leaf_hash, batch_id, status, created_at
            FROM audit_events
            WHERE id = ?
        """, (event_id,))
        
        row = cursor.fetchone()
        
        return EventResponse(
            id=row["id"],
            model_id=row["model_id"],
            model_name=row["model_name"],
            model_version=row["model_version"],
            framework=row["framework"],
            dataset_name=row["dataset_name"],
            dataset_version=row["dataset_version"],
            dataset_hash=row["dataset_hash"],
            source=row["source"],
            event_type=row["event_type"],
            actor=row["actor"],
            environment=row["environment"],
            timestamp=row["timestamp"],
            summary=row["summary"],
            metadata_hash=row["metadata_hash"],
            merkle_leaf_hash=row["merkle_leaf_hash"],
            batch_id=row["batch_id"],
            status=row["status"] or "Pending",
            created_at=row["created_at"]
        )
    finally:
        conn.close()

@router.get("", response_model=List[EventResponse])
async def get_events(limit: int = 100, offset: int = 0):
    """
    Get all audit events (paginated)
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, model_id, model_name, model_version, framework,
                   dataset_name, dataset_version, dataset_hash, source,
                   event_type, actor, environment, timestamp, summary,
                   metadata_hash, merkle_leaf_hash, batch_id, status, created_at
            FROM audit_events
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        
        rows = cursor.fetchall()
        
        return [
            EventResponse(
                id=row["id"],
                model_id=row["model_id"],
                model_name=row["model_name"],
                model_version=row["model_version"],
                framework=row["framework"],
                dataset_name=row["dataset_name"],
                dataset_version=row["dataset_version"],
                dataset_hash=row["dataset_hash"],
                source=row["source"],
                event_type=row["event_type"],
                actor=row["actor"],
                environment=row["environment"],
                timestamp=row["timestamp"],
                summary=row["summary"],
                metadata_hash=row["metadata_hash"],
                merkle_leaf_hash=row["merkle_leaf_hash"],
                batch_id=row["batch_id"],
                status=row["status"] or "Pending",
                created_at=row["created_at"]
            )
            for row in rows
        ]
    finally:
        conn.close()

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int):
    """
    Get a specific audit event by ID
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, model_id, model_name, model_version, framework,
                   dataset_name, dataset_version, dataset_hash, source,
                   event_type, actor, environment, timestamp, summary,
                   metadata_hash, merkle_leaf_hash, batch_id, status, created_at
            FROM audit_events
            WHERE id = ?
        """, (event_id,))
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return EventResponse(
            id=row["id"],
            model_id=row["model_id"],
            model_name=row["model_name"],
            model_version=row["model_version"],
            framework=row["framework"],
            dataset_name=row["dataset_name"],
            dataset_version=row["dataset_version"],
            dataset_hash=row["dataset_hash"],
            source=row["source"],
            event_type=row["event_type"],
            actor=row["actor"],
            environment=row["environment"],
            timestamp=row["timestamp"],
            summary=row["summary"],
            metadata_hash=row["metadata_hash"],
            merkle_leaf_hash=row["merkle_leaf_hash"],
            batch_id=row["batch_id"],
            status=row["status"] or "Pending",
            created_at=row["created_at"]
        )
    finally:
        conn.close()


