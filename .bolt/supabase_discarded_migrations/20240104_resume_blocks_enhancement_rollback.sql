-- Rollback script for Resume Blocks Enhancement Migration

-- Drop policies
DROP POLICY IF EXISTS "Users can view resume blocks" ON resume_blocks;
DROP POLICY IF EXISTS "Users can manage their resume blocks" ON resume_blocks;

-- Drop functions
DROP FUNCTION IF EXISTS reorder_resume_blocks(UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS add_block_to_resume(UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS remove_block_from_resume(UUID, UUID) CASCADE;

-- Drop indexes (only the ones we created)
DROP INDEX IF EXISTS idx_resume_blocks_position;
DROP INDEX IF EXISTS idx_resume_blocks_resume_position;

-- Drop constraint
ALTER TABLE resume_blocks DROP CONSTRAINT IF EXISTS unique_resume_block_combination;

-- Note: We don't drop the table or existing columns/indexes as they may have existed before