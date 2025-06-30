-- Add body_content column to resumes table for storing resume body text
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS body_content TEXT DEFAULT '';

-- Add comment
COMMENT ON COLUMN public.resumes.body_content IS 'Main body content of the resume in plain text format';