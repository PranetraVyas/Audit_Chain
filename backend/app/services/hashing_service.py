"""
Hashing service - SHA-256 hashing for audit metadata
"""
import hashlib
import json
from typing import Dict, Any

def hash_metadata(metadata: Dict[str, Any]) -> str:
    """
    Hash metadata dictionary using SHA-256
    
    Args:
        metadata: Dictionary containing audit event metadata
        
    Returns:
        Hexadecimal hash string
    """
    # Convert metadata to JSON string with sorted keys for consistency
    json_string = json.dumps(metadata, sort_keys=True, separators=(',', ':'))
    
    # Compute SHA-256 hash
    hash_object = hashlib.sha256(json_string.encode('utf-8'))
    
    return hash_object.hexdigest()







