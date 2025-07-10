import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeroImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  usage_location: string;
  is_active: boolean;
}

export const useHeroImage = () => {
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        // First check localStorage for cached image
        const cachedImage = localStorage.getItem('hero_image');
        if (cachedImage) {
          const parsed = JSON.parse(cachedImage);
          setHeroImage(parsed);
          setIsLoading(false);
        }

        // Fetch from database
        const { data, error: fetchError } = await supabase
          .from('hero_images')
          .select('*')
          .eq('usage_location', 'hero')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching hero image:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          setHeroImage(data);
          // Cache in localStorage
          localStorage.setItem('hero_image', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Error in fetchHeroImage:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  const updateHeroImage = async (imageUrl: string, altText?: string) => {
    try {
      // Deactivate current active image
      await supabase
        .from('hero_images')
        .update({ is_active: false })
        .eq('usage_location', 'hero')
        .eq('is_active', true);

      // Insert new active image
      const { data, error } = await supabase
        .from('hero_images')
        .insert({
          image_url: imageUrl,
          alt_text: altText || 'Hero image',
          usage_location: 'hero',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setHeroImage(data);
        localStorage.setItem('hero_image', JSON.stringify(data));
      }

      return data;
    } catch (err) {
      console.error('Error updating hero image:', err);
      setError(err instanceof Error ? err.message : 'Failed to update image');
      throw err;
    }
  };

  return {
    heroImage,
    isLoading,
    error,
    updateHeroImage
  };
};