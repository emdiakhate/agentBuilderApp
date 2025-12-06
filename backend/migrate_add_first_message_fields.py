"""
Migration script to add First Message fields to Agent table

Run this script once to add first_message and first_message_mode
columns to the agents table.

Usage:
    python migrate_add_first_message_fields.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from loguru import logger


def run_migration():
    """Add First Message fields to agents table"""

    engine = create_engine(settings.DATABASE_URL)

    migrations = [
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS first_message TEXT;
        """,
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS first_message_mode VARCHAR(50) DEFAULT 'assistant-speaks-first';
        """,
    ]

    try:
        with engine.connect() as conn:
            for migration in migrations:
                logger.info(f"Running migration: {migration.strip()[:50]}...")
                conn.execute(text(migration))
                conn.commit()

        logger.info("✅ Migration completed successfully!")
        logger.info("   - Added first_message column (TEXT)")
        logger.info("   - Added first_message_mode column (VARCHAR 50, default: assistant-speaks-first)")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    logger.info("Starting First Message fields migration...")
    run_migration()
