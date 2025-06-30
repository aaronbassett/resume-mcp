-- Rollback script for Block Templates Table Migration

-- Drop policies
DROP POLICY IF EXISTS "Public templates are viewable by all" ON block_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON block_templates;
DROP POLICY IF EXISTS "Users can create templates" ON block_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON block_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON block_templates;

-- Drop triggers
DROP TRIGGER IF EXISTS update_block_templates_updated_at ON block_templates;
DROP TRIGGER IF EXISTS validate_template_content_trigger ON block_templates;

-- Drop functions
DROP FUNCTION IF EXISTS validate_template_content() CASCADE;
DROP FUNCTION IF EXISTS increment_template_usage(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_block_from_template(UUID, TEXT) CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_block_templates_type_id;
DROP INDEX IF EXISTS idx_block_templates_user_id;
DROP INDEX IF EXISTS idx_block_templates_is_public;
DROP INDEX IF EXISTS idx_block_templates_is_featured;
DROP INDEX IF EXISTS idx_block_templates_tags;
DROP INDEX IF EXISTS idx_block_templates_unique_name;

-- Drop the block_templates table
DROP TABLE IF EXISTS block_templates CASCADE;