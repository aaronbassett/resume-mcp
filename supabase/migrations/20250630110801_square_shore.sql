/*
  # Allow Null resume_id in API Keys Table

  1. Changes
    - Modify the `resume_id` column in the `api_keys` table to allow NULL values
    - This enables admin keys to work without being associated with a specific resume

  2. Security
    - No changes to security policies required
*/

-- Modify the resume_id column to allow NULL values
ALTER TABLE api_keys ALTER COLUMN resume_id DROP NOT NULL;

-- Update foreign key constraint to match
ALTER TABLE api_keys 
  DROP CONSTRAINT IF EXISTS api_keys_resume_id_fkey,
  ADD CONSTRAINT api_keys_resume_id_fkey 
    FOREIGN KEY (resume_id) 
    REFERENCES resumes(id) 
    ON DELETE CASCADE;