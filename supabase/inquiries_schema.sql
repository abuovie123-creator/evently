-- INQUIRIES SCHEMA
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can submit a contact form)
CREATE POLICY "Anyone can insert inquiries" 
    ON public.inquiries FOR INSERT 
    WITH CHECK (true);

-- Only authenticated admins can read inquiries
CREATE POLICY "Admins can view inquiries" 
    ON public.inquiries FOR SELECT 
    USING (auth.role() = 'authenticated');
