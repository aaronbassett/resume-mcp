-- Fix presence_badge column to be an enum instead of boolean
-- This migration changes the presence_badge column to support status values

-- First, we need to drop the column and recreate it with the correct type
-- We can't directly alter from boolean to text with check constraint
ALTER TABLE public.resumes DROP COLUMN IF EXISTS presence_badge;

-- Add the column back as TEXT with enum constraint
ALTER TABLE public.resumes 
ADD COLUMN presence_badge TEXT DEFAULT 'none' 
CHECK (presence_badge IN ('none', 'available', 'busy', 'away', 'dnd'));

-- Add comment explaining the enum values
COMMENT ON COLUMN public.resumes.presence_badge IS 'Availability indicator shown on resume page: none (no badge), available (green), busy (yellow), away (gray), dnd (red)';

-- Create index for filtering by presence status
CREATE INDEX IF NOT EXISTS idx_resumes_presence_badge ON public.resumes(presence_badge) WHERE presence_badge != 'none';