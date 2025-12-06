"""
Migration script to add Vapi fields to Agent table

Run this script once to add vapi_assistant_id and vapi_knowledge_base_id
columns to the agents table.

Usage:
    python migrate_add_vapi_fields.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from loguru import logger


def run_migration():
    """Add Vapi fields to agents table"""

    engine = create_engine(settings.DATABASE_URL)

    migrations = [
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS vapi_assistant_id VARCHAR(255) UNIQUE;
        """,
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS vapi_knowledge_base_id VARCHAR(255);
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_agents_vapi_assistant_id
        ON agents(vapi_assistant_id);
        """
    ]

    try:
        with engine.connect() as conn:
            for migration in migrations:
                logger.info(f"Running migration: {migration.strip()[:50]}...")
                conn.execute(text(migration))
                conn.commit()

        logger.info("✅ Migration completed successfully!")
        logger.info("   - Added vapi_assistant_id column (VARCHAR 255, UNIQUE)")
        logger.info("   - Added vapi_knowledge_base_id column (VARCHAR 255)")
        logger.info("   - Created index on vapi_assistant_id")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    logger.info("Starting Vapi fields migration...")
    run_migration()
