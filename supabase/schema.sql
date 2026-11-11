-- ==============================================================================
-- 🌸 Birthday Bloom: Supabase Database Schema & Storage Configuration
-- ==============================================================================

-- 1. Create the `birthday_photos` table
CREATE TABLE IF NOT EXISTS public.birthday_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.birthday_photos ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for `birthday_photos` table:
-- Policy: Allow public read access to photo metadata so visitors can view the gallery
CREATE POLICY "Allow public read access on birthday_photos"
    ON public.birthday_photos
    FOR SELECT
    USING (true);

-- Policy: Only authenticated users (the administrator) can insert new photos
CREATE POLICY "Allow authenticated admin insert on birthday_photos"
    ON public.birthday_photos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update photo titles/captions
CREATE POLICY "Allow authenticated admin update on birthday_photos"
    ON public.birthday_photos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can delete photos
CREATE POLICY "Allow authenticated admin delete on birthday_photos"
    ON public.birthday_photos
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- ==============================================================================
-- 4. Supabase Storage Bucket: `birthday-private`
-- ==============================================================================

-- Create the private bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'birthday-private',
    'birthday-private',
    false, -- Private bucket: access requires signed URLs or authentication
    10485760, -- 10 MB maximum upload size
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Enable RLS on storage.objects (if not already enabled by Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policy: Allow read access to signed URLs and authenticated users
CREATE POLICY "Allow read on private birthday bucket"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'birthday-private');

-- Storage Policy: Only authenticated users can upload photos
CREATE POLICY "Allow authenticated admin upload to birthday bucket"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'birthday-private'
        AND auth.uid() IS NOT NULL
    );

-- Storage Policy: Only authenticated users can update/replace photos
CREATE POLICY "Allow authenticated admin update on birthday bucket"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'birthday-private'
        AND auth.uid() IS NOT NULL
    );

-- Storage Policy: Only authenticated users can delete photos
CREATE POLICY "Allow authenticated admin delete on birthday bucket"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'birthday-private'
        AND auth.uid() IS NOT NULL
    );

-- ==============================================================================
-- 5. Personalized Shareable Gift Surprises (`gift_surprises` table)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gift_surprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    recipient_name TEXT NOT NULL,
    passcode TEXT, -- optional secret password to unlock gift
    passcode_hint TEXT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.gift_surprises ENABLE ROW LEVEL SECURITY;

-- Allow public read access by slug so recipients can unlock and view their surprise
CREATE POLICY "Allow public read access on gift_surprises"
    ON public.gift_surprises
    FOR SELECT
    USING (true);

-- Allow authenticated admins to create new gifts
CREATE POLICY "Allow authenticated admin insert on gift_surprises"
    ON public.gift_surprises
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated admins to update their gifts
CREATE POLICY "Allow authenticated admin update on gift_surprises"
    ON public.gift_surprises
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated admins to delete their gifts
CREATE POLICY "Allow authenticated admin delete on gift_surprises"
    ON public.gift_surprises
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);
