import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/useProducts';
import { useUpdateCategory } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fallbackImages: Record<string, string> = {
  'for-him': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
  'for-her': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
  'unisex': 'https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=800',
};

export function CollectionImageManager() {
  const { data: categories, isLoading } = useCategories();
  const updateCategory = useUpdateCategory();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = async (categoryId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingId(categoryId);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [categoryId]: previewUrl }));

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `collection-${categoryId}-${Date.now()}.${fileExt}`;
      const filePath = `collections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update category with new image URL
      await updateCategory.mutateAsync({ id: categoryId, image_url: publicUrl });

      // Clear preview
      setPreviewUrls(prev => {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreviewUrls(prev => {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleUrlChange = async (categoryId: string, url: string) => {
    if (!url.trim()) return;
    
    try {
      await updateCategory.mutateAsync({ id: categoryId, image_url: url });
    } catch (error) {
      console.error('URL update error:', error);
    }
  };

  const getDisplayImage = (category: { id: string; slug: string; image_url?: string | null }) => {
    if (previewUrls[category.id]) return previewUrls[category.id];
    if (category.image_url) return category.image_url;
    return fallbackImages[category.slug] || fallbackImages['unisex'];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
          Collection Background Images
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload or set URLs for collection background images. Recommended size: 800x1000px (4:5 ratio).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">{category.name}</Label>
              {uploadingId === category.id && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>

            {/* Image Preview */}
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted">
              <img
                src={getDisplayImage(category)}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImages[category.slug] || fallbackImages['unisex'];
                }}
              />
              {previewUrls[category.id] && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Preview
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-medium text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {category.image_url ? 'Custom image' : 'Using fallback'}
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => (fileInputRefs.current[category.id] = el)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(category.id, file);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRefs.current[category.id]?.click()}
              disabled={uploadingId === category.id}
            >
              {uploadingId === category.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Image
            </Button>

            {/* URL Input */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Or enter image URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://..."
                  defaultValue={category.image_url || ''}
                  className="text-sm"
                  onBlur={(e) => {
                    if (e.target.value !== (category.image_url || '')) {
                      handleUrlChange(category.id, e.target.value);
                    }
                  }}
                />
              </div>
            </div>

            {/* Clear Custom Image */}
            {category.image_url && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={() => handleUrlChange(category.id, '')}
              >
                <X className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
