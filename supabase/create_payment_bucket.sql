-- 1. Create the bucket if it doesn't exist
-- Note: Supabase doesn't have a direct SQL command to create a bucket in all versions, 
-- but we can insert into the storage.buckets table.
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on the bucket (optional as storage.objects has it enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Set up policies for 'payment-proofs' bucket

-- Allow public access to view the proofs (Admin will need this, and user might want to see their own)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-proofs');

-- Allow authenticated users to upload their own proofs
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'payment-proofs' 
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own proofs if needed
DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;
CREATE POLICY "Allow individual delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'payment-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
