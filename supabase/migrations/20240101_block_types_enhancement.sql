-- Block Types Enhancement Migration
-- This migration enhances the existing block system to support 15 specific block types
-- with proper validation and versioning support

-- 1. Create block_types table to define available block types and their schemas
CREATE TABLE IF NOT EXISTS block_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('personal', 'professional', 'qualifications', 'additional')),
    schema JSONB NOT NULL,
    icon TEXT,
    description TEXT,
    supports_multiple BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups
CREATE INDEX idx_block_types_name ON block_types(name);
CREATE INDEX idx_block_types_category ON block_types(category);

-- 2. Enhance the existing blocks table if needed
-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocks' AND column_name = 'name') THEN
        ALTER TABLE blocks ADD COLUMN name TEXT;
    END IF;
    
    -- Add type_id column to reference block_types
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocks' AND column_name = 'type_id') THEN
        ALTER TABLE blocks ADD COLUMN type_id UUID REFERENCES block_types(id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blocks_type_id ON blocks(type_id);
CREATE INDEX IF NOT EXISTS idx_blocks_user_id ON blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_type ON blocks(type);
CREATE INDEX IF NOT EXISTS idx_blocks_visibility ON blocks(visibility);

-- 3. Insert the 15 block types with their schemas
INSERT INTO block_types (name, display_name, category, schema, icon, description, supports_multiple) VALUES
-- Personal Information
('avatar', 'Avatar', 'personal', 
 '{"type": "object", "properties": {"imageUrl": {"type": "string"}, "altText": {"type": "string"}}}',
 'User', 'Profile picture or avatar', false),

('contact', 'Contact', 'personal',
 '{"type": "object", "properties": {"email": {"type": "string", "format": "email"}, "phone": {"type": "string"}, "website": {"type": "string", "format": "uri"}}}',
 'Mail', 'Contact information', false),

('address', 'Address', 'personal',
 '{"type": "object", "properties": {"street": {"type": "string"}, "city": {"type": "string"}, "state": {"type": "string"}, "country": {"type": "string"}, "postalCode": {"type": "string"}, "isRemote": {"type": "boolean"}}}',
 'MapPin', 'Physical or remote location', false),

('social_networks', 'Social Networks', 'personal',
 '{"type": "object", "properties": {"networks": {"type": "array", "items": {"type": "object", "properties": {"platform": {"type": "string"}, "url": {"type": "string", "format": "uri"}, "username": {"type": "string"}}, "required": ["platform", "url"]}}}}',
 'Share2', 'Social media profiles', false),

-- Professional Experience
('experience', 'Experience', 'professional',
 '{"type": "object", "properties": {"company": {"type": "string"}, "position": {"type": "string"}, "location": {"type": "string"}, "startDate": {"type": "string", "format": "date"}, "endDate": {"type": "string", "format": "date"}, "current": {"type": "boolean"}, "description": {"type": "string"}, "highlights": {"type": "array", "items": {"type": "string"}}}, "required": ["company", "position", "startDate"]}',
 'Briefcase', 'Work experience', true),

('volunteer', 'Volunteer', 'professional',
 '{"type": "object", "properties": {"organization": {"type": "string"}, "position": {"type": "string"}, "location": {"type": "string"}, "startDate": {"type": "string", "format": "date"}, "endDate": {"type": "string", "format": "date"}, "current": {"type": "boolean"}, "description": {"type": "string"}, "highlights": {"type": "array", "items": {"type": "string"}}}, "required": ["organization", "position", "startDate"]}',
 'Heart', 'Volunteer work and community service', true),

('project', 'Project', 'professional',
 '{"type": "object", "properties": {"name": {"type": "string"}, "description": {"type": "string"}, "url": {"type": "string", "format": "uri"}, "startDate": {"type": "string", "format": "date"}, "endDate": {"type": "string", "format": "date"}, "technologies": {"type": "array", "items": {"type": "string"}}, "highlights": {"type": "array", "items": {"type": "string"}}}, "required": ["name", "description"]}',
 'Folder', 'Professional or personal projects', true),

-- Qualifications
('education', 'Education', 'qualifications',
 '{"type": "object", "properties": {"institution": {"type": "string"}, "degree": {"type": "string"}, "field": {"type": "string"}, "location": {"type": "string"}, "graduationDate": {"type": "string", "format": "date"}, "gpa": {"type": "string"}, "honors": {"type": "array", "items": {"type": "string"}}, "coursework": {"type": "array", "items": {"type": "string"}}}, "required": ["institution", "degree", "graduationDate"]}',
 'GraduationCap', 'Educational background', true),

('award', 'Award', 'qualifications',
 '{"type": "object", "properties": {"title": {"type": "string"}, "awarder": {"type": "string"}, "date": {"type": "string", "format": "date"}, "description": {"type": "string"}}, "required": ["title", "awarder", "date"]}',
 'Award', 'Awards and recognitions', true),

('certificate', 'Certificate', 'qualifications',
 '{"type": "object", "properties": {"name": {"type": "string"}, "authority": {"type": "string"}, "licenseNumber": {"type": "string"}, "issuedAt": {"type": "string", "format": "date"}, "expiresAt": {"type": "string", "format": "date"}, "url": {"type": "string", "format": "uri"}}, "required": ["name", "authority", "issuedAt"]}',
 'Certificate', 'Professional certifications', true),

('publication', 'Publication', 'qualifications',
 '{"type": "object", "properties": {"title": {"type": "string"}, "publisher": {"type": "string"}, "publicationDate": {"type": "string", "format": "date"}, "url": {"type": "string", "format": "uri"}, "authors": {"type": "array", "items": {"type": "string"}}, "description": {"type": "string"}}, "required": ["title", "publisher", "publicationDate"]}',
 'BookOpen', 'Published works and articles', true),

('skill', 'Skill', 'qualifications',
 '{"type": "object", "properties": {"name": {"type": "string"}, "category": {"type": "string"}, "proficiency": {"type": "string", "enum": ["beginner", "intermediate", "advanced", "expert"]}, "yearsOfExperience": {"type": "number"}}, "required": ["name", "category"]}',
 'Zap', 'Technical and professional skills', true),

-- Additional Information
('natural_language', 'Natural Language', 'additional',
 '{"type": "object", "properties": {"language": {"type": "string"}, "fluency": {"type": "string", "enum": ["elementary", "conversational", "professional", "native"]}}, "required": ["language", "fluency"]}',
 'Globe', 'Language proficiencies', true),

('interest', 'Interest', 'additional',
 '{"type": "object", "properties": {"interests": {"type": "array", "items": {"type": "string"}}}, "required": ["interests"]}',
 'Star', 'Personal interests and hobbies', true),

('reference', 'Reference', 'additional',
 '{"type": "object", "properties": {"name": {"type": "string"}, "title": {"type": "string"}, "company": {"type": "string"}, "email": {"type": "string", "format": "email"}, "phone": {"type": "string"}, "relationship": {"type": "string"}}, "required": ["name", "title", "company"]}',
 'Users', 'Professional references', true)
ON CONFLICT (name) DO NOTHING;

-- 4. Update existing blocks to link with block_types
UPDATE blocks b
SET type_id = bt.id
FROM block_types bt
WHERE b.type = bt.name
AND b.type_id IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE block_types ENABLE ROW LEVEL SECURITY;

-- Block types are read-only for all authenticated users
CREATE POLICY "Block types are viewable by all authenticated users" ON block_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify block types
CREATE POLICY "Block types can only be modified by service role" ON block_types
    FOR ALL USING (auth.role() = 'service_role');

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_block_types_updated_at BEFORE UPDATE ON block_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE block_types IS 'Defines available block types and their validation schemas for the resume editor';
COMMENT ON COLUMN block_types.name IS 'Unique identifier name for the block type (e.g., avatar, contact)';
COMMENT ON COLUMN block_types.display_name IS 'Human-readable name for UI display';
COMMENT ON COLUMN block_types.category IS 'Categorization for grouping block types in the UI';
COMMENT ON COLUMN block_types.schema IS 'JSON Schema for validating block data';
COMMENT ON COLUMN block_types.supports_multiple IS 'Whether multiple instances of this block type are allowed';