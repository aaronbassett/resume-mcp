/*
  # Create resumes table

  1. New Tables
    - `resumes`
      - `id` (uuid, primary key)
      - `nanoid` (text, unique) - URL-friendly unique identifier
      - `user_id` (uuid, foreign key to auth.users)
      - `slug` (text) - URL-friendly slug generated from title
      - `title` (text) - Resume title
      - `role` (text) - Job role/position
      - `display_name` (text) - Display name for the resume
      - `tags` (jsonb) - Array of tag objects
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `resumes` table
    - Add policies for users to manage their own resumes only
*/

-- Create the resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nanoid text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug text NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Resume',
  role text DEFAULT '',
  display_name text DEFAULT '',
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_nanoid_idx ON resumes(nanoid);
CREATE INDEX IF NOT EXISTS resumes_slug_idx ON resumes(slug);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();