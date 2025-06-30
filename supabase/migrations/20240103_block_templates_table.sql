-- Block Templates Table Migration
-- This migration creates the block_templates table for reusable block templates

-- Create block_templates table
CREATE TABLE IF NOT EXISTS block_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_id UUID NOT NULL REFERENCES block_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_block_templates_type_id ON block_templates(type_id);
CREATE INDEX idx_block_templates_user_id ON block_templates(user_id);
CREATE INDEX idx_block_templates_is_public ON block_templates(is_public);
CREATE INDEX idx_block_templates_is_featured ON block_templates(is_featured);
CREATE INDEX idx_block_templates_tags ON block_templates USING GIN(tags);

-- Ensure template names are unique per type and user/public
CREATE UNIQUE INDEX idx_block_templates_unique_name 
    ON block_templates(type_id, name, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Function to validate template content against block type schema
CREATE OR REPLACE FUNCTION validate_template_content()
RETURNS TRIGGER AS $$
DECLARE
    v_schema JSONB;
    v_is_valid BOOLEAN;
BEGIN
    -- Get the schema for this block type
    SELECT schema INTO v_schema
    FROM block_types
    WHERE id = NEW.type_id;
    
    -- For now, we'll do basic validation
    -- In production, you'd use a proper JSON Schema validator
    IF v_schema IS NULL THEN
        RAISE EXCEPTION 'Invalid block type';
    END IF;
    
    -- Basic check: ensure content is not empty
    IF NEW.content IS NULL OR NEW.content = '{}'::jsonb THEN
        RAISE EXCEPTION 'Template content cannot be empty';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_template_content_trigger
    BEFORE INSERT OR UPDATE ON block_templates
    FOR EACH ROW
    EXECUTE FUNCTION validate_template_content();

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE block_templates
    SET usage_count = usage_count + 1
    WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create block from template
CREATE OR REPLACE FUNCTION create_block_from_template(
    p_template_id UUID,
    p_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_template RECORD;
    v_new_block_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Get template data
    SELECT t.*, bt.name as type_name
    INTO v_template
    FROM block_templates t
    JOIN block_types bt ON t.type_id = bt.id
    WHERE t.id = p_template_id
    AND (t.is_public = true OR t.user_id = v_user_id);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found or access denied';
    END IF;
    
    -- Create new block from template
    INSERT INTO blocks (
        type,
        type_id,
        name,
        data,
        metadata,
        user_id,
        created_at,
        updated_at
    ) VALUES (
        v_template.type_name,
        v_template.type_id,
        COALESCE(p_name, v_template.name),
        v_template.content,
        jsonb_build_object('created_from_template', v_template.id),
        v_user_id,
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW())
    ) RETURNING id INTO v_new_block_id;
    
    -- Increment usage count
    PERFORM increment_template_usage(p_template_id);
    
    RETURN v_new_block_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default templates for each block type
INSERT INTO block_templates (type_id, name, description, content, tags, is_public, is_featured, user_id)
SELECT 
    bt.id,
    'Default ' || bt.display_name,
    'Standard template for ' || bt.display_name || ' block',
    CASE bt.name
        WHEN 'avatar' THEN '{"imageUrl": "", "altText": "Profile picture"}'::jsonb
        WHEN 'contact' THEN '{"email": "", "phone": "", "website": ""}'::jsonb
        WHEN 'address' THEN '{"city": "", "state": "", "country": "", "isRemote": false}'::jsonb
        WHEN 'social_networks' THEN '{"networks": []}'::jsonb
        WHEN 'experience' THEN '{"company": "", "position": "", "startDate": "", "description": "", "highlights": []}'::jsonb
        WHEN 'volunteer' THEN '{"organization": "", "position": "", "startDate": "", "description": "", "highlights": []}'::jsonb
        WHEN 'education' THEN '{"institution": "", "degree": "", "field": "", "graduationDate": ""}'::jsonb
        WHEN 'award' THEN '{"title": "", "awarder": "", "date": "", "description": ""}'::jsonb
        WHEN 'certificate' THEN '{"name": "", "authority": "", "issuedAt": ""}'::jsonb
        WHEN 'publication' THEN '{"title": "", "publisher": "", "publicationDate": "", "authors": []}'::jsonb
        WHEN 'skill' THEN '{"name": "", "category": "", "proficiency": "intermediate"}'::jsonb
        WHEN 'natural_language' THEN '{"language": "", "fluency": "professional"}'::jsonb
        WHEN 'interest' THEN '{"interests": []}'::jsonb
        WHEN 'reference' THEN '{"name": "", "title": "", "company": "", "email": ""}'::jsonb
        WHEN 'project' THEN '{"name": "", "description": "", "technologies": [], "highlights": []}'::jsonb
        ELSE '{}'::jsonb
    END,
    ARRAY['default', 'starter'],
    true,  -- is_public
    true,  -- is_featured
    NULL   -- system template
FROM block_types bt
ON CONFLICT DO NOTHING;

-- Professional templates
INSERT INTO block_templates (type_id, name, description, content, tags, is_public, is_featured)
VALUES
-- Software Engineer Experience Template
(
    (SELECT id FROM block_types WHERE name = 'experience'),
    'Software Engineer Template',
    'Template for software engineering positions',
    '{
        "company": "Tech Company",
        "position": "Software Engineer",
        "location": "San Francisco, CA",
        "startDate": "2022-01-01",
        "current": true,
        "description": "Developing scalable web applications",
        "highlights": [
            "Led development of microservices architecture",
            "Improved API response time by 40%",
            "Mentored junior developers"
        ]
    }'::jsonb,
    ARRAY['professional', 'tech', 'engineering'],
    true,
    true
),
-- MBA Education Template
(
    (SELECT id FROM block_types WHERE name = 'education'),
    'MBA Template',
    'Template for MBA education',
    '{
        "institution": "Business School",
        "degree": "Master of Business Administration",
        "field": "Finance",
        "location": "New York, NY",
        "graduationDate": "2020-05-15",
        "gpa": "3.8/4.0",
        "honors": ["Dean''s List", "Beta Gamma Sigma"],
        "coursework": ["Corporate Finance", "Strategic Management", "Data Analytics"]
    }'::jsonb,
    ARRAY['professional', 'business', 'graduate'],
    true,
    true
);

-- Enable Row Level Security
ALTER TABLE block_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view public templates
CREATE POLICY "Public templates are viewable by all" ON block_templates
    FOR SELECT USING (is_public = true);

-- Users can view their own private templates
CREATE POLICY "Users can view their own templates" ON block_templates
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own templates
CREATE POLICY "Users can create templates" ON block_templates
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update their own templates" ON block_templates
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates" ON block_templates
    FOR DELETE USING (user_id = auth.uid());

-- Update trigger
CREATE TRIGGER update_block_templates_updated_at BEFORE UPDATE ON block_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE block_templates IS 'Reusable templates for different block types';
COMMENT ON COLUMN block_templates.is_public IS 'Whether this template is available to all users';
COMMENT ON COLUMN block_templates.is_featured IS 'Whether this template should be highlighted in the UI';
COMMENT ON COLUMN block_templates.usage_count IS 'Number of times this template has been used';
COMMENT ON FUNCTION create_block_from_template IS 'Create a new block instance from a template';