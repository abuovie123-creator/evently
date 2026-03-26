-- Create platform_announcements table
CREATE TABLE IF NOT EXISTS public.platform_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create external_links table
CREATE TABLE IF NOT EXISTS public.external_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;

-- Grant access to public (anon and authenticated)
CREATE POLICY "Allow public read on announcements" ON public.platform_announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read on external links" ON public.external_links FOR SELECT USING (true);

-- Grant full access to Admin (All authenticated for now, or refine to specific roles)
CREATE POLICY "Allow admin full access on announcements" ON public.platform_announcements FOR ALL USING (true);
CREATE POLICY "Allow admin full access on external links" ON public.external_links FOR ALL USING (true);
