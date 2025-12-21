import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImageUploader } from './ImageUploader';
import { MultipleImageUploader } from './MultipleImageUploader';
import { Loader2 } from 'lucide-react';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface EnhancementInfo {
  requires_multiple_images: boolean;
  min_images: number;
  max_images: number;
  multiple_images_description: string | null;
}

interface SmartImageUploaderProps {
  onImageUploaded: (url: string, path: string, classification: string, options: any[], responseData?: any) => void;
  onMultipleImagesUploaded?: (images: Array<{url: string, path: string, preview: string}>) => void;
  profile: Profile | null;
  selectedEnhancement: string | null;
  classifyFunction?: string;
}

export function SmartImageUploader({
  onImageUploaded,
  onMultipleImagesUploaded,
  profile,
  selectedEnhancement,
  classifyFunction = 'classify-image'
}: SmartImageUploaderProps) {
  const [enhancementInfo, setEnhancementInfo] = useState<EnhancementInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedEnhancement) {
      checkEnhancementRequirements();
    } else {
      setEnhancementInfo(null);
    }
  }, [selectedEnhancement]);

  const checkEnhancementRequirements = async () => {
    if (!selectedEnhancement) return;

    setLoading(true);
    try {
      // Query enhancement info from database
      const { data, error } = await supabase
        .from('enhancement_prompts' as any)
        .select('requires_multiple_images, min_images, max_images, multiple_images_description')
        .eq('enhancement_type', selectedEnhancement)
        .single();

      if (error) {
        console.error('Error fetching enhancement info:', error);
        setEnhancementInfo(null);
        return;
      }

      if (data) {
        setEnhancementInfo({
          requires_multiple_images: data.requires_multiple_images || false,
          min_images: data.min_images || 1,
          max_images: data.max_images || 1,
          multiple_images_description: data.multiple_images_description || null
        });
      }
    } catch (error) {
      console.error('Error checking enhancement requirements:', error);
      setEnhancementInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking enhancement requirements...</p>
        </div>
      </div>
    );
  }

  // If enhancement requires multiple images, show MultipleImageUploader
  if (enhancementInfo?.requires_multiple_images && onMultipleImagesUploaded) {
    return (
      <MultipleImageUploader
        onImagesUploaded={onMultipleImagesUploaded}
        profile={profile}
        minImages={enhancementInfo.min_images}
        maxImages={enhancementInfo.max_images}
        description={enhancementInfo.multiple_images_description || undefined}
      />
    );
  }

  // Default: show single ImageUploader
  return (
    <ImageUploader
      onImageUploaded={onImageUploaded}
      profile={profile}
      classifyFunction={classifyFunction}
      selectedEnhancement={selectedEnhancement}
    />
  );
}
