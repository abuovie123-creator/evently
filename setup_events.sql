-- 1. Create Events Table
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

-- 2. Create Album Media Table (Images & Videos)
CREATE TABLE IF NOT EXISTS album_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image', -- 'image' or 'video'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Bank Transfers Table for Manual Payments
CREATE TABLE IF NOT EXISTS bank_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
    notes TEXT,
    target_tier TEXT, -- 'pro', 'elite'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfers ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Events: Public read, Authenticated create/update for own events
CREATE POLICY "Allow public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow planner manage own events" ON events 
    FOR ALL USING (auth.uid() = planner_id);

-- Album Media: Public read, Authenticated manage for own event media
CREATE POLICY "Allow public read album_media" ON album_media FOR SELECT USING (true);
CREATE POLICY "Allow planner manage own media" ON album_media 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events WHERE events.id = album_media.event_id AND events.planner_id = auth.uid()
        )
    );

-- Bank Transfers: Admin read/write all, User read/create own
CREATE POLICY "Allow users read own transfers" ON bank_transfers 
    FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Allow users create transfers" ON bank_transfers 
    FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Allow admins manage all transfers" ON bank_transfers 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
