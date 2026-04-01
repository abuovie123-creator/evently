-- [MISSING SCHEMA] PLANNERS TABLE
-- This table is required for the Planner Registration and Login flow.

CREATE TABLE IF NOT EXISTS public.planners (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT,
    phone TEXT,
    address TEXT,
    location TEXT,
    event_types JSONB DEFAULT '[]'::jsonb,
    nin TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.planners ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view planner details (for public portfolios)
DROP POLICY IF EXISTS "Public can view planners" ON public.planners;
CREATE POLICY "Public can view planners" 
  ON public.planners FOR SELECT USING (true);

-- 2. Planners can manage their own details
DROP POLICY IF EXISTS "Planners can manage own details" ON public.planners;
CREATE POLICY "Planners can manage own details" 
  ON public.planners FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Admins can view/manage all planners
DROP POLICY IF EXISTS "Admins can manage all planners" ON public.planners;
CREATE POLICY "Admins can manage all planners" 
  ON public.planners FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
