"""
Authentication router - Mock authentication system
"""
from fastapi import APIRouter, HTTPException
from app.models import LoginRequest, LoginResponse

router = APIRouter()

# Mock user database (in production, use proper authentication)
MOCK_USERS = {
    "admin": {"password": "admin123", "role": "Admin"},
    "ml_engineer": {"password": "engineer123", "role": "ML Engineer"},
    "auditor": {"password": "auditor123", "role": "Auditor"},
}

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Mock login endpoint
    Valid users:
    - admin/admin123 (Admin role)
    - ml_engineer/engineer123 (ML Engineer role)
    - auditor/auditor123 (Auditor role)
    """
    username = credentials.username.lower()
    
    if username not in MOCK_USERS:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    user = MOCK_USERS[username]
    
    if credentials.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Generate mock token (in production, use JWT)
    token = f"mock_token_{username}_{user['role']}"
    
    return LoginResponse(
        token=token,
        role=user["role"],
        username=username
    )







