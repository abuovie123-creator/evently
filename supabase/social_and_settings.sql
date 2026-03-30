-- [FINAL INTEGRATION] SOCIAL LINKS & DASHBOARD BRANDING
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. ADD SOCIAL MEDIA & CONTACT COLUMNS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_email TEXT;

-- 2. ENSURE BIO COLUMN EXISTS (For Settings Page)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. ENSURE REAL-TIME TRIGGERS ARE ACTIVE (For Dashboard Message Card Sync)
-- This ensures that the 'conversations' table is updated whenever a new message is sent.
CREATE OR REPLACE FUNCTION public.handle_new_message() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- 4. REFRESH RLS POLICIES (Allow planners to update their own social links)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. VERIFY PUBLIC ACCESS (Ensure clients can see social links on the portfolio)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);
