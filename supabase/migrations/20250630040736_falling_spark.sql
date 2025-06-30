/*
  # Enhanced API Key Management System

  1. New Tables
    - `api_key_scopes` - Defines available permission scopes
    - `api_key_scope_mappings` - Maps API keys to their granted scopes
    - `api_key_rotations` - Tracks the history of API key rotations
    - `api_usage_logs` - Detailed logging of every API request
    - `api_key_webhooks` - Webhook configurations for API key events
    - `rate_limit_buckets` - Tracks rate limiting for API keys

  2. Changes to Existing Tables
    - Add new columns to `api_keys` table:
      - `key_version` - Version number of the key
      - `encryption_key_version` - Version of the encryption key used
      - `rotation_policy` - When the key should be rotated
      - `next_rotation_date` - When the key is scheduled for rotation
      - `usage_count` - Number of times the key has been used
      - `last_error_at` - When the last error occurred
      - `metadata` - Additional metadata about the key
      - `ip_whitelist` - List of allowed IP addresses
      - `user_agent_pattern` - Regex pattern for allowed user agents
      - `permissions` - Array of permissions
      - `rate_limit` - Requests per hour limit

  3. New Functions
    - `generate_api_key()` - Generates a secure API key
    - `rotate_api_key()` - Rotates an API key and maintains history
    - `validate_api_key()` - Validates API key with comprehensive checks
    - `check_api_key_permission()` - Checks if API key has specific permission
*/

-- Add new columns to api_keys table
ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS key_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rotation_policy TEXT CHECK (rotation_policy IN ('never', 'monthly', 'quarterly', 'yearly')),
  ADD COLUMN IF NOT EXISTS next_rotation_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS usage_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ip_whitelist TEXT[],
  ADD COLUMN IF NOT EXISTS user_agent_pattern TEXT,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["read"]'::jsonb,
  ADD COLUMN IF NOT EXISTS rate_limit INTEGER DEFAULT 1000;

-- Create api_key_scopes table
CREATE TABLE IF NOT EXISTS api_key_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource_pattern TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create api_key_scope_mappings table
CREATE TABLE IF NOT EXISTS api_key_scope_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  scope_id UUID NOT NULL REFERENCES api_key_scopes(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(api_key_id, scope_id)
);

-- Create api_key_rotations table
CREATE TABLE IF NOT EXISTS api_key_rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  old_key_hash TEXT NOT NULL,
  new_key_hash TEXT NOT NULL,
  rotation_reason TEXT CHECK (rotation_reason IN ('scheduled', 'manual', 'security', 'compromised')),
  rotated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  method TEXT NOT NULL,
  resource TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  error_type TEXT,
  error_message TEXT,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create api_key_webhooks table
CREATE TABLE IF NOT EXISTS api_key_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create rate_limit_buckets table
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  bucket_key TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(api_key_id, bucket_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_first_chars ON api_keys(key_first_chars);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_next_rotation ON api_keys(next_rotation_date) WHERE next_rotation_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_api_key_rotations_key_id ON api_key_rotations(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_rotations_created ON api_key_rotations(created_at);

CREATE INDEX IF NOT EXISTS idx_api_key_scopes_active ON api_key_scopes(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_key_scope_mappings_key ON api_key_scope_mappings(api_key_id);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_method ON api_usage_logs(method);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status ON api_usage_logs(response_status);

CREATE INDEX IF NOT EXISTS idx_api_key_webhooks_user ON api_key_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_api_key_webhooks_active ON api_key_webhooks(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_key ON rate_limit_buckets(api_key_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires ON rate_limit_buckets(expires_at);

-- Create functions
CREATE OR REPLACE FUNCTION generate_api_key(
  p_prefix TEXT DEFAULT 'mcp'
)
RETURNS TABLE(api_key TEXT, key_hash TEXT) AS $$
DECLARE
  v_random_bytes BYTEA;
  v_api_key TEXT;
  v_key_hash TEXT;
BEGIN
  -- Generate 32 random bytes
  v_random_bytes := gen_random_bytes(32);
  
  -- Create API key with prefix
  v_api_key := p_prefix || '_' || encode(v_random_bytes, 'base64');
  v_api_key := regexp_replace(v_api_key, '[/+=]', '', 'g'); -- Remove special chars
  
  -- Generate hash using SHA-256
  v_key_hash := encode(digest(v_api_key, 'sha256'), 'hex');
  
  RETURN QUERY SELECT v_api_key, v_key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rotate_api_key(
  p_api_key_id UUID,
  p_reason TEXT DEFAULT 'manual',
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(new_api_key TEXT, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_old_key_hash TEXT;
  v_new_key TEXT;
  v_new_key_hash TEXT;
  v_key_first_chars TEXT;
  v_key_last_chars TEXT;
BEGIN
  -- Get current key info
  SELECT key_hash INTO v_old_key_hash
  FROM api_keys
  WHERE id = p_api_key_id AND is_revoked = false;
  
  IF v_old_key_hash IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, false, 'API key not found or revoked';
    RETURN;
  END IF;
  
  -- Generate new key
  SELECT api_key, key_hash INTO v_new_key, v_new_key_hash
  FROM generate_api_key();
  
  -- Get first and last chars
  v_key_first_chars := substring(v_new_key, 1, 8);
  v_key_last_chars := substring(v_new_key, length(v_new_key) - 3, 4);
  
  -- Update key in transaction
  BEGIN
    -- Update api_keys table
    UPDATE api_keys
    SET key_hash = v_new_key_hash,
        key_first_chars = v_key_first_chars,
        key_last_chars = v_key_last_chars,
        key_version = key_version + 1,
        updated_at = NOW()
    WHERE id = p_api_key_id;
    
    -- Record rotation
    INSERT INTO api_key_rotations (
      api_key_id, old_key_hash, new_key_hash, 
      rotation_reason, rotated_by
    ) VALUES (
      p_api_key_id, v_old_key_hash, v_new_key_hash,
      p_reason, p_user_id
    );
    
    -- Update next rotation date if policy exists
    UPDATE api_keys
    SET next_rotation_date = CASE rotation_policy
      WHEN 'monthly' THEN NOW() + INTERVAL '1 month'
      WHEN 'quarterly' THEN NOW() + INTERVAL '3 months'
      WHEN 'yearly' THEN NOW() + INTERVAL '1 year'
      ELSE NULL
    END
    WHERE id = p_api_key_id AND rotation_policy IS NOT NULL;
    
    RETURN QUERY SELECT v_new_key, true, 'API key rotated successfully';
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT NULL::TEXT, false, 'Rotation failed: ' || SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_api_key(
  p_api_key TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
  is_valid BOOLEAN,
  api_key_id UUID,
  user_id UUID,
  resume_id UUID,
  permissions JSONB,
  rate_limit INTEGER,
  message TEXT
) AS $$
DECLARE
  v_key_hash TEXT;
  v_record RECORD;
BEGIN
  -- Hash the provided key
  v_key_hash := encode(digest(p_api_key, 'sha256'), 'hex');
  
  -- Find matching key
  SELECT 
    id, user_id, resume_id, permissions, rate_limit,
    is_revoked, expires_at, ip_whitelist, user_agent_pattern
  INTO v_record
  FROM api_keys
  WHERE key_hash = v_key_hash;
  
  -- Check if key exists
  IF v_record.id IS NULL THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::UUID, NULL::UUID, 
      NULL::JSONB, NULL::INTEGER, 'Invalid API key';
    RETURN;
  END IF;
  
  -- Check if key is revoked
  IF v_record.is_revoked THEN
    RETURN QUERY SELECT 
      false, v_record.id, v_record.user_id, v_record.resume_id,
      v_record.permissions, v_record.rate_limit, 'API key is revoked';
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_record.expires_at IS NOT NULL AND v_record.expires_at < NOW() THEN
    -- Mark as revoked
    UPDATE api_keys SET is_revoked = true WHERE id = v_record.id;
    
    RETURN QUERY SELECT 
      false, v_record.id, v_record.user_id, v_record.resume_id,
      v_record.permissions, v_record.rate_limit, 'API key has expired';
    RETURN;
  END IF;
  
  -- Check IP whitelist
  IF v_record.ip_whitelist IS NOT NULL AND p_ip_address IS NOT NULL THEN
    IF NOT (p_ip_address = ANY(v_record.ip_whitelist)) THEN
      RETURN QUERY SELECT 
        false, v_record.id, v_record.user_id, v_record.resume_id,
        v_record.permissions, v_record.rate_limit, 'IP address not whitelisted';
      RETURN;
    END IF;
  END IF;
  
  -- Check user agent pattern
  IF v_record.user_agent_pattern IS NOT NULL AND p_user_agent IS NOT NULL THEN
    IF NOT (p_user_agent ~ v_record.user_agent_pattern) THEN
      RETURN QUERY SELECT 
        false, v_record.id, v_record.user_id, v_record.resume_id,
        v_record.permissions, v_record.rate_limit, 'User agent does not match pattern';
      RETURN;
    END IF;
  END IF;
  
  -- Update last used timestamp and usage count
  UPDATE api_keys 
  SET last_used_at = NOW(), 
      usage_count = usage_count + 1
  WHERE id = v_record.id;
  
  -- Return success
  RETURN QUERY SELECT 
    true, v_record.id, v_record.user_id, v_record.resume_id,
    v_record.permissions, v_record.rate_limit, 'Valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_api_key_permission(
  p_api_key_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
  v_permissions JSONB;
  v_scopes TEXT[];
BEGIN
  -- First check legacy permissions in api_keys table
  SELECT permissions INTO v_permissions
  FROM api_keys
  WHERE id = p_api_key_id;
  
  -- Check if action is in permissions array
  IF v_permissions ? p_action THEN
    v_has_permission := true;
  END IF;
  
  -- Check scope-based permissions
  SELECT array_agg(s.resource_pattern) INTO v_scopes
  FROM api_key_scope_mappings m
  JOIN api_key_scopes s ON m.scope_id = s.id
  WHERE m.api_key_id = p_api_key_id AND s.is_active = true;
  
  -- Check if any scope matches the requested resource:action
  IF v_scopes IS NOT NULL THEN
    FOR i IN 1..array_length(v_scopes, 1) LOOP
      -- Check exact match or wildcard
      IF v_scopes[i] = p_resource || ':' || p_action OR
         v_scopes[i] = p_resource || ':*' OR
         v_scopes[i] = '*:' || p_action OR
         v_scopes[i] = '*:*' THEN
        v_has_permission := true;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default scopes
INSERT INTO api_key_scopes (name, description, resource_pattern) VALUES
  ('read:all', 'Read access to all resources', '*:read'),
  ('write:all', 'Write access to all resources', '*:write'),
  ('profile:read', 'Read profile information', 'profile:read'),
  ('profile:write', 'Modify profile information', 'profile:write'),
  ('experience:read', 'Read experience entries', 'experience:read'),
  ('experience:write', 'Modify experience entries', 'experience:write'),
  ('skills:read', 'Read skills', 'skills:read'),
  ('skills:write', 'Modify skills', 'skills:write'),
  ('projects:read', 'Read projects', 'projects:read'),
  ('projects:write', 'Modify projects', 'projects:write'),
  ('education:read', 'Read education entries', 'education:read'),
  ('education:write', 'Modify education entries', 'education:write'),
  ('certifications:read', 'Read certifications', 'certifications:read'),
  ('certifications:write', 'Modify certifications', 'certifications:write'),
  ('resume:read', 'Read complete resume', 'resume:read'),
  ('resume:write', 'Modify resume structure', 'resume:write'),
  ('analytics:read', 'View analytics data', 'analytics:read')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE api_key_scopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active scopes" ON api_key_scopes
  FOR SELECT USING (is_active = true);

ALTER TABLE api_key_scope_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scope mappings" ON api_key_scope_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_keys 
      WHERE api_keys.id = api_key_scope_mappings.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own scope mappings" ON api_key_scope_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM api_keys 
      WHERE api_keys.id = api_key_scope_mappings.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

ALTER TABLE api_key_rotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own key rotations" ON api_key_rotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_keys 
      WHERE api_keys.id = api_key_rotations.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage logs" ON api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_keys 
      WHERE api_keys.id = api_usage_logs.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

ALTER TABLE api_key_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own webhooks" ON api_key_webhooks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own webhooks" ON api_key_webhooks
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rate limit buckets" ON rate_limit_buckets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_keys 
      WHERE api_keys.id = rate_limit_buckets.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );