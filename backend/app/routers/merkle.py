"""
Merkle tree router - Build and manage Merkle batches
"""
from fastapi import APIRouter, HTTPException
from app.models import MerkleBuildRequest, MerkleResponse, MerkleProof
from app.database import get_db
from app.services.merkle_service import build_merkle_tree, get_merkle_proof
import uuid
from typing import List

router = APIRouter()

@router.post("/build", response_model=MerkleResponse)
async def build_merkle_batch(request: MerkleBuildRequest):
    """
    Build Merkle tree from audit events
    
    If event_ids is provided, use only those events.
    Otherwise, use all events not yet in a batch.
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Get event hashes (use merkle_leaf_hash if available, otherwise metadata_hash)
        if request.event_ids:
            # Use specific event IDs
            placeholders = ','.join('?' * len(request.event_ids))
            cursor.execute(f"""
                SELECT id, COALESCE(merkle_leaf_hash, metadata_hash) as leaf_hash
                FROM audit_events
                WHERE id IN ({placeholders}) AND (status = 'Pending' OR batch_id IS NULL)
                ORDER BY id
            """, request.event_ids)
        else:
            # Get all events not in any batch yet (status is Pending)
                cursor.execute("""
                SELECT id, COALESCE(merkle_leaf_hash, metadata_hash) as leaf_hash
                    FROM audit_events
                WHERE status = 'Pending' OR batch_id IS NULL
                    ORDER BY id
                LIMIT 16
                """)
        
        events = cursor.fetchall()
        
        if not events:
            raise HTTPException(
                status_code=400,
                detail="No events available for batch creation"
            )
        
        # Extract hashes
        event_hashes = [(row["id"], row["leaf_hash"]) for row in events]
        hashes = [hash for _, hash in event_hashes]
        event_ids = [event_id for event_id, _ in event_hashes]
        
        # Build Merkle tree
        merkle_root, tree_levels = build_merkle_tree(hashes)
        
        # Generate proofs for all events
        proofs = []
        for idx, (event_id, leaf_hash) in enumerate(event_hashes):
            proof = get_merkle_proof(tree_levels, idx, leaf_hash)
            proofs.append(MerkleProof(
                event_id=event_id,
                proof=proof,
                leaf_hash=leaf_hash
            ))
        
        # Create batch
        batch_id = f"BATCH-{str(uuid.uuid4())[:8].upper()}"
        event_ids_json = str(event_ids)  # Simple string representation
        
        cursor.execute("""
            INSERT INTO merkle_batches (batch_id, merkle_root, event_ids, status)
            VALUES (?, ?, ?, ?)
        """, (batch_id, merkle_root, event_ids_json, "Pending"))
        
        # Update event statuses to "Batched" and set batch_id
        for event_id in event_ids:
            cursor.execute("""
                UPDATE audit_events
                SET status = 'Batched', batch_id = ?
                WHERE id = ?
            """, (batch_id, event_id))
        
        conn.commit()
        
        # Anchor to blockchain
        try:
            from app.services.blockchain_service import anchor_merkle_root
            anchor_result = anchor_merkle_root(merkle_root, batch_id)
            
            # Update batch status to "Anchored" if blockchain anchoring succeeded
            if anchor_result.get("status") == "success":
                cursor.execute("""
                    UPDATE merkle_batches
                    SET status = 'Anchored'
                    WHERE batch_id = ?
                """, (batch_id,))
                
                # Update event statuses to "Anchored"
                for event_id in event_ids:
                    cursor.execute("""
                        UPDATE audit_events
                        SET status = 'Anchored'
                        WHERE id = ?
                    """, (event_id,))
            else:
                # Keep as "Batched" if blockchain anchoring failed
                cursor.execute("""
                    UPDATE merkle_batches
                    SET status = 'Batched'
                    WHERE batch_id = ?
                """, (batch_id,))
        except Exception as e:
            # If blockchain service is unavailable, just mark as "Batched"
            print(f"Warning: Blockchain anchoring failed: {e}")
            cursor.execute("""
                UPDATE merkle_batches
                SET status = 'Batched'
                WHERE batch_id = ?
            """, (batch_id,))
        
        conn.commit()
        
        return MerkleResponse(
            merkle_root=merkle_root,
            batch_id=batch_id,
            proofs=proofs,
            event_count=len(events)
        )
    finally:
        conn.close()

@router.get("/batches")
async def get_batches():
    """
    Get all Merkle batches
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT batch_id, merkle_root, event_ids, status, created_at
            FROM merkle_batches
            ORDER BY created_at DESC
        """)
        
        rows = cursor.fetchall()
        
        batches = []
        for row in rows:
            try:
                import ast
                event_ids_list = ast.literal_eval(row["event_ids"]) if row["event_ids"] else []
                event_count = len(event_ids_list)
            except:
                event_count = 0
            
            batches.append({
                "batch_id": row["batch_id"],
                "merkle_root": row["merkle_root"],
                "event_count": event_count,
                "status": row["status"] or "Pending",
                "created_at": row["created_at"]
            })
        
        return batches
    finally:
        conn.close()

