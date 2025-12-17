"""
Migration script to add tools and OAuth credentials tables
"""

import psycopg2
from app.core.config import settings
from loguru import logger


def run_migration():
    """Execute the migration SQL script"""
    try:
        # Read SQL migration file
        with open('migrations/add_tools_and_oauth.sql', 'r') as f:
            migration_sql = f.read()

        # Connect to database
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()

        logger.info("Running migration: add_tools_and_oauth")

        # Execute migration
        cursor.execute(migration_sql)
        conn.commit()

        logger.info("✅ Migration completed successfully!")

        cursor.close()
        conn.close()

    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        raise


if __name__ == "__main__":
    run_migration()
