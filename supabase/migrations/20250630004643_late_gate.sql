/*
  # API Keys Management

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key` (text, unique) - The actual API key
      - `user_id` (uuid, foreign key to auth.users)
      - `resume_id` (uuid, foreign key to resumes)
      - `name` (text) - A friendly name for the key
      - `is_admin` (boolean) - Whether this key has admin privileges
      - `expires_at` (timestamptz) - When the key expires (null for no expiry)
      - `max_uses` (integer) - Maximum number of uses (null for unlimited)
      - `created_at` (timestamptz)
      - `first_used_at` (timestamptz) - When the key was first used
      - `last_used_at` (timestamptz) - When the key was last used
      - `use_count` (integer) - Number of times the key has been used
      - `unique_ips` (integer) - Number of unique IPs that have used the key
      - `notes` (text) - User notes about the key
      - `is_revoked` (boolean) - Whether the key has been revoked

  2. Security
    - Enable RLS on `api_keys` table
    - Add policies for users to manage their own API keys
*/

-- Create the api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_admin boolean DEFAULT false,
  expires_at timestamptz,
  max_uses integer,
  created_at timestamptz DEFAULT now(),
  first_used_at timestamptz,
  last_used_at timestamptz,
  use_count integer DEFAULT 0,
  unique_ips integer DEFAULT 0,
  notes text,
  is_revoked boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_resume_id_idx ON api_keys(resume_id);
CREATE INDEX IF NOT EXISTS api_keys_key_idx ON api_keys(key);
CREATE INDEX IF NOT EXISTS api_keys_is_revoked_idx ON api_keys(is_revoked);