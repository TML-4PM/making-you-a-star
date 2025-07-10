-- Create images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Create storage policies for images bucket
CREATE POLICY "Images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

-- Create hero_images table for image metadata
CREATE TABLE public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  usage_location TEXT NOT NULL DEFAULT 'hero',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hero_images
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_images
CREATE POLICY "Anyone can view hero images" 
ON public.hero_images 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage hero images" 
ON public.hero_images 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_hero_images_updated_at
BEFORE UPDATE ON public.hero_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the provided image as the default hero image
INSERT INTO public.hero_images (image_url, alt_text, usage_location, is_active)
VALUES (
  'https://lzfgigiyqpuuxslsygjt.supabase.co/storage/v1/object/public/images/Screenshot%202025-07-11%20at%209.07.28%20am.png',
  'Make me a STAR hero image',
  'hero',
  true
);