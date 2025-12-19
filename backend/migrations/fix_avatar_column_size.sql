-- Fix avatar column to support base64 images
-- Change from VARCHAR(500) to TEXT to support large base64 encoded images

ALTER TABLE agents ALTER COLUMN avatar TYPE TEXT;
