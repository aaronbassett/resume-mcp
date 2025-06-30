-- Resume Blocks Enhancement Migration
-- This migration enhances the existing resume_blocks junction table

-- Ensure the resume_blocks table has all necessary columns
DO $$ 
BEGIN
    -- Add id column if it doesn't exist (some junction tables don't have PKs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'resume_blocks' AND column_name = 'id') THEN
        ALTER TABLE resume_blocks ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'resume_blocks' AND column_name = 'created_at') THEN
        ALTER TABLE resume_blocks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
    END IF;
END $$;

-- Ensure unique constraint exists on (resume_id, block_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_resume_block_combination'
    ) THEN
        ALTER TABLE resume_blocks 
        ADD CONSTRAINT unique_resume_block_combination 
        UNIQUE(resume_id, block_id);
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_resume_blocks_resume_id ON resume_blocks(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_blocks_block_id ON resume_blocks(block_id);
CREATE INDEX IF NOT EXISTS idx_resume_blocks_position ON resume_blocks(position);

-- Create composite index for efficient ordering within a resume
CREATE INDEX IF NOT EXISTS idx_resume_blocks_resume_position ON resume_blocks(resume_id, position);

-- Function to reorder blocks within a resume
CREATE OR REPLACE FUNCTION reorder_resume_blocks(
    p_resume_id UUID,
    p_block_positions JSONB -- Array of {block_id, position} objects
)
RETURNS VOID AS $$
DECLARE
    v_item JSONB;
    v_block_id UUID;
    v_position INTEGER;
BEGIN
    -- Validate that all blocks belong to the user
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(p_block_positions) AS item
        LEFT JOIN blocks b ON (item->>'block_id')::uuid = b.id
        WHERE b.user_id != auth.uid() OR b.id IS NULL
    ) THEN
        RAISE EXCEPTION 'Invalid block ID or access denied';
    END IF;
    
    -- Update positions
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_block_positions)
    LOOP
        v_block_id := (v_item->>'block_id')::uuid;
        v_position := (v_item->>'position')::integer;
        
        UPDATE resume_blocks
        SET position = v_position
        WHERE resume_id = p_resume_id
        AND block_id = v_block_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add block to resume with automatic positioning
CREATE OR REPLACE FUNCTION add_block_to_resume(
    p_resume_id UUID,
    p_block_id UUID,
    p_position INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_max_position INTEGER;
    v_final_position INTEGER;
    v_new_id UUID;
BEGIN
    -- Verify resume ownership
    IF NOT EXISTS (
        SELECT 1 FROM resumes 
        WHERE id = p_resume_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Resume not found or access denied';
    END IF;
    
    -- Verify block ownership
    IF NOT EXISTS (
        SELECT 1 FROM blocks 
        WHERE id = p_block_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Block not found or access denied';
    END IF;
    
    -- Get max position if not provided
    IF p_position IS NULL THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_max_position
        FROM resume_blocks
        WHERE resume_id = p_resume_id;
        v_final_position := v_max_position;
    ELSE
        v_final_position := p_position;
        -- Shift existing blocks if inserting in middle
        UPDATE resume_blocks
        SET position = position + 1
        WHERE resume_id = p_resume_id
        AND position >= p_position;
    END IF;
    
    -- Insert the new association
    INSERT INTO resume_blocks (resume_id, block_id, position)
    VALUES (p_resume_id, p_block_id, v_final_position)
    RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove block from resume and reorder
CREATE OR REPLACE FUNCTION remove_block_from_resume(
    p_resume_id UUID,
    p_block_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_position INTEGER;
BEGIN
    -- Get current position
    SELECT position INTO v_position
    FROM resume_blocks
    WHERE resume_id = p_resume_id AND block_id = p_block_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Block not found in resume';
    END IF;
    
    -- Delete the association
    DELETE FROM resume_blocks
    WHERE resume_id = p_resume_id AND block_id = p_block_id;
    
    -- Reorder remaining blocks
    UPDATE resume_blocks
    SET position = position - 1
    WHERE resume_id = p_resume_id
    AND position > v_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security if not already enabled
ALTER TABLE resume_blocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view resume blocks for their resumes" ON resume_blocks;
DROP POLICY IF EXISTS "Users can manage resume blocks for their resumes" ON resume_blocks;

-- RLS Policies
-- Users can view resume blocks for their own resumes or public resumes
CREATE POLICY "Users can view resume blocks" ON resume_blocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resumes 
            WHERE resumes.id = resume_blocks.resume_id 
            AND (resumes.user_id = auth.uid() OR resumes.is_public = true)
        )
    );

-- Users can insert/update/delete resume blocks for their own resumes
CREATE POLICY "Users can manage their resume blocks" ON resume_blocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM resumes 
            WHERE resumes.id = resume_blocks.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

-- Add helpful comments
COMMENT ON TABLE resume_blocks IS 'Junction table connecting resumes to blocks with positioning';
COMMENT ON COLUMN resume_blocks.position IS 'Display order of block within the resume (1-based)';
COMMENT ON FUNCTION reorder_resume_blocks IS 'Batch update block positions within a resume';
COMMENT ON FUNCTION add_block_to_resume IS 'Add a block to a resume with automatic position management';
COMMENT ON FUNCTION remove_block_from_resume IS 'Remove a block from a resume and reorder remaining blocks';