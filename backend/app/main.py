"""
AuditChain - Main FastAPI Application
Blockchain-Backed Audit Logging for Machine Learning Systems
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db

app = FastAPI(
    title="AuditChain API",
    description="Blockchain-Backed Audit Logging for ML Systems",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Import routers
from app.routers import auth, events, hashing, merkle, verify, blockchain

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(hashing.router, prefix="/hash", tags=["hashing"])
app.include_router(merkle.router, prefix="/merkle", tags=["merkle"])
app.include_router(verify.router, prefix="/verify", tags=["verification"])
app.include_router(blockchain.router, prefix="/blockchain", tags=["blockchain"])

@app.get("/")
async def root():
    return {
        "message": "AuditChain API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}






