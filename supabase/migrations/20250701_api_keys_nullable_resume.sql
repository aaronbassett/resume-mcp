-- Migration: Allow admin API keys without resume_id
-- Admin keys should have system-wide access and not be tied to specific resumes

-- Only modify api_keys table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        -- Make resume_id nullable
        ALTER TABLE public.api_keys 
          ALTER COLUMN resume_id DROP NOT NULL;
    END IF;
END $$;

-- Update the foreign key constraint to ensure it still works with NULL values
-- (PostgreSQL handles NULL foreign keys correctly by default, so no change needed)

-- Only add index, constraint and policies if api_keys table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        -- Add a partial index for performance when looking up keys without resume_id
        CREATE INDEX IF NOT EXISTS idx_api_keys_admin 
          ON public.api_keys(user_id) 
          WHERE resume_id IS NULL;

        -- Add a check constraint to ensure admin keys don't have resume_id
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                       WHERE constraint_name = 'chk_admin_keys_no_resume') THEN
            ALTER TABLE public.api_keys ADD CONSTRAINT chk_admin_keys_no_resume
              CHECK (
                (permissions::jsonb ? 'admin' AND resume_id IS NULL) OR
                (NOT permissions::jsonb ? 'admin')
              );
        END IF;

        -- Add comment explaining the nullable resume_id
        COMMENT ON COLUMN public.api_keys.resume_id IS 'Resume ID this key is scoped to. NULL for admin keys with system-wide access.';
    END IF;
END $$;

-- Update RLS policies to handle admin keys properly
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        -- Drop existing policy
        DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.api_keys;

        -- Create separate policies for better clarity
        CREATE POLICY "Users can view their own API keys"
          ON public.api_keys FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own API keys"
          ON public.api_keys FOR INSERT
          TO authenticated
          WITH CHECK (
            auth.uid() = user_id AND
            -- Ensure non-admin keys have resume_id
            ((NOT permissions::jsonb ? 'admin' AND resume_id IS NOT NULL) OR
             (permissions::jsonb ? 'admin' AND resume_id IS NULL))
          );

        CREATE POLICY "Users can update their own API keys"
          ON public.api_keys FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (
            auth.uid() = user_id AND
            -- Ensure constraint is maintained on updates
            ((NOT permissions::jsonb ? 'admin' AND resume_id IS NOT NULL) OR
             (permissions::jsonb ? 'admin' AND resume_id IS NULL))
          );

        CREATE POLICY "Users can delete their own API keys"
          ON public.api_keys FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);

        -- Service role can do anything (for admin operations)
        CREATE POLICY "Service role has full access"
          ON public.api_keys
          TO service_role
          USING (true)
          WITH CHECK (true);
    END IF;
END $$;