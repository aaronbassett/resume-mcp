-- Create Base Tables Migration
-- This migration creates the essential tables if they don't exist

-- Create resumes table if it doesn't exist
CREATE TABLE IF NOT EXISTS resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nanoid TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    role TEXT,
    display_name TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    publish_resume_page BOOLEAN DEFAULT false,
    presence_badge BOOLEAN DEFAULT false,
    theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for resumes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_slug ON resumes(slug);
CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);

-- Create resume_blocks junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS resume_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
    block_id UUID NOT NULL, -- Will be linked to blocks table after it's created
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for resume_blocks
CREATE INDEX IF NOT EXISTS idx_resume_blocks_resume_id ON resume_blocks(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_blocks_block_id ON resume_blocks(block_id);

-- Enable RLS on tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "Users can view their own resumes" ON resumes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own resumes" ON resumes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own resumes" ON resumes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own resumes" ON resumes
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Public resumes are viewable by all" ON resumes
    FOR SELECT USING (is_public = true);

-- Update trigger for resumes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();