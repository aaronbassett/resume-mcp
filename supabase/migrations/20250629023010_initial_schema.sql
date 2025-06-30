-- Create users table (profile owners)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create blocks table (reusable content blocks)
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('experience', 'education', 'skill', 'project', 'certification', 'profile', 'contact')),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create resume_blocks junction table
CREATE TABLE IF NOT EXISTS public.resume_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(resume_id, block_id)
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  permissions JSONB DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.api_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  params JSONB,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_code TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_slug ON public.resumes(slug);
CREATE INDEX idx_blocks_user_id ON public.blocks(user_id);
CREATE INDEX idx_blocks_type ON public.blocks(type);
CREATE INDEX idx_resume_blocks_resume_id ON public.resume_blocks(resume_id);
CREATE INDEX idx_resume_blocks_position ON public.resume_blocks(resume_id, position);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_prefix ON public.api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_requests_api_key_id ON public.api_requests(api_key_id);
CREATE INDEX idx_api_requests_created_at ON public.api_requests(created_at);
CREATE INDEX idx_api_requests_method ON public.api_requests(method);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_resumes_updated_at BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_blocks_updated_at BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own user" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Resume policies
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own resumes" ON public.resumes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (user_id = auth.uid());

-- Block policies
CREATE POLICY "Users can view own blocks" ON public.blocks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own blocks" ON public.blocks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own blocks" ON public.blocks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own blocks" ON public.blocks
  FOR DELETE USING (user_id = auth.uid());

-- Resume blocks policies
CREATE POLICY "Users can view own resume blocks" ON public.resume_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_blocks.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own resume blocks" ON public.resume_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_blocks.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

-- API key policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- API request policies
CREATE POLICY "Users can view own API requests" ON public.api_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_requests.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- Add sample data comment
COMMENT ON SCHEMA public IS 'Resume MCP Server - Stores resume data, API keys, and analytics';