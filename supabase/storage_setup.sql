-- Create a bucket for site assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'site-assets');

-- Allow authenticated admins to upload files
CREATE POLICY "Admin Insert Access" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-assets' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admin Delete Access" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'site-assets' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
