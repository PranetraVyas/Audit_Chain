"""
Database initialization and connection management
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "auditchain.db"

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Audit events table (append-only)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id TEXT NOT NULL,
            model_name TEXT,
            model_version TEXT,
            framework TEXT,
            dataset_name TEXT,
            dataset_version TEXT,
            dataset_hash TEXT,
            source TEXT,
            event_type TEXT NOT NULL,
            actor TEXT,
            environment TEXT,
            timestamp TEXT NOT NULL,
            summary TEXT,
            metadata_hash TEXT NOT NULL,
            merkle_leaf_hash TEXT,
            batch_id TEXT,
            status TEXT DEFAULT 'Pending',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add new columns to existing table if they don't exist (migration)
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN model_name TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN model_version TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN framework TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN dataset_name TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN dataset_version TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN dataset_hash TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN source TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN actor TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN environment TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN merkle_leaf_hash TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN batch_id TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE audit_events ADD COLUMN status TEXT DEFAULT 'Pending'")
    except sqlite3.OperationalError:
        pass
    
    # Merkle batches table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merkle_batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT NOT NULL UNIQUE,
            merkle_root TEXT NOT NULL,
            event_ids TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add status column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE merkle_batches ADD COLUMN status TEXT DEFAULT 'Pending'")
    except sqlite3.OperationalError:
        pass
    
    # Blockchain anchors table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blockchain_anchors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anchor_id INTEGER,
            merkle_root TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            block_hash TEXT,
            transaction_id TEXT,
            batch_id TEXT,
            block_number INTEGER,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add new columns if they don't exist
    try:
        cursor.execute("ALTER TABLE blockchain_anchors ADD COLUMN anchor_id INTEGER")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE blockchain_anchors ADD COLUMN batch_id TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE blockchain_anchors ADD COLUMN block_number INTEGER")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()


