-- Enhanced API Key Management System
-- This migration enhances API key security with encryption, rotation, and detailed tracking

-- Install pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create API key rotation table
CREATE TABLE IF NOT EXISTS public.api_key_rotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  old_key_hash TEXT NOT NULL,
  new_key_hash TEXT NOT NULL,
  rotation_reason TEXT CHECK (rotation_reason IN ('scheduled', 'manual', 'security', 'compromised')),
  rotated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create API key scopes table for fine-grained permissions
CREATE TABLE IF NOT EXISTS public.api_key_scopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource_pattern TEXT NOT NULL, -- e.g., 'resume:*', 'profile:read', 'experience:write'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create junction table for API key to scope mapping
CREATE TABLE IF NOT EXISTS public.api_key_scope_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  scope_id UUID NOT NULL REFERENCES public.api_key_scopes(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(api_key_id, scope_id)
);

-- Create API key encryption keys table (for key derivation)
CREATE TABLE IF NOT EXISTS public.api_key_encryption_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_version INTEGER NOT NULL,
  encrypted_key TEXT NOT NULL, -- Encrypted with master key from environment
  algorithm TEXT DEFAULT 'AES-256-GCM',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  rotated_at TIMESTAMPTZ,
  UNIQUE(key_version)
);

-- Create detailed API usage logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  method TEXT NOT NULL,
  resource TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  error_type TEXT,
  error_message TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create API key webhooks table for notifications
CREATE TABLE IF NOT EXISTS public.api_key_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['key.created', 'key.rotated', 'key.expired', 'key.revoked']
  secret_hash TEXT NOT NULL, -- For webhook signature verification
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns to existing api_keys table
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS key_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rotation_policy TEXT CHECK (rotation_policy IN ('never', 'monthly', 'quarterly', 'yearly')),
  ADD COLUMN IF NOT EXISTS next_rotation_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS usage_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ip_whitelist INET[],
  ADD COLUMN IF NOT EXISTS user_agent_pattern TEXT;

-- Create function to generate secure API key
CREATE OR REPLACE FUNCTION public.generate_api_key(
  p_prefix TEXT DEFAULT 'sk'
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

-- Create function to rotate API key
CREATE OR REPLACE FUNCTION public.rotate_api_key(
  p_api_key_id UUID,
  p_reason TEXT DEFAULT 'manual',
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(new_api_key TEXT, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_old_key_hash TEXT;
  v_new_key TEXT;
  v_new_key_hash TEXT;
  v_key_prefix TEXT;
BEGIN
  -- Get current key info
  SELECT key_hash, key_prefix INTO v_old_key_hash, v_key_prefix
  FROM public.api_keys
  WHERE id = p_api_key_id AND is_active = true;
  
  IF v_old_key_hash IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, false, 'API key not found or inactive';
    RETURN;
  END IF;
  
  -- Generate new key
  SELECT api_key, key_hash INTO v_new_key, v_new_key_hash
  FROM public.generate_api_key(v_key_prefix);
  
  -- Update key in transaction
  BEGIN
    -- Update api_keys table
    UPDATE public.api_keys
    SET key_hash = v_new_key_hash,
        key_version = key_version + 1,
        updated_at = NOW()
    WHERE id = p_api_key_id;
    
    -- Record rotation
    INSERT INTO public.api_key_rotations (
      api_key_id, old_key_hash, new_key_hash, 
      rotation_reason, rotated_by
    ) VALUES (
      p_api_key_id, v_old_key_hash, v_new_key_hash,
      p_reason, p_user_id
    );
    
    -- Update next rotation date if policy exists
    UPDATE public.api_keys
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

-- Create function to validate API key with detailed response
CREATE OR REPLACE FUNCTION public.validate_api_key(
  p_api_key TEXT,
  p_ip_address INET DEFAULT NULL,
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
    ak.id, ak.user_id, ak.resume_id, ak.permissions, ak.rate_limit,
    ak.is_active, ak.expires_at, ak.ip_whitelist, ak.user_agent_pattern
  INTO v_record
  FROM public.api_keys ak
  WHERE ak.key_hash = v_key_hash;
  
  -- Check if key exists
  IF v_record.id IS NULL THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::UUID, NULL::UUID, 
      NULL::JSONB, NULL::INTEGER, 'Invalid API key';
    RETURN;
  END IF;
  
  -- Check if key is active
  IF NOT v_record.is_active THEN
    RETURN QUERY SELECT 
      false, v_record.id, v_record.user_id, v_record.resume_id,
      v_record.permissions, v_record.rate_limit, 'API key is inactive';
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_record.expires_at IS NOT NULL AND v_record.expires_at < NOW() THEN
    -- Mark as inactive
    UPDATE public.api_keys SET is_active = false WHERE id = v_record.id;
    
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
  UPDATE public.api_keys 
  SET last_used_at = NOW(), 
      usage_count = usage_count + 1
  WHERE id = v_record.id;
  
  -- Return success
  RETURN QUERY SELECT 
    true, v_record.id, v_record.user_id, v_record.resume_id,
    v_record.permissions, v_record.rate_limit, 'Valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check API key permissions
CREATE OR REPLACE FUNCTION public.check_api_key_permission(
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
  FROM public.api_keys
  WHERE id = p_api_key_id;
  
  -- Check if action is in permissions array
  IF v_permissions ? p_action THEN
    v_has_permission := true;
  END IF;
  
  -- Check scope-based permissions
  SELECT array_agg(s.resource_pattern) INTO v_scopes
  FROM public.api_key_scope_mappings m
  JOIN public.api_key_scopes s ON m.scope_id = s.id
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

-- Create indexes
CREATE INDEX idx_api_key_rotations_key_id ON public.api_key_rotations(api_key_id);
CREATE INDEX idx_api_key_rotations_created ON public.api_key_rotations(created_at);
CREATE INDEX idx_api_key_scopes_active ON public.api_key_scopes(is_active) WHERE is_active = true;
CREATE INDEX idx_api_key_scope_mappings_key ON public.api_key_scope_mappings(api_key_id);
CREATE INDEX idx_api_usage_logs_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created ON public.api_usage_logs(created_at);
CREATE INDEX idx_api_usage_logs_method ON public.api_usage_logs(method);
CREATE INDEX idx_api_usage_logs_status ON public.api_usage_logs(response_status);
CREATE INDEX idx_api_key_webhooks_user ON public.api_key_webhooks(user_id);
CREATE INDEX idx_api_key_webhooks_active ON public.api_key_webhooks(is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_next_rotation ON public.api_keys(next_rotation_date) WHERE next_rotation_date IS NOT NULL;

-- Add triggers
CREATE TRIGGER handle_api_key_webhooks_updated_at BEFORE UPDATE ON public.api_key_webhooks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS on new tables
ALTER TABLE public.api_key_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_scope_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for API key rotations
CREATE POLICY "Users can view own key rotations" ON public.api_key_rotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_key_rotations.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- RLS policies for API key scopes (read-only for all authenticated)
CREATE POLICY "Anyone can view active scopes" ON public.api_key_scopes
  FOR SELECT USING (is_active = true);

-- RLS policies for scope mappings
CREATE POLICY "Users can view own scope mappings" ON public.api_key_scope_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_key_scope_mappings.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own scope mappings" ON public.api_key_scope_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_key_scope_mappings.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- RLS policies for usage logs
CREATE POLICY "Users can view own usage logs" ON public.api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_usage_logs.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- RLS policies for webhooks
CREATE POLICY "Users can view own webhooks" ON public.api_key_webhooks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own webhooks" ON public.api_key_webhooks
  FOR ALL USING (user_id = auth.uid());

-- Insert default scopes
INSERT INTO public.api_key_scopes (name, description, resource_pattern) VALUES
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
  ('analytics:read', 'View analytics data', 'analytics:read');

-- Insert initial encryption key
INSERT INTO public.api_key_encryption_keys (key_version, encrypted_key)
VALUES (1, 'PLACEHOLDER_ENCRYPTED_KEY_TO_BE_REPLACED_IN_PRODUCTION');

-- Add comments
COMMENT ON TABLE public.api_key_rotations IS 'History of API key rotations';
COMMENT ON TABLE public.api_key_scopes IS 'Available permission scopes for API keys';
COMMENT ON TABLE public.api_key_scope_mappings IS 'Maps API keys to their granted scopes';
COMMENT ON TABLE public.api_key_encryption_keys IS 'Master keys for API key encryption';
COMMENT ON TABLE public.api_usage_logs IS 'Detailed API usage logs for analytics';
COMMENT ON TABLE public.api_key_webhooks IS 'Webhook configurations for API key events';
COMMENT ON FUNCTION public.generate_api_key IS 'Generates a secure API key with proper entropy';
COMMENT ON FUNCTION public.rotate_api_key IS 'Rotates an API key and maintains history';
COMMENT ON FUNCTION public.validate_api_key IS 'Validates API key with comprehensive checks';
COMMENT ON FUNCTION public.check_api_key_permission IS 'Checks if API key has specific permission';