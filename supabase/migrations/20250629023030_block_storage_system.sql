-- Enhanced Block-based Content Storage System
-- This migration enhances the block storage with versioning, types, and templates

-- Create block types table
CREATE TABLE IF NOT EXISTS public.block_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  schema JSONB NOT NULL, -- JSON Schema for validation
  icon TEXT, -- Icon identifier for UI
  category TEXT NOT NULL CHECK (category IN ('basic', 'professional', 'creative', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create block versions table for version history
CREATE TABLE IF NOT EXISTS public.block_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(block_id, version_number)
);

-- Create block metadata table for enhanced searchability
CREATE TABLE IF NOT EXISTS public.block_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  searchable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(block_id, key)
);

-- Create block templates table
CREATE TABLE IF NOT EXISTS public.block_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_type_id UUID NOT NULL REFERENCES public.block_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create block relationships table for dependencies
CREATE TABLE IF NOT EXISTS public.block_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  child_block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('depends_on', 'references', 'includes')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(parent_block_id, child_block_id, relationship_type)
);

-- Add columns to existing blocks table
ALTER TABLE public.blocks 
  ADD COLUMN IF NOT EXISTS block_type_id UUID REFERENCES public.block_types(id),
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_block_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.data::text, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector
CREATE TRIGGER update_blocks_search_vector
  BEFORE INSERT OR UPDATE ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_block_search_vector();

-- Create function to get block with metadata
CREATE OR REPLACE FUNCTION public.get_block_with_metadata(p_block_id UUID)
RETURNS TABLE(
  block_id UUID,
  user_id UUID,
  type TEXT,
  name TEXT,
  data JSONB,
  version INTEGER,
  is_draft BOOLEAN,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  metadata JSONB,
  version_history JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as block_id,
    b.user_id,
    b.type,
    b.name,
    b.data,
    b.version,
    b.is_draft,
    b.tags,
    b.created_at,
    b.updated_at,
    COALESCE(
      json_object_agg(bm.key, bm.value) FILTER (WHERE bm.key IS NOT NULL),
      '{}'::json
    )::jsonb as metadata,
    COALESCE(
      json_agg(
        json_build_object(
          'version', bv.version_number,
          'created_at', bv.created_at,
          'change_summary', bv.change_summary
        ) ORDER BY bv.version_number DESC
      ) FILTER (WHERE bv.version_number IS NOT NULL),
      '[]'::json
    )::jsonb as version_history
  FROM public.blocks b
  LEFT JOIN public.block_metadata bm ON b.id = bm.block_id
  LEFT JOIN public.block_versions bv ON b.id = bv.block_id
  WHERE b.id = p_block_id
  GROUP BY b.id, b.user_id, b.type, b.name, b.data, b.version, 
           b.is_draft, b.tags, b.created_at, b.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create block version
CREATE OR REPLACE FUNCTION public.create_block_version()
RETURNS TRIGGER AS $$
DECLARE
  v_next_version INTEGER;
BEGIN
  -- Only create version if data changed
  IF OLD.data IS DISTINCT FROM NEW.data THEN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM public.block_versions
    WHERE block_id = NEW.id;
    
    -- Insert version record
    INSERT INTO public.block_versions (block_id, version_number, data, created_by)
    VALUES (NEW.id, v_next_version, OLD.data, NEW.user_id);
    
    -- Update version number in blocks table
    NEW.version := v_next_version;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic versioning
CREATE TRIGGER create_block_version_trigger
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_block_version();

-- Create function to search blocks
CREATE OR REPLACE FUNCTION public.search_blocks(
  p_user_id UUID,
  p_query TEXT,
  p_types TEXT[] DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  type TEXT,
  name TEXT,
  data JSONB,
  tags TEXT[],
  rank REAL,
  snippet TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.type,
    b.name,
    b.data,
    b.tags,
    ts_rank(b.search_vector, websearch_to_tsquery('english', p_query)) as rank,
    ts_headline('english', 
      concat(b.name, ' ', b.data::text), 
      websearch_to_tsquery('english', p_query),
      'MaxWords=50, MinWords=10, ShortWord=3, HighlightAll=false'
    ) as snippet
  FROM public.blocks b
  WHERE b.user_id = p_user_id
    AND b.is_draft = false
    AND (p_query IS NULL OR b.search_vector @@ websearch_to_tsquery('english', p_query))
    AND (p_types IS NULL OR b.type = ANY(p_types))
    AND (p_tags IS NULL OR b.tags && p_tags)
  ORDER BY rank DESC, b.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_blocks_search_vector ON public.blocks USING gin(search_vector);
CREATE INDEX idx_blocks_type_id ON public.blocks(block_type_id);
CREATE INDEX idx_blocks_tags ON public.blocks USING gin(tags);
CREATE INDEX idx_blocks_draft ON public.blocks(is_draft) WHERE is_draft = false;
CREATE INDEX idx_block_versions_block_id ON public.block_versions(block_id);
CREATE INDEX idx_block_metadata_block_id ON public.block_metadata(block_id);
CREATE INDEX idx_block_metadata_searchable ON public.block_metadata(key, value) WHERE searchable = true;
CREATE INDEX idx_block_templates_type ON public.block_templates(block_type_id);
CREATE INDEX idx_block_templates_public ON public.block_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_block_templates_tags ON public.block_templates USING gin(tags);

-- Add triggers for updated_at
CREATE TRIGGER handle_block_types_updated_at BEFORE UPDATE ON public.block_types
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_block_templates_updated_at BEFORE UPDATE ON public.block_templates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.block_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_relationships ENABLE ROW LEVEL SECURITY;

-- RLS policies for block types (read-only for all authenticated users)
CREATE POLICY "Anyone can view block types" ON public.block_types
  FOR SELECT USING (is_active = true);

-- RLS policies for block versions
CREATE POLICY "Users can view own block versions" ON public.block_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blocks 
      WHERE blocks.id = block_versions.block_id 
      AND blocks.user_id = auth.uid()
    )
  );

-- RLS policies for block metadata
CREATE POLICY "Users can view own block metadata" ON public.block_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blocks 
      WHERE blocks.id = block_metadata.block_id 
      AND blocks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own block metadata" ON public.block_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.blocks 
      WHERE blocks.id = block_metadata.block_id 
      AND blocks.user_id = auth.uid()
    )
  );

-- RLS policies for block templates
CREATE POLICY "Anyone can view public templates" ON public.block_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.block_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates" ON public.block_templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own templates" ON public.block_templates
  FOR DELETE USING (created_by = auth.uid());

-- RLS policies for block relationships
CREATE POLICY "Users can view own block relationships" ON public.block_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blocks 
      WHERE blocks.id IN (block_relationships.parent_block_id, block_relationships.child_block_id)
      AND blocks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own block relationships" ON public.block_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.blocks 
      WHERE blocks.id = block_relationships.parent_block_id
      AND blocks.user_id = auth.uid()
    )
  );

-- Insert default block types
INSERT INTO public.block_types (name, description, category, schema) VALUES
  ('profile', 'Basic profile information', 'basic', 
   '{"type": "object", "properties": {"name": {"type": "string"}, "title": {"type": "string"}, "summary": {"type": "string"}, "location": {"type": "object"}}, "required": ["name", "title"]}'::jsonb),
  
  ('contact', 'Contact information', 'basic',
   '{"type": "object", "properties": {"email": {"type": "string", "format": "email"}, "phone": {"type": "string"}, "linkedin": {"type": "string", "format": "uri"}, "github": {"type": "string", "format": "uri"}}, "required": ["email"]}'::jsonb),
  
  ('experience', 'Work experience', 'professional',
   '{"type": "object", "properties": {"company": {"type": "string"}, "position": {"type": "string"}, "startDate": {"type": "string", "format": "date"}, "endDate": {"type": ["string", "null"], "format": "date"}, "summary": {"type": "string"}, "highlights": {"type": "array", "items": {"type": "string"}}}, "required": ["company", "position", "startDate"]}'::jsonb),
  
  ('skill', 'Skills and competencies', 'professional',
   '{"type": "object", "properties": {"category": {"type": "string"}, "skills": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "level": {"type": "string", "enum": ["beginner", "intermediate", "advanced", "expert"]}}}}}, "required": ["category", "skills"]}'::jsonb),
  
  ('project', 'Portfolio projects', 'professional',
   '{"type": "object", "properties": {"name": {"type": "string"}, "description": {"type": "string"}, "url": {"type": "string", "format": "uri"}, "technologies": {"type": "array", "items": {"type": "string"}}, "featured": {"type": "boolean"}}, "required": ["name", "description"]}'::jsonb),
  
  ('education', 'Educational background', 'professional',
   '{"type": "object", "properties": {"institution": {"type": "string"}, "degree": {"type": "string"}, "field": {"type": "string"}, "startDate": {"type": "string", "format": "date"}, "endDate": {"type": "string", "format": "date"}, "gpa": {"type": "number"}}, "required": ["institution", "degree", "field"]}'::jsonb),
  
  ('certification', 'Professional certifications', 'professional',
   '{"type": "object", "properties": {"name": {"type": "string"}, "issuer": {"type": "string"}, "issueDate": {"type": "string", "format": "date"}, "expiryDate": {"type": ["string", "null"], "format": "date"}, "credentialId": {"type": "string"}}, "required": ["name", "issuer", "issueDate"]}'::jsonb);

-- Add comments
COMMENT ON TABLE public.block_types IS 'Defines available block types with JSON schema validation';
COMMENT ON TABLE public.block_versions IS 'Version history for content blocks';
COMMENT ON TABLE public.block_metadata IS 'Searchable metadata for blocks';
COMMENT ON TABLE public.block_templates IS 'Reusable templates for blocks';
COMMENT ON TABLE public.block_relationships IS 'Dependencies between blocks';
COMMENT ON FUNCTION public.get_block_with_metadata IS 'Retrieves a block with all metadata and version history';
COMMENT ON FUNCTION public.search_blocks IS 'Full-text search across blocks with filtering';