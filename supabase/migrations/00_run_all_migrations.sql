-- Master Migration Script for Resume Block System
-- Run this script to apply all block system enhancements
-- 
-- Migrations will be applied in order:
-- 1. Block Types Enhancement (20240101)
-- 2. Block Versions Table (20240102)
-- 3. Block Templates Table (20240103)
-- 4. Resume Blocks Enhancement (20240104)

-- Note: Supabase will automatically run these migrations in order
-- based on their timestamp prefixes when you deploy.

-- To apply manually in order:
-- 1. Run 20240101_block_types_enhancement.sql
-- 2. Run 20240102_block_versions_table.sql
-- 3. Run 20240103_block_templates_table.sql
-- 4. Run 20240104_resume_blocks_enhancement.sql

-- To rollback (in reverse order):
-- 1. Run rollback/20240104_resume_blocks_enhancement_rollback.sql
-- 2. Run rollback/20240103_block_templates_table_rollback.sql
-- 3. Run rollback/20240102_block_versions_table_rollback.sql
-- 4. Run rollback/20240101_block_types_enhancement_rollback.sql