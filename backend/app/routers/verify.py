"""
Verification router - Verify audit event integrity
"""
from fastapi import APIRouter, HTTPException
from app.models import VerifyRequest, VerifyResponse
from app.database import get_db
from app.services.hashing_service import hash_metadata
from app.services.merkle_service import verify_merkle_proof
import json

router = APIRouter()

@router.post("", response_model=VerifyResponse)
async def verify_event(request: VerifyRequest):
    """
    Verify the integrity of an audit event
    
    Can verify by:
    1. Event ID - fetches event and verifies hash
    2. Metadata - reconstructs event and verifies hash matches provided hash
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Case 1: Verify by event ID
        if request.event_id:
            cursor.execute("""
                SELECT id, model_id, event_type, timestamp, summary, metadata_hash
                FROM audit_events
                WHERE id = ?
            """, (request.event_id,))
            
            row = cursor.fetchone()
            
            if not row:
                return VerifyResponse(
                    valid=False,
                    message=f"Event ID {request.event_id} not found"
                )
            
            # Reconstruct metadata
            metadata = {
                "model_id": row["model_id"],
                "event_type": row["event_type"],
                "timestamp": row["timestamp"],
                "summary": row["summary"] or ""
            }
            
            # Recompute hash
            computed_hash = hash_metadata(metadata)
            stored_hash = row["metadata_hash"]
            
            if computed_hash != stored_hash:
                return VerifyResponse(
                    valid=False,
                    message="Hash mismatch - event may have been tampered with",
                    details={
                        "event_id": request.event_id,
                        "computed_hash": computed_hash,
                        "stored_hash": stored_hash
                    }
                )
            
            return VerifyResponse(
                valid=True,
                message="Event integrity verified",
                details={
                    "event_id": request.event_id,
                    "hash": computed_hash
                }
            )
        
        # Case 2: Verify by provided metadata
        if request.metadata_hash and request.model_id and request.event_type and request.timestamp:
            # Reconstruct metadata from request
            metadata = {
                "model_id": request.model_id,
                "event_type": request.event_type,
                "timestamp": request.timestamp,
                "summary": request.summary or ""
            }
            
            # Compute hash
            computed_hash = hash_metadata(metadata)
            
            # Compare with provided hash
            if computed_hash != request.metadata_hash:
                return VerifyResponse(
                    valid=False,
                    message="Hash mismatch - metadata does not match provided hash",
                    details={
                        "computed_hash": computed_hash,
                        "provided_hash": request.metadata_hash
                    }
                )
            
            # Check if event exists in database
            cursor.execute("""
                SELECT id, metadata_hash
                FROM audit_events
                WHERE metadata_hash = ?
            """, (computed_hash,))
            
            row = cursor.fetchone()
            
            if row:
                return VerifyResponse(
                    valid=True,
                    message="Event verified and found in database",
                    details={
                        "event_id": row["id"],
                        "hash": computed_hash
                    }
                )
            else:
                return VerifyResponse(
                    valid=False,
                    message="Hash is valid but event not found in database",
                    details={
                        "hash": computed_hash
                    }
                )
        
        # Invalid request
        raise HTTPException(
            status_code=400,
            detail="Either provide event_id OR provide metadata_hash with model_id, event_type, and timestamp"
        )
    finally:
        conn.close()







