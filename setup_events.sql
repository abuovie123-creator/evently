-- 1. Profiles Table (Core User Identity)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'client', -- 'client', 'planner', 'admin'
    email TEXT,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified'
    plan_id TEXT DEFAULT 'starter',
    subscription_status TEXT DEFAULT 'inactive',
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'starter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Platform Settings (Branding, Features, Plans)
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    branding JSONB DEFAULT '{"primaryColor": "#3b82f6", "secondaryColor": "#10b981", "logoUrl": ""}'::jsonb,
    features JSONB DEFAULT '{"bookingRequests": true, "chatSystem": false, "plannerReviews": true, "subscriptionMonetization": false, "featuredListings": true, "vendorMarketplace": false}'::jsonb,
    subscription_plans JSONB DEFAULT '[{"id": "starter", "name": "Starter", "price": "0", "period": "month", "features": ["Basic public profile", "5 portfolio images"]}, {"id": "pro", "name": "Pro", "price": "5000", "period": "month", "features": ["Verified badge", "25 portfolio images"]}, {"id": "elite", "name": "Elite", "price": "15000", "period": "month", "features": ["Unlimited images", "Priority support"]}]'::jsonb,
    gateway_keys JSONB DEFAULT '{"paystack": {"publicKey": "", "secretKey": ""}, "flutterwave": {"publicKey": "", "secretKey": ""}}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Transactions Table (Automated Payments)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    method TEXT, -- 'paystack', 'flutterwave', 'bank_transfer'
    plan_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure profile_id exists in transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    date DATE,
    location TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Album Media Table (Images & Videos)
CREATE TABLE IF NOT EXISTS album_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image', -- 'image' or 'video'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bank Transfers Table (Manual Payments)
CREATE TABLE IF NOT EXISTS bank_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
    notes TEXT,
    target_tier TEXT, -- 'pro', 'elite'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure profile_id exists in bank_transfers
ALTER TABLE bank_transfers ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 7. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfers ENABLE ROW LEVEL SECURITY;

-- 8. Policies

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Platform Settings Policies
DROP POLICY IF EXISTS "Public can read platform settings" ON platform_settings;
CREATE POLICY "Public can read platform settings" ON platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can update platform settings" ON platform_settings;
CREATE POLICY "Only admins can update platform settings" ON platform_settings 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions" ON transactions 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Events Policies
DROP POLICY IF EXISTS "Allow public read events" ON events;
CREATE POLICY "Allow public read events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow planner manage own events" ON events;
CREATE POLICY "Allow planner manage own events" ON events FOR ALL USING (auth.uid() = planner_id);

-- Album Media Policies
DROP POLICY IF EXISTS "Allow public read album_media" ON album_media;
CREATE POLICY "Allow public read album_media" ON album_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow planner manage own media" ON album_media;
CREATE POLICY "Allow planner manage own media" ON album_media 
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = album_media.event_id AND events.planner_id = auth.uid()));

-- Bank Transfers Policies
DROP POLICY IF EXISTS "Allow users read own transfers" ON bank_transfers;
CREATE POLICY "Allow users read own transfers" ON bank_transfers FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow users create transfers" ON bank_transfers;
CREATE POLICY "Allow users create transfers" ON bank_transfers FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow admins manage all transfers" ON bank_transfers;
CREATE POLICY "Allow admins manage all transfers" ON bank_transfers 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. Seed Data
INSERT INTO platform_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 9. Seed Data
INSERT INTO platform_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
