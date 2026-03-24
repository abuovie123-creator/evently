-- Allow anyone to read planner profiles (needed for the public /planners page)
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on profiles (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow public (anon) SELECT access to planner profiles only
CREATE POLICY "Public can view planner profiles"
  ON public.profiles
  FOR SELECT
  USING (role = 'planner');

-- 3. (Optional) Keep existing policy for users reading their own profile
-- Only add this if you don't already have a self-read policy
-- CREATE POLICY "Users can read own profile"
--   ON public.profiles
--   FOR SELECT
--   USING (auth.uid() = id);
