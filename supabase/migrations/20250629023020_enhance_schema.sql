-- Enhanced Schema for Resume MCP Server
-- This migration enhances the initial schema with additional tables and features

-- Add profile extension table for users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  professional_title TEXT,
  summary TEXT,
  location JSONB, -- {city, state, country, countryCode, remote}
  languages JSONB, -- [{name, proficiency}]
  headline TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add contact information table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  github TEXT,
  website TEXT,
  twitter TEXT,
  availability TEXT,
  preferred_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Add experiences table (normalized from blocks)
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  location TEXT,
  summary TEXT,
  highlights TEXT[], -- Array of achievement strings
  technologies TEXT[], -- Array of technology names
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add skills table (normalized from blocks)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, name)
);

-- Add projects table (normalized from blocks)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  role TEXT,
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  highlights TEXT[],
  technologies TEXT[],
  metrics JSONB, -- {stars, forks, downloads, etc}
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add education table (normalized from blocks)
CREATE TABLE IF NOT EXISTS public.education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  gpa DECIMAL(3,2),
  max_gpa DECIMAL(3,2) DEFAULT 4.0,
  honors TEXT[],
  thesis TEXT,
  activities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add certifications table (normalized from blocks)
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add API key permissions table for granular control
CREATE TABLE IF NOT EXISTS public.api_key_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  resource TEXT NOT NULL, -- 'profile', 'experience', 'skills', etc.
  actions TEXT[] NOT NULL, -- ['read', 'write', 'delete']
  conditions JSONB, -- Additional conditions like date ranges, specific fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(api_key_id, resource)
);

-- Add rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  bucket_key TEXT NOT NULL, -- e.g., 'hour:2024-01-01-14'
  request_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(api_key_id, bucket_key)
);

-- Add suspicious activity log
CREATE TABLE IF NOT EXISTS public.suspicious_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL, -- 'prompt_injection', 'rate_limit_exceeded', 'invalid_params'
  details JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add resume templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- NULL for system templates
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  template_data JSONB NOT NULL, -- Template structure and default values
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for new tables
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX idx_experiences_dates ON public.experiences(start_date, end_date);
CREATE INDEX idx_skills_user_id ON public.skills(user_id);
CREATE INDEX idx_skills_category ON public.skills(category);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_featured ON public.projects(featured) WHERE featured = true;
CREATE INDEX idx_education_user_id ON public.education(user_id);
CREATE INDEX idx_certifications_user_id ON public.certifications(user_id);
-- Index for certifications by expiry date (we'll handle active filtering in queries)
CREATE INDEX idx_certifications_expiry ON public.certifications(expiry_date);
CREATE INDEX idx_api_key_permissions_api_key ON public.api_key_permissions(api_key_id);
CREATE INDEX idx_rate_limit_buckets_lookup ON public.rate_limit_buckets(api_key_id, bucket_key);
CREATE INDEX idx_rate_limit_buckets_expires ON public.rate_limit_buckets(expires_at);
CREATE INDEX idx_suspicious_activities_api_key ON public.suspicious_activities(api_key_id);
CREATE INDEX idx_suspicious_activities_type ON public.suspicious_activities(activity_type);
CREATE INDEX idx_resume_templates_public ON public.resume_templates(is_public) WHERE is_public = true;

-- Add triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_experiences_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_skills_updated_at BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_education_updated_at BEFORE UPDATE ON public.education
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_certifications_updated_at BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_resume_templates_updated_at BEFORE UPDATE ON public.resume_templates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- Note: All RLS policies are created in the dedicated RLS migration file (20250629023060_row_level_security.sql)

-- Add function to clean up expired rate limit buckets
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_api_key_id UUID,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, current_count INTEGER, limit_count INTEGER) AS $$
DECLARE
  v_bucket_key TEXT;
  v_current_count INTEGER;
  v_rate_limit INTEGER;
BEGIN
  -- Get the rate limit for this API key
  SELECT rate_limit INTO v_rate_limit
  FROM public.api_keys
  WHERE id = p_api_key_id AND is_active = true;
  
  IF v_rate_limit IS NULL THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  -- Generate bucket key based on current time window
  v_bucket_key := 'window:' || DATE_TRUNC('hour', NOW())::TEXT || ':' || (EXTRACT(MINUTE FROM NOW())::INTEGER / p_window_minutes);
  
  -- Get or create bucket
  INSERT INTO public.rate_limit_buckets (api_key_id, bucket_key, request_count, expires_at)
  VALUES (p_api_key_id, v_bucket_key, 0, NOW() + INTERVAL '1 hour')
  ON CONFLICT (api_key_id, bucket_key) DO NOTHING;
  
  -- Get current count
  SELECT request_count INTO v_current_count
  FROM public.rate_limit_buckets
  WHERE api_key_id = p_api_key_id AND bucket_key = v_bucket_key;
  
  -- Return result
  RETURN QUERY SELECT (v_current_count < v_rate_limit), v_current_count, v_rate_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_api_key_id UUID,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS INTEGER AS $$
DECLARE
  v_bucket_key TEXT;
  v_new_count INTEGER;
BEGIN
  -- Generate bucket key
  v_bucket_key := 'window:' || DATE_TRUNC('hour', NOW())::TEXT || ':' || (EXTRACT(MINUTE FROM NOW())::INTEGER / p_window_minutes);
  
  -- Increment counter
  UPDATE public.rate_limit_buckets
  SET request_count = request_count + 1
  WHERE api_key_id = p_api_key_id AND bucket_key = v_bucket_key
  RETURNING request_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'Extended user profile information';
COMMENT ON TABLE public.contacts IS 'User contact information';
COMMENT ON TABLE public.experiences IS 'Professional work experience entries';
COMMENT ON TABLE public.skills IS 'Professional skills and competencies';
COMMENT ON TABLE public.projects IS 'Portfolio projects and achievements';
COMMENT ON TABLE public.education IS 'Educational background and degrees';
COMMENT ON TABLE public.certifications IS 'Professional certifications and credentials';
COMMENT ON TABLE public.api_key_permissions IS 'Granular permissions for API keys';
COMMENT ON TABLE public.rate_limit_buckets IS 'Rate limiting tracking buckets';
COMMENT ON TABLE public.suspicious_activities IS 'Log of suspicious API usage patterns';
COMMENT ON TABLE public.resume_templates IS 'Resume layout templates';