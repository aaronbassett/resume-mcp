-- Rollback script for Block Versions Table Migration

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own block versions" ON block_versions;
DROP POLICY IF EXISTS "System can create block versions" ON block_versions;
DROP POLICY IF EXISTS "Users can restore their own block versions" ON block_versions;

-- Drop trigger
DROP TRIGGER IF EXISTS track_block_versions ON blocks;

-- Drop functions
DROP FUNCTION IF EXISTS create_block_version_snapshot() CASCADE;
DROP FUNCTION IF EXISTS get_next_block_version_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS restore_block_version(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_block_version_history(UUID, INTEGER, INTEGER) CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_block_versions_block_id;
DROP INDEX IF EXISTS idx_block_versions_created_at;
DROP INDEX IF EXISTS idx_block_versions_block_version;

-- Drop the block_versions table
DROP TABLE IF EXISTS block_versions CASCADE;