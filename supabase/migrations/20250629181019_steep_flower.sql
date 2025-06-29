/*
  # Add Resume Settings Columns

  1. Changes
    - Add settings columns to the resumes table to store the advanced settings from the ResumeSettingsDrawer
    - Add default values for all new columns
    - Update existing resumes to have default settings values

  2. New Columns
    - Resume Page Settings:
      - `publish_resume_page` (boolean)
      - `presence_badge` (text)
      - `enable_resume_downloads` (boolean)
      - `resume_page_template` (text)
      - `allow_users_switch_template` (boolean)
      - `visibility` (text)
    
    - Mischief & LLMs:
      - `enable_mischief_mode` (boolean)
      - `include_custom_mischief` (boolean)
      - `custom_mischief_instructions` (text)
      - `attempt_avoid_detection` (boolean)
      - `embed_llm_instructions` (boolean)
    
    - Metadata:
      - `meta_title` (text)
      - `meta_description` (text)
      - `robots_directives` (jsonb)
*/

-- Add Resume Page Settings columns
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS publish_resume_page boolean DEFAULT true;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS presence_badge text DEFAULT 'none';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS enable_resume_downloads boolean DEFAULT true;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS resume_page_template text DEFAULT 'standard';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS allow_users_switch_template boolean DEFAULT false;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public';

-- Add Mischief & LLMs columns
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS enable_mischief_mode boolean DEFAULT false;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS include_custom_mischief boolean DEFAULT false;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS custom_mischief_instructions text DEFAULT '';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS attempt_avoid_detection boolean DEFAULT false;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS embed_llm_instructions boolean DEFAULT true;

-- Add Metadata columns
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS meta_title text DEFAULT '';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS meta_description text DEFAULT '';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS robots_directives jsonb DEFAULT '["index", "follow"]'::jsonb;

-- Create an index on visibility for faster filtering
CREATE INDEX IF NOT EXISTS resumes_visibility_idx ON resumes(visibility);