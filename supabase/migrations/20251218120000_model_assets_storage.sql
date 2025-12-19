-- Create storage bucket for model assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-assets', 'model-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for model assets (public read access)
CREATE POLICY "Public Access for Model Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'model-assets');

-- Allow authenticated users to upload model assets (for admin purposes)
CREATE POLICY "Authenticated users can upload model assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'model-assets' 
  AND auth.role() = 'authenticated'
);
