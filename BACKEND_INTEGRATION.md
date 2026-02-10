# Backend Integration Summary

## Overview
The frontend is now fully integrated with the backend API. All form submissions update the database and are reflected across all pages in real-time.

## Backend Changes

### Database Schema Updates
- Extended `audit_events` table with new fields:
  - `model_name`, `model_version`, `framework`
  - `dataset_name`, `dataset_version`, `dataset_hash`, `source`
  - `actor`, `environment`
  - `merkle_leaf_hash`, `batch_id`, `status`
- Added `status` field to `merkle_batches` table

### API Endpoints

#### Events
- `POST /events` - Create new audit event (accepts full form data)
- `GET /events` - Get all events (returns all fields)
- `GET /events/{event_id}` - Get specific event

#### Batches
- `GET /merkle/batches` - Get all batches (includes status)
- `POST /merkle/build` - Build new batch (updates event statuses)

## Frontend Changes

### API Client (`lib/api.ts`)
- Updated `Event` and `EventCreate` interfaces to match backend
- Added `getDashboardStats()` function
- Removed authentication requirements (for development)

### Pages Updated

1. **Insert Event** (`/insert-event`)
   - Submits full form data to backend
   - Shows generated hashes after submission
   - Redirects to audit logs on success

2. **Dashboard** (`/dashboard`)
   - Fetches real events and stats from backend
   - Shows loading states
   - Displays actual event data

3. **Audit Logs** (`/audit-logs`)
   - Fetches all events from backend
   - Filters work with real data
   - Shows all event fields including batch_id and status

4. **Merkle Batches** (`/merkle-batches`)
   - Fetches batches from backend
   - Shows real batch counts and statuses
   - Displays actual merkle roots

## Data Flow

1. **Event Creation:**
   - User fills form on Insert Event page
   - Form submits to `POST /events`
   - Backend computes SHA-256 hash
   - Event stored with status "Pending"
   - Event appears in Dashboard and Audit Logs

2. **Batch Creation:**
   - Events with status "Pending" can be batched
   - `POST /merkle/build` creates batch
   - Event statuses updated to "Batched" then "Anchored"
   - Batch appears in Merkle Batches page

3. **Status Updates:**
   - Events: Pending → Batched → Anchored
   - Batches: Pending → Anchored
   - Status changes reflected immediately across all pages

## Running the Application

### Backend
```bash
cd "Audit Chain/backend"
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd "Audit Chain/frontend"
npm run dev
```

## Testing

1. Start backend server (port 8000)
2. Start frontend dev server (port 3000)
3. Navigate to `/insert-event`
4. Fill out form and submit
5. Check `/dashboard` - event should appear
6. Check `/audit-logs` - event should be listed
7. Create multiple events
8. Build a batch via API or UI
9. Check `/merkle-batches` - batch should appear

## Notes

- All pages now fetch real data from backend
- Form validation ensures required fields are filled
- Error handling shows user-friendly messages
- Loading states provide feedback during API calls
- Event IDs are formatted as "EVT-001", "EVT-002", etc.
- Batch IDs are formatted as "BATCH-XXXXXXXX"






