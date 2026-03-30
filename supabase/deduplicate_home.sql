-- 1. Clear the table first to remove all duplicates
TRUNCATE TABLE public.home_reasons;

-- 2. Re-insert the four premium "Why Evently" reasons
INSERT INTO public.home_reasons (title, description, icon, order_index) VALUES
('Elite Network', 'Join a curated community of the world’s most talented event professionals.', 'Users', 1),
('Secure Payments', 'Get paid on time, every time, with our integrated and secure payments.', 'ShieldCheck', 2),
('Zero Friction', 'From inquiry to final invoice, we’ve automated the boring parts of event planning.', 'Zap', 3),
('Verified Trust', 'Build a bulletproof reputation with our verified review and badge system.', 'Lock', 4);

-- 3. Clear and re-insert Features just in case there are duplicates there too
TRUNCATE TABLE public.home_features;

INSERT INTO public.home_features (title, description, icon, image_url, order_index) VALUES
('All-in-One Dashboard', 'Manage your bookings, messages, and portfolio from a single, intuitive command center.', 'Layout', '/mockups/analytics.png', 1),
('Global Discovery', 'Get your portfolio in front of premium clients actively looking for your specific expertise.', 'Globe', '/mockups/portfolio.png', 2),
('Real-time Analytics', 'Track your profile performance, booking trends, and revenue growth with precise data.', 'TrendingUp', '/mockups/messaging.png', 3);
