-- Migration to switch from public.users to auth.users
-- This migration updates all foreign key references from public.users.id to auth.users.id

-- Step 1: Drop existing foreign key constraints
ALTER TABLE public.resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;
ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS blocks_user_id_fkey;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
ALTER TABLE public.injection_captures DROP CONSTRAINT IF EXISTS injection_captures_user_id_fkey;
ALTER TABLE public.injection_captures DROP CONSTRAINT IF EXISTS injection_captures_reviewed_by_fkey;

-- Step 2: Drop RLS policies that reference auth.uid() = id on public.users
DROP POLICY IF EXISTS "Users can view own user" ON public.users;
DROP POLICY IF EXISTS "Users can update own user" ON public.users;

-- Step 3: Add new foreign key constraints to auth.users
ALTER TABLE public.resumes 
  ADD CONSTRAINT resumes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.blocks 
  ADD CONSTRAINT blocks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.api_keys 
  ADD CONSTRAINT api_keys_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.injection_captures 
  ADD CONSTRAINT injection_captures_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.injection_captures 
  ADD CONSTRAINT injection_captures_reviewed_by_fkey 
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 4: Drop the trigger on public.users before dropping the table
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;

-- Step 5: Drop the public.users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 6: Update any functions that might reference public.users
-- (None found in the current migrations, but this is where you'd update them)

-- Step 7: Add comment explaining the change
COMMENT ON SCHEMA public IS 'Resume MCP Server - Uses Supabase Auth for user management. Stores resume data, API keys, and analytics';