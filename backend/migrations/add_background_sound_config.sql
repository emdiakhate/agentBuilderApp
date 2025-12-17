-- Migration: Add background sound configuration columns
-- Date: 2025-12-10
-- Description: Adds background_sound and background_denoising_enabled columns to agents table

-- Add background_sound column (default: 'off')
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS background_sound VARCHAR(50) DEFAULT 'off';

-- Add background_denoising_enabled column (default: false)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS background_denoising_enabled BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN agents.background_sound IS 'Background sound type: off, office, restaurant, noisy, home';
COMMENT ON COLUMN agents.background_denoising_enabled IS 'Enable Krisp smart denoising for background noise reduction';
