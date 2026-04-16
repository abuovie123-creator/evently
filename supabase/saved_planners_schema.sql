-- Drop table if it exists
DROP TABLE IF EXISTS public.saved_planners;

-- Create saved_planners table
CREATE TABLE public.saved_planners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    planner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent a client from saving the same planner multiple times
    UNIQUE(client_id, planner_id)
);

-- Turn on Row Level Security
ALTER TABLE public.saved_planners ENABLE ROW LEVEL SECURITY;

-- Policies
-- Clients can read their own saved planners
CREATE POLICY "Clients can view their own saved planners" 
    ON public.saved_planners 
    FOR SELECT 
    USING (auth.uid() = client_id);

-- Clients can insert their own saved planners
CREATE POLICY "Clients can save planners" 
    ON public.saved_planners 
    FOR INSERT 
    WITH CHECK (auth.uid() = client_id);

-- Clients can delete their own saved planners
CREATE POLICY "Clients can unsave planners" 
    ON public.saved_planners 
    FOR DELETE 
    USING (auth.uid() = client_id);

-- Give access to authenticated users
GRANT ALL ON TABLE public.saved_planners TO authenticated;
