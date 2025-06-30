-- Migration: Align resume table with resume-mcp features
-- This migration adds all the missing columns from resume-mcp to create a unified schema

-- Add nanoid for URL-friendly identifiers
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS nanoid TEXT UNIQUE;

-- Add role and display_name
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS role TEXT DEFAULT '';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '';

-- Add Resume Page Settings columns
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS publish_resume_page BOOLEAN DEFAULT true;
-- presence_badge is already added as BOOLEAN in the base migration, skip it here
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS enable_resume_downloads BOOLEAN DEFAULT true;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS resume_page_template TEXT DEFAULT 'standard';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS allow_users_switch_template BOOLEAN DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- Add Mischief & LLM settings columns
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS enable_mischief_mode BOOLEAN DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS include_custom_mischief BOOLEAN DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS custom_mischief_instructions TEXT DEFAULT '';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS attempt_avoid_detection BOOLEAN DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS embed_llm_instructions BOOLEAN DEFAULT true;

-- Add SEO metadata columns
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT '';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS robots_directives TEXT[] DEFAULT ARRAY['index', 'follow'];

-- Add dynamic data columns
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;

-- Add constraints
-- Skip presence_badge constraint since it's now a boolean field

ALTER TABLE public.resumes ADD CONSTRAINT chk_resume_page_template 
  CHECK (resume_page_template IN ('standard', 'modern', 'classic', 'minimal', 'creative'));

ALTER TABLE public.resumes ADD CONSTRAINT chk_visibility 
  CHECK (visibility IN ('public', 'private', 'unlisted', 'password'));

-- Function to generate nanoid (21 characters, URL-safe)
CREATE OR REPLACE FUNCTION generate_nanoid(size int DEFAULT 21)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(64) := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  bytes bytea := gen_random_bytes(size);
  byte int;
  pos int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 63) + 1;
    id := id || substr(urlAlphabet, pos, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE plpgsql VOLATILE;

-- Generate nanoid for existing records
UPDATE public.resumes 
SET nanoid = generate_nanoid() 
WHERE nanoid IS NULL;

-- Make nanoid NOT NULL after populating
ALTER TABLE public.resumes ALTER COLUMN nanoid SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_nanoid ON public.resumes(nanoid);
CREATE INDEX IF NOT EXISTS idx_resumes_visibility ON public.resumes(visibility);
CREATE INDEX IF NOT EXISTS idx_resumes_mischief_mode ON public.resumes(enable_mischief_mode) WHERE enable_mischief_mode = true;
CREATE INDEX IF NOT EXISTS idx_resumes_tags ON public.resumes USING gin(tags);

-- Add unique constraint for one default resume per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_one_default_per_user 
  ON public.resumes(user_id) WHERE is_default = true;

-- Add comment describing the table
COMMENT ON TABLE public.resumes IS 'Resume configurations with settings, SEO metadata, and mischief mode features';
COMMENT ON COLUMN public.resumes.nanoid IS 'URL-friendly unique identifier for public resume URLs';
-- Skip comment for presence_badge since it's now a boolean field
COMMENT ON COLUMN public.resumes.enable_mischief_mode IS 'Enable hidden messages in resume for LLM detection';
COMMENT ON COLUMN public.resumes.robots_directives IS 'SEO robot directives as array (index, follow, noindex, nofollow, etc)';
COMMENT ON COLUMN public.resumes.custom_data IS 'Reserved for future extensibility and custom features';