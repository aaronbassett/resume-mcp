/*
  # Update API Keys Table for Hashed Storage

  1. Changes
    - Add `key_first_chars` column to store first 4 characters of the key
    - Add `key_last_chars` column to store last 4 characters of the key
    - Add `key_hash` column to store the hashed key
    - Update the `key` column to be nullable (for transition)
  
  2. Security
    - This allows us to store keys securely while still providing visual identification
*/

-- Add new columns for key parts and hash
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_first_chars text;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_last_chars text;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_hash text;

-- Make the original key column nullable for transition
ALTER TABLE api_keys ALTER COLUMN key DROP NOT NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);