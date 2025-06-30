-- Rollback script for Block Types Enhancement Migration

-- Drop policies
DROP POLICY IF EXISTS "Block types are viewable by all authenticated users" ON block_types;
DROP POLICY IF EXISTS "Block types can only be modified by service role" ON block_types;

-- Drop trigger
DROP TRIGGER IF EXISTS update_block_types_updated_at ON block_types;

-- Remove foreign key reference from blocks table
ALTER TABLE blocks DROP COLUMN IF EXISTS type_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_block_types_name;
DROP INDEX IF EXISTS idx_block_types_category;
DROP INDEX IF EXISTS idx_blocks_type_id;

-- Drop the block_types table
DROP TABLE IF EXISTS block_types CASCADE;

-- Note: This rollback will not remove the name column from blocks table
-- as it may contain user data. Handle manually if needed.