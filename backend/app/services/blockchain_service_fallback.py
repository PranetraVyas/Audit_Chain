"""
Blockchain service - Fallback implementation for development without web3
Use this if you cannot install web3 due to C++ build tools requirement
"""
import os
from typing import Optional, Dict, Any
from app.database import get_db
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# This is a fallback implementation that simulates blockchain behavior
# For production, use the full blockchain_service.py with web3 installed


class BlockchainService:
    """Fallback blockchain service - simulates blockchain for development"""
    
    def __init__(self):
        self.rpc_url = os.getenv("BLOCKCHAIN_RPC_URL", "http://localhost:8545")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "")
        self.contract_address = os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS", "")
        self.chain_id = int(os.getenv("BLOCKCHAIN_CHAIN_ID", "11155111"))
        
        print("⚠️  Using FALLBACK blockchain service (web3 not installed)")
        print("   Install Microsoft C++ Build Tools to enable real blockchain integration")
    
    def anchor_merkle_root(self, merkle_root: str, batch_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Simulate anchoring a Merkle root (stores in database only)
        """
        # Normalize merkle_root
        if not merkle_root.startswith("0x"):
            merkle_root = "0x" + merkle_root
        
        # Simulate anchor ID (incrementing counter)
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT MAX(anchor_id) as max_id FROM blockchain_anchors")
        row = cursor.fetchone()
        anchor_id = (row["max_id"] or 0) + 1
        
        # Store in database (simulating blockchain)
        cursor.execute("""
            INSERT INTO blockchain_anchors (
                anchor_id, merkle_root, timestamp, batch_id, block_number
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            anchor_id,
            merkle_root,
            datetime.utcnow().isoformat(),
            batch_id,
            0  # Simulated block number
        ))
        
        conn.commit()
        conn.close()
        
        # Simulate transaction hash
        import hashlib
        tx_hash = "0x" + hashlib.sha256(f"{merkle_root}{anchor_id}".encode()).hexdigest()[:64]
        
        return {
            "anchor_id": anchor_id,
            "transaction_hash": tx_hash,
            "block_number": 0,
            "block_hash": "0x" + "0" * 64,
            "gas_used": 0,
            "status": "simulated"
        }
    
    def get_anchor(self, anchor_id: int) -> Dict[str, Any]:
        """
        Get anchor from database (simulated blockchain query)
        """
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT anchor_id, merkle_root, timestamp, batch_id
            FROM blockchain_anchors
            WHERE anchor_id = ?
        """, (anchor_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise ValueError(f"Anchor {anchor_id} not found")
        
        # Convert timestamp to Unix timestamp
        from datetime import datetime
        dt = datetime.fromisoformat(row["timestamp"].replace('Z', '+00:00'))
        timestamp = int(dt.timestamp())
        
        return {
            "merkle_root": row["merkle_root"],
            "timestamp": timestamp,
            "submitted_by": "0x0000000000000000000000000000000000000000",  # Simulated address
            "anchor_id": row["anchor_id"]
        }
    
    def get_network_name(self) -> str:
        """Get network name"""
        if self.chain_id == 11155111:
            return "Sepolia Testnet (Simulated)"
        elif self.chain_id == 80001:
            return "Polygon Mumbai Testnet (Simulated)"
        else:
            return f"Chain ID {self.chain_id} (Simulated)"
    
    def get_explorer_url(self, tx_hash: str) -> str:
        """Get explorer URL (returns # for simulated)"""
        return "#"


# Global instance
_blockchain_service: Optional[BlockchainService] = None


def get_blockchain_service() -> BlockchainService:
    """Get or create blockchain service instance"""
    global _blockchain_service
    if _blockchain_service is None:
        try:
            # Try to import the real blockchain service
            from app.services.blockchain_service import BlockchainService as RealBlockchainService
            _blockchain_service = RealBlockchainService()
            print("✅ Using REAL blockchain service (web3 installed)")
        except ImportError:
            # Fall back to simulated service
            _blockchain_service = BlockchainService()
    return _blockchain_service


def anchor_merkle_root(merkle_root: str, batch_id: Optional[str] = None) -> Dict[str, Any]:
    """Convenience function"""
    service = get_blockchain_service()
    return service.anchor_merkle_root(merkle_root, batch_id)


