-- Add decline_reason column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Update RLS policies if necessary (usually not needed for just adding a column unless selectively restricted)
-- Ensure planners can update their own bookings' status and reason
DROP POLICY IF EXISTS "Planners can update their own bookings" ON public.bookings;
CREATE POLICY "Planners can update their own bookings" 
    ON public.bookings FOR UPDATE 
    USING (auth.uid() = planner_id)
    WITH CHECK (auth.uid() = planner_id);
