-- Fix for "Profile not found" error on planner profile page

-- 1. Ensure 'username' column exists in profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Populate 'username' with 'full_name' (lowercased, no spaces) as a starting point if null
UPDATE profiles SET username = LOWER(REPLACE(full_name, ' ', '_')) WHERE username IS NULL AND full_name IS NOT NULL;

-- 3. If still null (e.g. no full_name), use the first part of the ID
UPDATE profiles SET username = substring(id::text, 1, 8) WHERE username IS NULL;

-- 4. Ensure RLS allows public reading of the username column
-- (Already covered by "Public profiles are viewable by everyone" if 'true' is used)
-- But just in case, we re-assert it:
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
