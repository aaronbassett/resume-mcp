-- Create Base Tables Migration
-- This migration creates the essential tables if they don't exist
-- It also handles upgrading from the old schema to the new one

-- First, check if resumes table exists with old schema
DO $$ 
BEGIN
    -- Create resumes table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resumes') THEN
        CREATE TABLE resumes (
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
            allow_users_switch_template BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
    ELSE
        -- Table exists, add missing columns
        -- Add nanoid column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'nanoid') THEN
            ALTER TABLE resumes ADD COLUMN nanoid TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 10);
        END IF;
        
        -- Add role column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'role') THEN
            ALTER TABLE resumes ADD COLUMN role TEXT;
        END IF;
        
        -- Add display_name column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'display_name') THEN
            ALTER TABLE resumes ADD COLUMN display_name TEXT;
        END IF;
        
        -- Add tags column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'tags') THEN
            ALTER TABLE resumes ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
        
        -- Add is_public column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'is_public') THEN
            ALTER TABLE resumes ADD COLUMN is_public BOOLEAN DEFAULT false;
        END IF;
        
        -- Add publish_resume_page column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'publish_resume_page') THEN
            ALTER TABLE resumes ADD COLUMN publish_resume_page BOOLEAN DEFAULT false;
        END IF;
        
        -- Add presence_badge column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'presence_badge') THEN
            ALTER TABLE resumes ADD COLUMN presence_badge BOOLEAN DEFAULT false;
        END IF;
        
        -- Add theme column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'theme') THEN
            ALTER TABLE resumes ADD COLUMN theme TEXT;
        END IF;
        
        -- Add allow_users_switch_template column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'resumes' AND column_name = 'allow_users_switch_template') THEN
            ALTER TABLE resumes ADD COLUMN allow_users_switch_template BOOLEAN DEFAULT false;
        END IF;
        
        -- Handle user_id reference change from public.users to auth.users
        -- First check if the constraint exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'resumes' 
                   AND constraint_name = 'resumes_user_id_fkey') THEN
            -- Get the referenced table
            IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                      WHERE constraint_name = 'resumes_user_id_fkey' 
                      AND table_schema = 'public' 
                      AND table_name = 'users') THEN
                -- It references public.users, we need to drop and recreate
                ALTER TABLE resumes DROP CONSTRAINT resumes_user_id_fkey;
                ALTER TABLE resumes ADD CONSTRAINT resumes_user_id_fkey 
                    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- Create indexes for resumes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_slug ON resumes(slug);

-- Only create is_public index if the column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'resumes' AND column_name = 'is_public') THEN
        CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);
    END IF;
END $$;

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