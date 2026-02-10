"""
Hashing router - Hash metadata endpoints
"""
from fastapi import APIRouter
from app.models import HashRequest, HashResponse
from app.services.hashing_service import hash_metadata

router = APIRouter()

@router.post("", response_model=HashResponse)
async def hash_metadata_endpoint(request: HashRequest):
    """
    Hash metadata dictionary
    """
    hash_value = hash_metadata(request.metadata)
    
    return HashResponse(hash=hash_value)







