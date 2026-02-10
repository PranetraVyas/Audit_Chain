# Quick Fix: Run Without C++ Build Tools

If you cannot install Microsoft C++ Build Tools right now, you can use a **fallback blockchain service** that simulates blockchain behavior for development.

## Step 1: Install Base Dependencies (No web3)

```bash
cd "Audit Chain/backend"
pip install fastapi uvicorn pydantic python-multipart python-dotenv
```

This will skip `web3` and install everything else.

## Step 2: Use Fallback Service

The fallback service (`blockchain_service_fallback.py`) will automatically be used if web3 is not installed. It:
- ✅ Stores anchors in the database
- ✅ Simulates blockchain behavior
- ✅ Works with all UI components
- ✅ Allows full testing of the system
- ⚠️ Does NOT connect to real blockchain

## Step 3: Test the System

```bash
# Start backend
python -m uvicorn app.main:app --reload

# The system will show:
# ⚠️  Using FALLBACK blockchain service (web3 not installed)
```

## Step 4: When Ready for Real Blockchain

1. Install Microsoft C++ Build Tools
2. Run: `pip install web3`
3. The system will automatically switch to real blockchain service

## What Works with Fallback

- ✅ All API endpoints
- ✅ Event creation and batching
- ✅ Verification UI
- ✅ Database storage
- ✅ All frontend features
- ❌ Real blockchain transactions (simulated only)

## Note

The fallback service is **perfect for development and testing**. For production or real blockchain integration, you'll need to install the build tools and web3.


