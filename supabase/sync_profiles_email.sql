-- ==============================================================================
-- SYNC USER EMAILS & AUTO-POPULATE PROFILES TRIGGER
-- ==============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor.
-- 
-- WHAT THIS DOES:
-- 1. Adds 'email' and 'username' columns to public.profiles if they don't already exist.
-- 2. Backfills public.profiles.email with the actual email from auth.users for existing accounts.
-- 3. Backfills usernames if missing (from full_name or email prefix).
-- 4. Creates an automatic trigger so every new user signup immediately populates
--    their email, username, and role into public.profiles.
-- ==============================================================================

-- 1. Ensure required columns exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Backfill missing emails from auth.users into profiles
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE auth.users.id = public.profiles.id
  AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- 3. Backfill any missing usernames
UPDATE public.profiles
SET username = LOWER(REPLACE(COALESCE(full_name, split_part(email, '@', 1)), ' ', '_'))
WHERE username IS NULL;

-- 4. Create or replace a function to keep profiles in sync on new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS 
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), ' ', '_'))
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    'approved'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    username = COALESCE(public.profiles.username, EXCLUDED.username);
  RETURN NEW;
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_sync_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
