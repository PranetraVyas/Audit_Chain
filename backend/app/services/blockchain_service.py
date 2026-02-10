"""
Blockchain service - Ethereum-compatible blockchain anchoring
"""
import os
import json
from typing import Optional, Dict, Any
from app.database import get_db
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Try to import web3, fall back to simulated service if not available.
# NOTE: Avoid using non-ASCII characters in print statements here because
# Windows terminals running with cp1252 encoding can raise UnicodeEncodeError
# during module import, which prevents the backend from starting.
try:
    from web3 import Web3
    from web3.exceptions import TransactionNotFound, ContractLogicError
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    # Use plain ASCII-only messages to avoid encoding issues on Windows consoles.
    print("[WARNING] web3 not installed. Using fallback blockchain service.")
    print("[INFO] Install Microsoft C++ Build Tools and run: pip install web3")
    print("[INFO] See INSTALL_WINDOWS.md for details.")

# Contract ABI (minimal interface for AuditAnchor)
CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "merkleRoot", "type": "bytes32"}],
        "name": "anchorMerkleRoot",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "anchorId", "type": "uint256"}],
        "name": "getAnchor",
        "outputs": [
            {"internalType": "bytes32", "name": "merkleRoot", "type": "bytes32"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "submittedBy", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAnchorCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "anchorId", "type": "uint256"},
            {"indexed": True, "internalType": "bytes32", "name": "merkleRoot", "type": "bytes32"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": False, "internalType": "address", "name": "submittedBy", "type": "address"}
        ],
        "name": "RootAnchored",
        "type": "event"
    }
]


class BlockchainService:
    """Service for interacting with Ethereum-compatible blockchain"""
    
    def __init__(self):
        # Load configuration from environment variables
        self.rpc_url = os.getenv("BLOCKCHAIN_RPC_URL", "http://localhost:8545")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "")
        self.contract_address = os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS", "")
        self.chain_id = int(os.getenv("BLOCKCHAIN_CHAIN_ID", "11155111"))  # Sepolia default
        
        if not WEB3_AVAILABLE:
            # Use fallback implementation
            self.w3 = None
            self.contract = None
            return
        
        # Initialize Web3 connection
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain at {self.rpc_url}")
        
        # Load contract if address is provided
        self.contract = None
        if self.contract_address:
            try:
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=CONTRACT_ABI
                )
            except Exception as e:
                print(f"Warning: Could not load contract: {e}")
    
    def anchor_merkle_root(self, merkle_root: str, batch_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Anchor a Merkle root to the blockchain
        
        Args:
            merkle_root: The Merkle root hash as hex string (with or without 0x prefix)
            batch_id: Optional batch ID for reference
            
        Returns:
            Dictionary with anchor_id, transaction_hash, block_number, etc.
        """
        # Fallback to simulated anchoring if web3 not available
        if not WEB3_AVAILABLE or not self.w3:
            return self._simulate_anchor(merkle_root, batch_id)
        
        if not self.contract:
            raise ValueError("Contract address not configured. Set BLOCKCHAIN_CONTRACT_ADDRESS env var.")
        
        if not self.private_key:
            raise ValueError("Private key not configured. Set BLOCKCHAIN_PRIVATE_KEY env var.")
        
        # Normalize merkle_root to bytes32
        if not merkle_root.startswith("0x"):
            merkle_root = "0x" + merkle_root
        
        # Ensure it's exactly 32 bytes (64 hex chars + 0x = 66 chars)
        if len(merkle_root) != 66:
            raise ValueError(f"Invalid merkle_root length: {len(merkle_root)}. Expected 66 characters (0x + 64 hex)")
        
        merkle_root_bytes = bytes.fromhex(merkle_root[2:])
        
        try:
            # Get account from private key
            account = self.w3.eth.account.from_key(self.private_key)
            account_address = account.address
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(account_address)
            gas_price = self.w3.eth.gas_price
            
            # Estimate gas
            try:
                gas_estimate = self.contract.functions.anchorMerkleRoot(merkle_root_bytes).estimate_gas(
                    {"from": account_address}
                )
            except Exception as e:
                gas_estimate = 100000  # Fallback estimate
            
            # Build transaction
            transaction = self.contract.functions.anchorMerkleRoot(merkle_root_bytes).build_transaction({
                "from": account_address,
                "nonce": nonce,
                "gas": int(gas_estimate * 1.2),  # Add 20% buffer
                "gasPrice": gas_price,
                "chainId": self.chain_id,
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status != 1:
                raise Exception("Transaction failed on blockchain")
            
            # Extract anchor ID from event logs
            anchor_id = None
            if receipt.logs:
                # Parse event logs to find RootAnchored event
                for log in receipt.logs:
                    try:
                        event = self.contract.events.RootAnchored().process_log(log)
                        anchor_id = event.args.anchorId
                        break
                    except:
                        continue
            
            # If no event found, try calling getAnchorCount
            if anchor_id is None:
                anchor_id = self.contract.functions.getAnchorCount().call()
            
            # Store in database
            conn = get_db()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO blockchain_anchors (
                    merkle_root, timestamp, block_hash, transaction_id, anchor_id, batch_id
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                merkle_root,
                datetime.utcnow().isoformat(),
                receipt.blockHash.hex(),
                receipt.transactionHash.hex(),
                anchor_id,
                batch_id
            ))
            
            conn.commit()
            conn.close()
            
            return {
                "anchor_id": anchor_id,
                "transaction_hash": receipt.transactionHash.hex(),
                "block_number": receipt.blockNumber,
                "block_hash": receipt.blockHash.hex(),
                "gas_used": receipt.gasUsed,
                "status": "success"
            }
            
        except Exception as e:
            raise Exception(f"Failed to anchor Merkle root: {str(e)}")
    
    def get_anchor(self, anchor_id: int) -> Dict[str, Any]:
        """
        Retrieve anchor information from blockchain
        
        Args:
            anchor_id: The anchor ID to query
            
        Returns:
            Dictionary with merkle_root, timestamp, submitted_by
        """
        # Fallback to database query if web3 not available
        if not WEB3_AVAILABLE or not self.contract:
            return self._simulate_get_anchor(anchor_id)
        
        try:
            result = self.contract.functions.getAnchor(anchor_id).call()
            
            return {
                "merkle_root": result[0].hex(),
                "timestamp": result[1],
                "submitted_by": result[2],
                "anchor_id": anchor_id
            }
        except Exception as e:
            raise Exception(f"Failed to get anchor: {str(e)}")
    
    def _simulate_anchor(self, merkle_root: str, batch_id: Optional[str] = None) -> Dict[str, Any]:
        """Simulate anchoring when web3 is not available"""
        # Normalize merkle_root
        if not merkle_root.startswith("0x"):
            merkle_root = "0x" + merkle_root
        
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
    
    def _simulate_get_anchor(self, anchor_id: int) -> Dict[str, Any]:
        """Simulate getting anchor from database when web3 not available"""
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
        dt = datetime.fromisoformat(row["timestamp"].replace('Z', '+00:00'))
        timestamp = int(dt.timestamp())
        
        return {
            "merkle_root": row["merkle_root"],
            "timestamp": timestamp,
            "submitted_by": "0x0000000000000000000000000000000000000000",
            "anchor_id": row["anchor_id"]
        }
    
    def get_network_name(self) -> str:
        """Get the name of the blockchain network"""
        if self.chain_id == 11155111:
            return "Sepolia Testnet"
        elif self.chain_id == 80001:
            return "Polygon Mumbai Testnet"
        elif self.chain_id == 1:
            return "Ethereum Mainnet"
        else:
            return f"Chain ID {self.chain_id}"
    
    def get_explorer_url(self, tx_hash: str) -> str:
        """Get blockchain explorer URL for a transaction"""
        if self.chain_id == 11155111:
            return f"https://sepolia.etherscan.io/tx/{tx_hash}"
        elif self.chain_id == 80001:
            return f"https://mumbai.polygonscan.com/tx/{tx_hash}"
        elif self.chain_id == 1:
            return f"https://etherscan.io/tx/{tx_hash}"
        else:
            return f"#"


# Global instance
_blockchain_service: Optional[BlockchainService] = None


def get_blockchain_service() -> BlockchainService:
    """Get or create blockchain service instance"""
    global _blockchain_service
    if _blockchain_service is None:
        try:
            _blockchain_service = BlockchainService()
        except Exception as e:
            print(f"Warning: Blockchain service initialization failed: {e}")
            print("Blockchain features will use fallback mode. Set environment variables to enable.")
            # Don't raise - allow fallback mode
            _blockchain_service = BlockchainService()  # Will use simulated mode
    return _blockchain_service


def anchor_merkle_root(merkle_root: str, batch_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Convenience function for anchoring Merkle root
    Falls back to database-only storage if blockchain is unavailable
    """
    try:
        service = get_blockchain_service()
        return service.anchor_merkle_root(merkle_root, batch_id)
    except Exception as e:
        # Fallback to database-only storage
        print(f"Blockchain anchoring failed, using database fallback: {e}")
        conn = get_db()
        cursor = conn.cursor()
        
        timestamp = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO blockchain_anchors (merkle_root, timestamp, batch_id)
            VALUES (?, ?, ?)
        """, (merkle_root, timestamp, batch_id))
        
        conn.commit()
        conn.close()
        
        return {
            "anchor_id": None,
            "transaction_hash": None,
            "block_number": None,
            "status": "database_fallback",
            "error": str(e)
        }






