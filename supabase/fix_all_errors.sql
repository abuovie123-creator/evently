-- CONSOLIDATED FIX FOR DASHBOARD & PROFILE ERRORS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. FIX PROFILES TABLE (Add missing username column)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 0.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_events INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS satisfied_clients INTEGER DEFAULT 0;

-- 2. POPULATE USERNAMES (Fallback to ID if full_name is missing)
UPDATE public.profiles 
SET username = COALESCE(LOWER(REPLACE(full_name, ' ', '_')), substring(id::text, 1, 8))
WHERE username IS NULL;

-- 3. RESET & FIX RLS POLICIES

-- Profiles: Public read access for everyone
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public can view planner profiles" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

-- Events: Public read access for everyone
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
CREATE POLICY "Allow public read events" 
  ON public.events FOR SELECT USING (true);

-- Album Media: Public read access for everyone
DROP POLICY IF EXISTS "Allow public read album_media" ON public.album_media;
CREATE POLICY "Allow public read album_media" 
  ON public.album_media FOR SELECT USING (true);

-- 4. ENSURE STORAGE PERMISSIONS (If using Supabase Storage for proofs/avatars)
-- Note: These usually need to be done in the Storage tab, but these policies help
-- if you have a 'payment-proofs' bucket:
-- (Uncomment if needed)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
