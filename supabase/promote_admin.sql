-- Run this in your Supabase SQL Editor to promote a user to Administrator
-- Replace 'your-email@example.com' with the email you want to use for admin access

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'system@evently.com'; -- Replace with your desired email

-- If the row doesn't have an email column in profiles (depending on your schema),
-- you can use the user's ID or join with auth.users
/*
UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE auth.users.id = public.profiles.id
AND auth.users.email = 'system@evently.com';
*/
