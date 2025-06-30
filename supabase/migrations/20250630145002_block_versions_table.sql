-- Block Versions Table Migration
-- This migration creates the block_versions table for tracking historical versions of blocks

-- Create block_versions table
CREATE TABLE IF NOT EXISTS block_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB,
    changed_by UUID REFERENCES auth.users(id),
    change_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_block_versions_block_id ON block_versions(block_id);
CREATE INDEX IF NOT EXISTS idx_block_versions_created_at ON block_versions(created_at DESC);

-- Create unique constraint for version numbers per block
CREATE UNIQUE INDEX IF NOT EXISTS idx_block_versions_block_version ON block_versions(block_id, version_number);

-- Function to get the next version number for a block
CREATE OR REPLACE FUNCTION get_next_block_version_number(p_block_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(version_number) + 1 
         FROM block_versions 
         WHERE block_id = p_block_id),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create a version snapshot
CREATE OR REPLACE FUNCTION create_block_version_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    v_version_number INTEGER;
    v_user_id UUID;
BEGIN
    -- Only create version on UPDATE, not INSERT
    IF TG_OP = 'UPDATE' THEN
        -- Skip if only updated_at changed
        IF OLD.data IS DISTINCT FROM NEW.data OR 
           OLD.metadata IS DISTINCT FROM NEW.metadata THEN
            
            -- Get current user ID
            v_user_id := auth.uid();
            
            -- Get next version number
            v_version_number := get_next_block_version_number(NEW.id);
            
            -- Create version record with OLD data
            INSERT INTO block_versions (
                block_id, 
                version_number, 
                data, 
                metadata, 
                changed_by,
                change_description
            ) VALUES (
                NEW.id,
                v_version_number,
                OLD.data,
                OLD.metadata,
                v_user_id,
                CASE 
                    WHEN OLD.data IS DISTINCT FROM NEW.data AND OLD.metadata IS DISTINCT FROM NEW.metadata 
                    THEN 'Data and metadata updated'
                    WHEN OLD.data IS DISTINCT FROM NEW.data 
                    THEN 'Data updated'
                    WHEN OLD.metadata IS DISTINCT FROM NEW.metadata 
                    THEN 'Metadata updated'
                    ELSE 'Content updated'
                END
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track versions
DROP TRIGGER IF EXISTS track_block_versions ON blocks;
CREATE TRIGGER track_block_versions
    BEFORE UPDATE ON blocks
    FOR EACH ROW
    EXECUTE FUNCTION create_block_version_snapshot();

-- Function to restore a block to a specific version
CREATE OR REPLACE FUNCTION restore_block_version(
    p_block_id UUID,
    p_version_number INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_version_data RECORD;
BEGIN
    -- Get the version data
    SELECT data, metadata 
    INTO v_version_data
    FROM block_versions
    WHERE block_id = p_block_id 
    AND version_number = p_version_number;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Version % not found for block %', p_version_number, p_block_id;
    END IF;
    
    -- Update the block with version data
    UPDATE blocks
    SET data = v_version_data.data,
        metadata = v_version_data.metadata,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = p_block_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get version history for a block
CREATE OR REPLACE FUNCTION get_block_version_history(
    p_block_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    version_number INTEGER,
    changed_by UUID,
    change_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bv.version_number,
        bv.changed_by,
        bv.change_description,
        bv.created_at,
        u.email as user_email
    FROM block_versions bv
    LEFT JOIN auth.users u ON bv.changed_by = u.id
    WHERE bv.block_id = p_block_id
    ORDER BY bv.version_number DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE block_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view version history for their own blocks
CREATE POLICY "Users can view their own block versions" ON block_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM blocks 
            WHERE blocks.id = block_versions.block_id 
            AND blocks.user_id = auth.uid()
        )
    );

-- Users can create versions for their own blocks (through trigger)
CREATE POLICY "System can create block versions" ON block_versions
    FOR INSERT WITH CHECK (true);

-- Only block owners can restore versions
CREATE POLICY "Users can restore their own block versions" ON block_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM blocks 
            WHERE blocks.id = block_versions.block_id 
            AND blocks.user_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE block_versions IS 'Tracks historical versions of block content for version control and rollback';
COMMENT ON COLUMN block_versions.version_number IS 'Sequential version number for each block';
COMMENT ON COLUMN block_versions.data IS 'Snapshot of block data at this version';
COMMENT ON COLUMN block_versions.changed_by IS 'User who made the change';
COMMENT ON COLUMN block_versions.change_description IS 'Auto-generated description of what changed';
COMMENT ON FUNCTION restore_block_version IS 'Restore a block to a specific historical version';
COMMENT ON FUNCTION get_block_version_history IS 'Get paginated version history for a block';