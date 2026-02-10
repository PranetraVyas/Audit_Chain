# AuditChain

**Blockchain-Backed Audit Logging for Machine Learning Systems**

A research-grade web application that provides cryptographically verifiable audit logs for ML lifecycle events (training, evaluation, deployment). AuditChain tracks only metadata - never datasets, model files, or raw predictions.

## Project Structure

```
AuditChain/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── database.py      # SQLite database setup
│   │   ├── models.py        # Pydantic models
│   │   ├── routers/         # API endpoints
│   │   └── services/        # Business logic
│   └── requirements.txt
├── frontend/         # Next.js frontend
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   └── lib/          # API client and utilities
└── README.md
```

## Tech Stack

### Backend
- **FastAPI** (Python) - REST API framework
- **SQLite** - Database (append-only audit logs)
- **SHA-256** - Cryptographic hashing
- **Merkle Trees** - Batch verification

### Frontend
- **Next.js 15** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (dark theme)

## Features

### Core Functionality
1. **Event Logging** - Log ML lifecycle events with metadata
2. **Cryptographic Hashing** - SHA-256 hashing of event metadata
3. **Merkle Tree Batching** - Group events into verifiable batches
4. **Blockchain Anchoring** - Placeholder for blockchain integration
5. **Verification** - Verify event integrity and detect tampering

### Pages
- **Landing Page** - Project overview and architecture
- **Login** - Mock authentication (Admin, ML Engineer, Auditor roles)
- **Dashboard** - List of all audit events
- **Log Event** - Form to create new audit events
- **Merkle Batches** - View and create Merkle batches
- **Verification** - Verify event integrity

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd "Audit Chain/backend"
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd "Audit Chain/frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### Environment Variables (Optional)

Create a `.env.local` file in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Usage

### Test Credentials

The application uses mock authentication with these test accounts:

- **Admin**: `admin` / `admin123`
- **ML Engineer**: `ml_engineer` / `engineer123`
- **Auditor**: `auditor` / `auditor123`

### Workflow

1. **Login** - Use one of the test credentials
2. **Log Event** - Create audit events for ML operations
3. **View Dashboard** - See all logged events
4. **Build Merkle Batch** - Group events into a batch with Merkle tree
5. **Verify Events** - Verify the integrity of any event

### Event Types

- `training` - Model training events
- `evaluation` - Model evaluation events
- `deployment` - Model deployment events

## API Endpoints

### Authentication
- `POST /auth/login` - Mock login

### Events
- `POST /events` - Create audit event
- `GET /events` - List all events

### Hashing
- `POST /hash` - Hash metadata

### Merkle Trees
- `POST /merkle/build` - Build Merkle batch
- `GET /merkle/batches` - List all batches

### Verification
- `POST /verify` - Verify event integrity

## Architecture

### Event Flow

1. **Event Creation** → Metadata is hashed (SHA-256) → Stored in append-only database
2. **Batch Creation** → Events grouped → Merkle tree built → Merkle root generated
3. **Blockchain Anchoring** → Merkle root stored (placeholder implementation)
4. **Verification** → Hash recomputed → Compared with stored hash → Merkle proof validated

### Database Schema

**audit_events** (append-only)
- id, model_id, event_type, timestamp, summary, metadata_hash, created_at

**merkle_batches**
- id, batch_id, merkle_root, event_ids, created_at

**blockchain_anchors** (placeholder)
- id, merkle_root, timestamp, block_hash, transaction_id, created_at

## Security Notes

- Events are **append-only** - no updates or deletes
- All metadata is **cryptographically hashed**
- **Merkle trees** enable efficient batch verification
- **Blockchain anchoring** provides tamper-proof audit trail (placeholder)

## Development Notes

- This is a **research-grade** project focused on clarity and correctness
- **No ML system** is included - this is an audit & verification layer only
- Blockchain integration is a **placeholder** - ready for real blockchain implementation
- SQLite is used for simplicity - production would use PostgreSQL or similar

## License

Research project - educational use.







