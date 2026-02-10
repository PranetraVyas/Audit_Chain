# Quick Start Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ and npm installed

## Start Backend

```bash
cd "Audit Chain/backend"
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs on: http://localhost:8000

## Start Frontend

```bash
cd "Audit Chain/frontend"
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Test Credentials

- **Admin**: `admin` / `admin123`
- **ML Engineer**: `ml_engineer` / `engineer123`
- **Auditor**: `auditor` / `auditor123`

## Quick Test Flow

1. Open http://localhost:3000
2. Click Login and use `admin` / `admin123`
3. Go to "Log Event" page
4. Create a test event:
   - Model ID: `test-model-1`
   - Event Type: `training`
   - Timestamp: (current time)
   - Summary: `Test training run`
5. Click "Create Event"
6. View on Dashboard
7. Go to "Merkle Batches" and click "Build New Batch"
8. Go to "Verification" and verify the event by ID

Done! ✅







