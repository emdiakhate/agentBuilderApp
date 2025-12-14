"""
Migration script to fix oauth_credentials table
Adds the service_metadata column if it doesn't exist
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine
from loguru import logger

def migrate_oauth_table():
    """Add service_metadata column to oauth_credentials table"""
    try:
        with engine.connect() as conn:
            # Check database type
            db_url = str(engine.url)

            if 'postgresql' in db_url:
                logger.info("Detected PostgreSQL database")

                # Read and execute the SQL migration
                with open('fix_oauth_table.sql', 'r') as f:
                    sql = f.read()

                conn.execute(text(sql))
                conn.commit()
                logger.info("✅ Migration completed successfully!")

            elif 'sqlite' in db_url:
                logger.info("Detected SQLite database")

                # For SQLite, check if column exists
                result = conn.execute(text("PRAGMA table_info(oauth_credentials)"))
                columns = [row[1] for row in result]

                if 'service_metadata' not in columns:
                    conn.execute(text("ALTER TABLE oauth_credentials ADD COLUMN service_metadata TEXT"))
                    conn.commit()
                    logger.info("✅ Added service_metadata column to SQLite")
                else:
                    logger.info("✅ Column service_metadata already exists in SQLite")

            else:
                logger.warning(f"Unknown database type: {db_url}")
                return False

        return True

    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("Starting oauth_credentials table migration...")
    success = migrate_oauth_table()

    if success:
        logger.info("🎉 Migration completed!")
        sys.exit(0)
    else:
        logger.error("Migration failed")
        sys.exit(1)
