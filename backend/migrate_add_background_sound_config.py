"""
Migration script to add Background Sound configuration fields to Agent table

Run this script once to add background_sound and background_denoising_enabled
columns to the agents table.

Usage:
    python migrate_add_background_sound_config.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from loguru import logger


def run_migration():
    """Add Background Sound configuration fields to agents table"""

    engine = create_engine(settings.DATABASE_URL)

    migrations = [
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS background_sound VARCHAR(50) DEFAULT 'off';
        """,
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS background_denoising_enabled BOOLEAN DEFAULT FALSE;
        """,
    ]

    try:
        with engine.connect() as conn:
            for migration in migrations:
                logger.info(f"Running migration: {migration.strip()[:50]}...")
                conn.execute(text(migration))
                conn.commit()

        logger.info("✅ Migration completed successfully!")
        logger.info("   - Added background_sound column (VARCHAR 50, default: 'off')")
        logger.info("   - Added background_denoising_enabled column (BOOLEAN, default: FALSE)")
        logger.info("")
        logger.info("📝 Background sound options: off, office, restaurant, noisy, home")
        logger.info("🎯 Denoising: Enables Krisp smart denoising for background noise reduction")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    logger.info("Starting Background Sound configuration migration...")
    run_migration()
