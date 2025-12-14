-- Fix oauth_credentials table for PostgreSQL
-- Add missing service_metadata column

-- Check if column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='oauth_credentials'
        AND column_name='service_metadata'
    ) THEN
        ALTER TABLE oauth_credentials
        ADD COLUMN service_metadata JSONB;

        RAISE NOTICE 'Column service_metadata added successfully';
    ELSE
        RAISE NOTICE 'Column service_metadata already exists';
    END IF;
END $$;
