-- Add KYC document columns to the planners table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='planners' AND column_name='id_url') THEN
        ALTER TABLE public.planners ADD COLUMN id_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='planners' AND column_name='passport_url') THEN
        ALTER TABLE public.planners ADD COLUMN passport_url TEXT;
    END IF;
END $$;

-- Create Storage Bucket for KYC Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for KYC Documents (Highly restrictive)
-- Planners can upload their own KYC documents
CREATE POLICY "Planners can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Planners can view their own KYC documents
CREATE POLICY "Planners can view their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view ANY KYC document
-- (Assuming admins have a profile role of 'admin')
CREATE POLICY "Admins can view any KYC document"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND 
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
