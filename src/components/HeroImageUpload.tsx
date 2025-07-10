import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useHeroImage } from '@/hooks/useHeroImage';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const HeroImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { heroImage, updateHeroImage } = useHeroImage();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      await updateHeroImage(publicUrl, 'Uploaded hero image');

      toast({
        title: "Hero image updated successfully!",
        description: "The new image is now active on the landing page.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setIsUploading(true);

    try {
      await updateHeroImage(imageUrl, 'Hero image from URL');
      setImageUrl('');
      
      toast({
        title: "Hero image updated successfully!",
        description: "The new image is now active on the landing page.",
      });
    } catch (error) {
      console.error('Error updating image URL:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Manage Hero Image</h3>
      
      {heroImage && (
        <div className="mb-6">
          <Label className="text-sm text-muted-foreground">Current Hero Image</Label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <img 
              src={heroImage.image_url} 
              alt={heroImage.alt_text || 'Current hero image'} 
              className="w-full h-32 object-cover"
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* File Upload */}
        <div>
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Upload New Image
          </Label>
          <div className="mt-2">
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground"
            />
          </div>
        </div>

        {/* URL Input */}
        <div>
          <Label htmlFor="image-url" className="text-sm font-medium">
            Or Enter Image URL
          </Label>
          <form onSubmit={handleUrlSubmit} className="mt-2 flex gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isUploading}
            />
            <Button type="submit" disabled={isUploading || !imageUrl.trim()}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
};