/*
  # Add missing settings column to resumes table

  1. Changes
    - Add a `settings` column to the `resumes` table to store resume settings as a JSON object
    - This fixes the error: "Could not find the 'settings' column of 'resumes' in the schema cache"
*/

-- Add settings column to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Update existing resumes to populate the settings column with values from individual columns
UPDATE resumes
SET settings = jsonb_build_object(
  'publishResumePage', publish_resume_page,
  'presenceBadge', presence_badge,
  'enableResumeDownloads', enable_resume_downloads,
  'resumePageTemplate', resume_page_template,
  'allowUsersSwitchTemplate', allow_users_switch_template,
  'visibility', visibility,
  'enableMischiefMode', enable_mischief_mode,
  'includeCustomMischief', include_custom_mischief,
  'customMischiefInstructions', custom_mischief_instructions,
  'attemptAvoidDetection', attempt_avoid_detection,
  'embedLLMInstructions', embed_llm_instructions,
  'urlSlug', slug,
  'metaTitle', meta_title,
  'metaDescription', meta_description,
  'robotsDirectives', robots_directives
);