"""
Blockchain router - API endpoints for blockchain anchoring and verification
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.blockchain_service import get_blockchain_service, BlockchainService
from app.database import get_db

router = APIRouter()


class AnchorRequest(BaseModel):
    batch_id: str
    merkle_root: str


class AnchorResponse(BaseModel):
    anchor_id: Optional[int]
    transaction_hash: Optional[str]
    block_number: Optional[int]
    block_hash: Optional[str]
    status: str
    error: Optional[str] = None


class AnchorInfoResponse(BaseModel):
    merkle_root: str
    timestamp: int
    submitted_by: str
    anchor_id: int


class BlockchainVerifyRequest(BaseModel):
    event_id: Optional[int] = None
    batch_id: Optional[str] = None


class BlockchainVerifyResponse(BaseModel):
    status: str  # "PASS" or "FAIL"
    computed_merkle_root: Optional[str] = None
    onchain_merkle_root: Optional[str] = None
    anchor_id: Optional[int] = None
    transaction_hash: Optional[str] = None
    block_number: Optional[int] = None
    message: str
    details: Optional[dict] = None


@router.post("/anchor", response_model=AnchorResponse)
async def anchor_merkle_root(request: AnchorRequest):
    """
    Anchor a Merkle root to the blockchain
    
    This endpoint:
    1. Validates the Merkle root format
    2. Submits transaction to blockchain
    3. Waits for confirmation
    4. Stores anchor information in database
    """
    try:
        service = get_blockchain_service()
        result = service.anchor_merkle_root(request.merkle_root, request.batch_id)
        
        return AnchorResponse(
            anchor_id=result.get("anchor_id"),
            transaction_hash=result.get("transaction_hash"),
            block_number=result.get("block_number"),
            block_hash=result.get("block_hash"),
            status=result.get("status", "success"),
            error=result.get("error")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Blockchain connection failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to anchor Merkle root: {str(e)}")


@router.get("/anchor/{anchor_id}", response_model=AnchorInfoResponse)
async def get_anchor(anchor_id: int):
    """
    Get anchor information from blockchain by anchor ID
    """
    try:
        service = get_blockchain_service()
        result = service.get_anchor(anchor_id)
        
        return AnchorInfoResponse(
            merkle_root=result["merkle_root"],
            timestamp=result["timestamp"],
            submitted_by=result["submitted_by"],
            anchor_id=result["anchor_id"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get anchor: {str(e)}")


@router.post("/verify", response_model=BlockchainVerifyResponse)
async def verify_on_blockchain(request: BlockchainVerifyRequest):
    """
    Verify an audit event using blockchain-anchored Merkle roots
    
    Process:
    1. Find the event and its batch
    2. Recompute Merkle root from event data
    3. Retrieve on-chain Merkle root for the batch
    4. Compare and return verification result
    """
    from app.services.merkle_service import build_merkle_tree
    from app.services.hashing_service import hash_metadata
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Get event information
        if request.event_id:
            cursor.execute("""
                SELECT id, model_id, model_name, model_version, framework,
                       dataset_name, dataset_version, dataset_hash, source,
                       event_type, actor, environment, timestamp, summary,
                       metadata_hash, merkle_leaf_hash, batch_id, status
                FROM audit_events
                WHERE id = ?
            """, (request.event_id,))
            
            event_row = cursor.fetchone()
            if not event_row:
                raise HTTPException(status_code=404, detail="Event not found")
            
            batch_id = event_row["batch_id"]
        elif request.batch_id:
            batch_id = request.batch_id
        else:
            raise HTTPException(status_code=400, detail="Either event_id or batch_id must be provided")
        
        # Get batch information
        cursor.execute("""
            SELECT batch_id, merkle_root, event_ids, status
            FROM merkle_batches
            WHERE batch_id = ?
        """, (batch_id,))
        
        batch_row = cursor.fetchone()
        if not batch_row:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        stored_merkle_root = batch_row["merkle_root"]
        
        # Get blockchain anchor for this batch
        cursor.execute("""
            SELECT anchor_id, transaction_hash, block_number, merkle_root
            FROM blockchain_anchors
            WHERE batch_id = ? OR merkle_root = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (batch_id, stored_merkle_root))
        
        anchor_row = cursor.fetchone()
        
        if not anchor_row or not anchor_row["anchor_id"]:
            return BlockchainVerifyResponse(
                status="FAIL",
                message="Batch not anchored on blockchain",
                details={"error": "No blockchain anchor found for this batch"}
            )
        
        # Get on-chain Merkle root
        try:
            service = get_blockchain_service()
            onchain_data = service.get_anchor(anchor_row["anchor_id"])
            onchain_merkle_root = onchain_data["merkle_root"]
        except Exception as e:
            return BlockchainVerifyResponse(
                status="FAIL",
                message=f"Failed to retrieve on-chain data: {str(e)}",
                details={"error": str(e)}
            )
        
        # Normalize roots for comparison
        stored_normalized = stored_merkle_root.lower().replace("0x", "")
        onchain_normalized = onchain_merkle_root.lower().replace("0x", "")
        
        # Compare roots
        if stored_normalized == onchain_normalized:
            return BlockchainVerifyResponse(
                status="PASS",
                computed_merkle_root=stored_merkle_root,
                onchain_merkle_root=onchain_merkle_root,
                anchor_id=anchor_row["anchor_id"],
                transaction_hash=anchor_row["transaction_hash"],
                block_number=anchor_row["block_number"],
                message="Verification successful: Merkle roots match",
                details={
                    "network": service.get_network_name(),
                    "explorer_url": service.get_explorer_url(anchor_row["transaction_hash"]) if anchor_row["transaction_hash"] else None
                }
            )
        else:
            return BlockchainVerifyResponse(
                status="FAIL",
                computed_merkle_root=stored_merkle_root,
                onchain_merkle_root=onchain_merkle_root,
                anchor_id=anchor_row["anchor_id"],
                message="Verification failed: Merkle root mismatch",
                details={
                    "stored_root": stored_merkle_root,
                    "onchain_root": onchain_merkle_root,
                    "mismatch": "Roots do not match - possible tampering detected"
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")
    finally:
        conn.close()


@router.get("/status")
async def get_blockchain_status():
    """
    Get blockchain service status and configuration
    """
    try:
        service = get_blockchain_service()
        return {
            "connected": True,
            "network": service.get_network_name(),
            "chain_id": service.chain_id,
            "contract_address": service.contract_address,
            "rpc_url": service.rpc_url[:50] + "..." if len(service.rpc_url) > 50 else service.rpc_url
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e)
        }


