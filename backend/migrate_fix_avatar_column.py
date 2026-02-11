"""
Migration: Fix avatar column to support base64 images
Changes avatar column from VARCHAR(500) to TEXT
"""

import sys
import logging
from sqlalchemy import create_engine, text
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migration():
    """Run the avatar column migration"""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)

        with engine.connect() as conn:
            logger.info("Starting migration: Fix avatar column size...")

            # Alter avatar column from VARCHAR(500) to TEXT
            conn.execute(text("""
                ALTER TABLE agents ALTER COLUMN avatar TYPE TEXT;
            """))

            conn.commit()
            logger.info("✅ Migration completed successfully!")
            logger.info("Avatar column changed from VARCHAR(500) to TEXT")

    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    run_migration()
