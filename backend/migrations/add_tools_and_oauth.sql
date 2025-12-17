-- Add Tools and OAuth Credentials Tables
-- This migration adds support for custom tools and OAuth integrations

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Tool identification
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'function',

    -- Vapi integration
    vapi_tool_id VARCHAR(100),

    -- Function configuration
    function_name VARCHAR(100),
    function_description TEXT,
    parameters JSONB,

    -- Server configuration
    server_url VARCHAR(500),
    server_timeout INTEGER DEFAULT 20,

    -- Messages configuration
    messages JSONB,

    -- Advanced settings
    async_mode BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create oauth_credentials table
CREATE TABLE IF NOT EXISTS oauth_credentials (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Service identification
    service VARCHAR(50) NOT NULL,
    service_user_id VARCHAR(200),

    -- OAuth tokens
    access_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Scopes and metadata
    scopes JSONB,
    metadata JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON tools(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_type ON tools(type);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_oauth_credentials_user_id ON oauth_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_credentials_service ON oauth_credentials(service);
CREATE INDEX IF NOT EXISTS idx_oauth_credentials_user_service ON oauth_credentials(user_id, service);
CREATE INDEX IF NOT EXISTS idx_oauth_credentials_is_active ON oauth_credentials(is_active);

-- Add comment for documentation
COMMENT ON TABLE tools IS 'Custom tools that can be used by agents';
COMMENT ON TABLE oauth_credentials IS 'OAuth credentials for external service integrations';

-- Grant permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tools TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON oauth_credentials TO your_app_user;
