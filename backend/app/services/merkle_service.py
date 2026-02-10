"""
Merkle tree service - Build Merkle trees for batch verification
"""
import hashlib
from typing import List, Tuple
from app.database import get_db

def hash_pair(left: str, right: str) -> str:
    """
    Hash two nodes together to create parent node
    """
    combined = left + right
    return hashlib.sha256(combined.encode('utf-8')).hexdigest()

def build_merkle_tree(hashes: List[str]) -> Tuple[str, List[List[str]]]:
    """
    Build Merkle tree from list of hashes
    
    Returns:
        (merkle_root, tree_levels)
    """
    if not hashes:
        raise ValueError("Cannot build Merkle tree from empty list")
    
    if len(hashes) == 1:
        return hashes[0], [hashes]
    
    # Build tree levels bottom-up
    current_level = hashes.copy()
    tree_levels = [current_level.copy()]
    
    while len(current_level) > 1:
        next_level = []
        
        # Process pairs
        for i in range(0, len(current_level), 2):
            if i + 1 < len(current_level):
                # Pair of nodes
                parent_hash = hash_pair(current_level[i], current_level[i + 1])
                next_level.append(parent_hash)
            else:
                # Odd node, hash with itself
                parent_hash = hash_pair(current_level[i], current_level[i])
                next_level.append(parent_hash)
        
        current_level = next_level
        tree_levels.append(current_level.copy())
    
    merkle_root = current_level[0]
    return merkle_root, tree_levels

def get_merkle_proof(tree_levels: List[List[str]], leaf_index: int, leaf_hash: str) -> List[str]:
    """
    Generate Merkle proof for a specific leaf
    
    Args:
        tree_levels: All levels of the Merkle tree
        leaf_index: Index of the leaf in the first level
        leaf_hash: Hash of the leaf
        
    Returns:
        List of sibling hashes needed for verification
    """
    if not tree_levels:
        return []
    
    proof = []
    current_index = leaf_index
    
    # Traverse up the tree
    for level in range(len(tree_levels) - 1):
        current_level = tree_levels[level]
        
        # Determine sibling index
        if current_index % 2 == 0:
            sibling_index = current_index + 1
        else:
            sibling_index = current_index - 1
        
        # Get sibling hash (or duplicate if odd number of nodes)
        if sibling_index < len(current_level):
            proof.append(current_level[sibling_index])
        else:
            # Odd node at end, sibling is itself
            proof.append(current_level[current_index])
        
        # Move to parent index
        current_index = current_index // 2
    
    return proof

def verify_merkle_proof(leaf_hash: str, proof: List[str], merkle_root: str) -> bool:
    """
    Verify a Merkle proof
    
    Args:
        leaf_hash: Hash of the leaf node
        proof: List of sibling hashes
        merkle_root: Expected root hash
        
    Returns:
        True if proof is valid
    """
    current_hash = leaf_hash
    
    for sibling_hash in proof:
        # Determine order: always use lexicographic ordering
        if current_hash < sibling_hash:
            current_hash = hash_pair(current_hash, sibling_hash)
        else:
            current_hash = hash_pair(sibling_hash, current_hash)
    
    return current_hash == merkle_root







