-- Row Level Security (RLS) Policies
-- This migration implements comprehensive RLS policies for multi-tenant data isolation

-- Enable RLS on all tables (some may already be enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
-- resume_compositions table has been renamed to resume_blocks
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER POLICIES
-- =====================================================

-- Note: Basic user policies are created in the initial schema migration

-- =====================================================
-- PROFILE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- API keys can view profiles they have permission for
CREATE POLICY "API keys can view permitted profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = profiles.id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
    )
  );

-- =====================================================
-- CONTACT POLICIES
-- =====================================================

-- Users can view their own contacts
CREATE POLICY "Users can view own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own contacts
CREATE POLICY "Users can manage own contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view contacts with permission
CREATE POLICY "API keys can view permitted contacts" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = contacts.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'contact:read')
    )
  );

-- =====================================================
-- EXPERIENCE POLICIES
-- =====================================================

-- Users can view their own experiences
CREATE POLICY "Users can view own experiences" ON public.experiences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own experiences
CREATE POLICY "Users can manage own experiences" ON public.experiences
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view experiences with permission
CREATE POLICY "API keys can view permitted experiences" ON public.experiences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = experiences.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'experience:read')
    )
  );

-- =====================================================
-- SKILLS POLICIES
-- =====================================================

-- Users can view their own skills
CREATE POLICY "Users can view own skills" ON public.skills
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own skills
CREATE POLICY "Users can manage own skills" ON public.skills
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view skills with permission
CREATE POLICY "API keys can view permitted skills" ON public.skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = skills.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'skills:read')
    )
  );

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

-- Users can view their own projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own projects
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view projects with permission
CREATE POLICY "API keys can view permitted projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = projects.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'projects:read')
    )
  );

-- =====================================================
-- EDUCATION POLICIES
-- =====================================================

-- Users can view their own education
CREATE POLICY "Users can view own education" ON public.education
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own education
CREATE POLICY "Users can manage own education" ON public.education
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view education with permission
CREATE POLICY "API keys can view permitted education" ON public.education
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = education.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'education:read')
    )
  );

-- =====================================================
-- CERTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own certifications
CREATE POLICY "Users can view own certifications" ON public.certifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own certifications
CREATE POLICY "Users can manage own certifications" ON public.certifications
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view certifications with permission
CREATE POLICY "API keys can view permitted certifications" ON public.certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = certifications.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'certifications:read')
    )
  );

-- =====================================================
-- RESUME POLICIES
-- =====================================================

-- Note: Basic user policies are created in the initial schema migration

-- API keys can view resumes they have access to
CREATE POLICY "API keys can view permitted resumes" ON public.resumes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE (ak.user_id = resumes.user_id OR ak.resume_id = resumes.id)
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read' OR ak.permissions ? 'resume:read')
    )
  );

-- API keys can update resumes with write permission
CREATE POLICY "API keys can update permitted resumes" ON public.resumes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE (ak.user_id = resumes.user_id OR ak.resume_id = resumes.id)
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'write' OR ak.permissions ? 'resume:write')
    )
  );

-- =====================================================
-- RESUME TEMPLATE POLICIES
-- =====================================================

-- Anyone can view public templates
CREATE POLICY "Anyone can view public templates" ON public.resume_templates
  FOR SELECT USING (is_public = true);

-- Users can view their own private templates
CREATE POLICY "Users can view own templates" ON public.resume_templates
  FOR SELECT USING (user_id = auth.uid() AND is_public = false);

-- Users can manage their own templates
CREATE POLICY "Users can manage own templates" ON public.resume_templates
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- RESUME BLOCKS POLICIES (formerly resume_compositions)
-- =====================================================
-- Note: Policies for resume_blocks are already defined above

-- =====================================================
-- BLOCKS POLICIES
-- =====================================================

-- Note: Basic blocks policy is in initial schema
-- Additional API key policy for blocks

-- Users can manage their own blocks
CREATE POLICY "Users can manage own blocks" ON public.blocks
  FOR ALL USING (auth.uid() = user_id);

-- API keys can view blocks with permission
CREATE POLICY "API keys can view permitted blocks" ON public.blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = blocks.user_id
      AND ak.key_hash = current_setting('app.api_key_hash', true)
      AND ak.is_active = true
      AND (ak.permissions ? 'read')
    )
  );

-- =====================================================
-- API KEY POLICIES
-- =====================================================

-- Note: Basic API key policies are created in the initial schema migration

-- =====================================================
-- API KEY PERMISSION POLICIES
-- =====================================================

-- Users can view permissions for their API keys
CREATE POLICY "Users can view own API key permissions" ON public.api_key_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys
      WHERE api_keys.id = api_key_permissions.api_key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- Users can manage permissions for their API keys
CREATE POLICY "Users can manage own API key permissions" ON public.api_key_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.api_keys
      WHERE api_keys.id = api_key_permissions.api_key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- =====================================================
-- RATE LIMIT BUCKET POLICIES
-- =====================================================

-- System can manage all rate limit buckets (no user access)
-- Rate limit buckets are managed internally by the system

-- =====================================================
-- HELPER FUNCTIONS FOR API KEY CONTEXT
-- =====================================================

-- Create function to set API key context for RLS
CREATE OR REPLACE FUNCTION public.set_api_key_context(p_api_key_hash TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.api_key_hash', p_api_key_hash, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check API key permissions
CREATE OR REPLACE FUNCTION public.has_api_permission(
  p_resource TEXT,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_api_key_hash TEXT;
  v_has_permission BOOLEAN := false;
BEGIN
  -- Get API key hash from context
  v_api_key_hash := current_setting('app.api_key_hash', true);
  
  IF v_api_key_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permissions
  SELECT EXISTS (
    SELECT 1 FROM public.api_keys ak
    WHERE ak.key_hash = v_api_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
    AND (
      ak.permissions ? p_action OR
      ak.permissions ? (p_resource || ':' || p_action) OR
      ak.permissions ? '*'
    )
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- BYPASS RLS FOR SERVICE ROLE
-- =====================================================

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Create secure function to verify API key and get user context
CREATE OR REPLACE FUNCTION public.verify_api_key_and_get_context(p_api_key TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  user_id UUID,
  api_key_id UUID,
  resume_id UUID,
  permissions JSONB,
  rate_limit INTEGER
) AS $$
DECLARE
  v_key_hash TEXT;
BEGIN
  -- Hash the API key
  v_key_hash := encode(digest(p_api_key, 'sha256'), 'hex');
  
  -- Set the API key context for RLS
  PERFORM public.set_api_key_context(v_key_hash);
  
  -- Return the validation result
  RETURN QUERY
  SELECT 
    true as is_valid,
    ak.user_id,
    ak.id as api_key_id,
    ak.resume_id,
    ak.permissions,
    ak.rate_limit
  FROM public.api_keys ak
  WHERE ak.key_hash = v_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
    
  -- If no valid key found, return invalid result
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      false as is_valid,
      NULL::UUID as user_id,
      NULL::UUID as api_key_id,
      NULL::UUID as resume_id,
      NULL::JSONB as permissions,
      NULL::INTEGER as rate_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PUBLIC ACCESS POLICIES
-- =====================================================

-- Note: Public resume sharing features are not implemented yet

-- =====================================================
-- AUDIT LOG POLICIES
-- =====================================================

-- Create policy for audit logs (append-only)
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- No one can update or delete audit logs
-- (No UPDATE or DELETE policies created)

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view own user" ON public.users IS 
  'Ensures users can only access their own user record';

COMMENT ON POLICY "API keys can view permitted profiles" ON public.profiles IS 
  'Allows API keys to access profiles based on permissions and ownership';

COMMENT ON FUNCTION public.set_api_key_context IS 
  'Sets the API key hash in the session context for RLS policies to use';

COMMENT ON FUNCTION public.has_api_permission IS 
  'Checks if the current API key has a specific permission for a resource';

COMMENT ON FUNCTION public.verify_api_key_and_get_context IS 
  'Securely verifies an API key and returns associated context information';