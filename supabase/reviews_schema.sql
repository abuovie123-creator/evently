-- REVIEWS & RATINGS SCHEMA
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    planner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id) -- One review per booking
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = client_id AND EXISTS (
        SELECT 1 FROM public.bookings 
        WHERE id = booking_id AND client_id = auth.uid() AND status = 'approved'
    )
);

-- Trigger to update planner rating in profiles
CREATE OR REPLACE FUNCTION public.update_planner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM public.reviews
        WHERE planner_id = NEW.planner_id
    )
    WHERE id = NEW.planner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_added
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_planner_rating();

-- Seed some initial reviews for testing
-- (Assuming IDs exist, otherwise this will skip)
-- INSERT INTO public.reviews (client_id, planner_id, booking_id, rating, comment)
-- VALUES ('...', '...', '...', 5, 'Exceptional experience! Very professional.')
-- ON CONFLICT DO NOTHING;
