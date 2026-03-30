-- Site Settings for Footer Links and Metadata
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial footer links
INSERT INTO site_settings (key, value, description) VALUES
('privacy_policy_url', '/privacy', 'Link to the Privacy Policy page'),
('terms_conditions_url', '/terms', 'Link to the Terms and Conditions page'),
('cookie_policy_url', '/cookies', 'Link to the Cookie Policy page')
ON CONFLICT (key) DO NOTHING;

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial FAQs (migrating from pricing page)
INSERT INTO faqs (question, answer, order_index) VALUES
('How do I join as a planner?', 'You can click the "Join as a Planner" button on the home page or go to /auth/register-planner to start your journey.', 1),
('Is there a fee for clients?', 'No, clients can browse and book planners for free. We only charge planners a small commission on successful bookings.', 2),
('How do I contact support?', 'You can use the Support Ticket system in your dashboard settings for any inquiries or issues.', 3),
('Can I switch plans anytime?', 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we''ll prorate your billing.', 4),
('What payment methods do you accept?', 'We accept payments via Paystack, Flutterwave, and direct bank transfers. All transactions are secure and encrypted.', 5),
('Is there a contract or commitment?', 'No contracts, no commitments. You can cancel your subscription at any time and continue using the features until your billing period ends.', 6),
('What happens when my subscription expires?', 'Your account will automatically downgrade to the Starter plan. Your data and profile remain intact, but premium features will be disabled.', 7)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Allow public read-only access to site_settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access to faqs" ON faqs
    FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Allow admins to manage site_settings" ON site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admins to manage faqs" ON faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
-- Home Features (Everything You Need to Grow)
CREATE TABLE IF NOT EXISTS home_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT, -- Lucide icon name
    image_url TEXT, -- Screenshot URL
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial features
INSERT INTO home_features (title, description, icon, image_url, order_index) VALUES
('All-in-One Dashboard', 'Manage your bookings, messages, and portfolio from a single, intuitive command center.', 'Layout', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 1),
('Global Discovery', 'Get your portfolio in front of premium clients actively looking for your specific expertise.', 'Globe', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 2),
('Real-time Analytics', 'Track your profile performance, booking trends, and revenue growth with precise data.', 'TrendingUp', 'https://images.unsplash.com/photo-1551288049-bbda48658a7d?w=800', 3)
ON CONFLICT DO NOTHING;

-- Home Reasons (Why Choose Us)
CREATE TABLE IF NOT EXISTS home_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT, -- Lucide icon name
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial reasons
INSERT INTO home_reasons (title, description, icon, order_index) VALUES
('Elite Network', 'Join a curated community of the world’s most talented event professionals.', 'Users', 1),
('Secure Payments', 'Get paid on time, every time, with our integrated and secure escrow-style payments.', 'ShieldCheck', 2),
('Zero Friction', 'From inquiry to final invoice, we’ve automated the boring parts of event planning.', 'Zap', 3),
('Verified Trust', 'Build a bulletproof reputation with our verified review and badge system.', 'Lock', 4)
ON CONFLICT DO NOTHING;

-- RLS for new tables
ALTER TABLE home_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read home_features" ON home_features FOR SELECT USING (true);
CREATE POLICY "Allow public read home_reasons" ON home_reasons FOR SELECT USING (true);

CREATE POLICY "Allow admins manage home_features" ON home_features FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow admins manage home_reasons" ON home_reasons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
