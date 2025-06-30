# Resume Block System Database Migrations

This directory contains the database migrations for enhancing the resume block system to support 15 distinct block types with versioning and templates.

## Migration Files

### Forward Migrations (Apply in this order)

1. **`20240101_block_types_enhancement.sql`**
   - Creates the `block_types` table defining 15 block types
   - Enhances the existing `blocks` table with type references
   - Sets up validation schemas for each block type
   - Configures RLS policies

2. **`20240102_block_versions_table.sql`**
   - Creates the `block_versions` table for version history
   - Implements automatic version tracking via triggers
   - Provides functions for version management

3. **`20240103_block_templates_table.sql`**
   - Creates the `block_templates` table for reusable templates
   - Includes default templates for all block types
   - Tracks template usage statistics

4. **`20240104_resume_blocks_enhancement.sql`**
   - Enhances the existing `resume_blocks` junction table
   - Adds helper functions for block positioning
   - Improves performance with strategic indexes

### Rollback Scripts (Apply in reverse order)

Located in the `rollback/` subdirectory, these scripts safely revert each migration:
- `20240104_resume_blocks_enhancement_rollback.sql`
- `20240103_block_templates_table_rollback.sql`
- `20240102_block_versions_table_rollback.sql`
- `20240101_block_types_enhancement_rollback.sql`

## How to Apply Migrations

### Using Supabase CLI (Recommended)

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Or run a specific migration
supabase db push --include 20240101_block_types_enhancement.sql
```

### Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute each script

### Using psql

```bash
# Connect to your database
psql postgresql://[user]:[password]@[host]:[port]/[database]

# Run migrations
\i 20240101_block_types_enhancement.sql
\i 20240102_block_versions_table.sql
\i 20240103_block_templates_table.sql
\i 20240104_resume_blocks_enhancement.sql
```

## Verification

After applying migrations, verify the schema:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('block_types', 'blocks', 'block_versions', 'block_templates', 'resume_blocks')
ORDER BY table_name;

-- Verify block types are loaded
SELECT name, category, supports_multiple 
FROM block_types 
ORDER BY category, name;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'block%'
ORDER BY tablename, indexname;

-- Verify functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%block%';
```

## Block Types

The migrations create support for 15 block types across 4 categories:

### Personal Information
- `avatar` - Profile picture
- `contact` - Email, phone, website
- `address` - Physical/remote location
- `social_networks` - Social media profiles

### Professional Experience
- `experience` - Work history
- `volunteer` - Community service
- `project` - Professional/personal projects

### Qualifications
- `education` - Academic background
- `award` - Recognitions
- `certificate` - Professional certifications
- `publication` - Published works
- `skill` - Technical/professional skills

### Additional Information
- `natural_language` - Language proficiencies
- `interest` - Hobbies and interests
- `reference` - Professional references

## Key Features

- **Version Control**: Automatic tracking of all block changes
- **Templates**: Pre-built templates for quick block creation
- **Performance**: Strategic indexes for optimal query performance
- **Security**: Row Level Security (RLS) policies enforce access control
- **Flexibility**: JSONB storage allows schema evolution

## Troubleshooting

### Migration Fails

1. Check for existing objects:
   ```sql
   SELECT * FROM pg_tables WHERE tablename = 'block_types';
   ```

2. Verify user permissions:
   ```sql
   SELECT current_user, current_database();
   ```

3. Check for constraint violations:
   ```sql
   SELECT conname FROM pg_constraint WHERE conname LIKE '%block%';
   ```

### Rollback Issues

If a rollback fails:
1. Some objects may have been manually modified
2. Check for dependent objects before dropping
3. Use CASCADE carefully in production

## Development vs Production

- **Development**: Run migrations freely, test rollbacks
- **Production**: Always backup before migrations
- **Staging**: Test the complete migration suite first

## Related Documentation

- See `/docs/database-schema.md` for complete schema documentation
- Check `/src/types/database.ts` for TypeScript interfaces
- Review block implementations in `/src/blocks/`