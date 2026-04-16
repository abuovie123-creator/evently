-- Add unavailable_dates column to the planners table
ALTER TABLE public.planners ADD COLUMN IF NOT EXISTS unavailable_dates text[] DEFAULT '{}'::text[];
