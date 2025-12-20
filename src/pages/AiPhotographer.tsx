import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { SmartImageUploader } from '@/components/dashboard/SmartImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { TokenAlert } from '@/components/TokenAlert';
import { Camera, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

export default function AiPhotographer() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [enhancementOptions, setEnhancementOptions] = useState<any[]>([]); // Support both object[] and string[]
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [multipleImages, setMultipleImages] = useState<Array<{url: string, path: string, preview: string}>>([]);
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tokens, purchased_tokens, subscription_expires_at')
          .eq('user_id', user.id)
          .single();
        
        if (data) setProfile(data);
      }
    };
    
    fetchProfile();
  }, [user]);

  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tokens, purchased_tokens, subscription_expires_at')
        .eq('user_id', user.id)
        .single();
      
      if (data) setProfile(data);
    }
  };

  const handleImageUploaded = (url: string, path: string, classif: string, options: string[]) => {
    setImageUrl(url);
    setImagePath(path);
    setClassification(classif);
    setEnhancementOptions(options);
    setSelectedEnhancements([]);
    setMultipleImages([]);
    setGeneratedResults([]);
  };

  const handleMultipleImagesUploaded = (images: Array<{url: string, path: string, preview: string}>) => {
    setMultipleImages(images);
    setImageUrl(null);
    setImagePath(null);
    setClassification('portrait');
    setEnhancementOptions([]);
    setSelectedEnhancements([]);
    setGeneratedResults([]);
  };

  const handleBack = () => {
    setImageUrl(null);
    setImagePath(null);
    setClassification(null);
    setEnhancementOptions([]);
    setSelectedEnhancements([]);
    setMultipleImages([]);
    setGeneratedResults([]);
  };

  const handleGenerate = (results: GeneratedResult[]) => {
    setGeneratedResults(results);
    refreshProfile(); // Refresh token count after generation
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AI Photographer</h1>
              <p className="text-sm text-muted-foreground">
                Transform portrait photos with AI - change outfits, poses, backgrounds, and more
              </p>
            </div>
          </div>
        </div>

        {/* Token Alert */}
        <TokenAlert profile={profile} />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Virtual Outfit Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Ganti pakaian dalam foto tanpa mengubah wajah atau pose
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Pose & Expression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Ubah pose dan ekspresi wajah untuk hasil yang lebih profesional
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Professional Enhancement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Beauty enhancement, background change, dan professional portrait editing
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {generatedResults.length > 0 ? (
          <GenerationResult
            originalUrl={imageUrl || ''}
            results={generatedResults}
            onRegenerate={() => {
              setGeneratedResults([]);
              setSelectedEnhancements([]);
            }}
            onNewImage={handleBack}
          />
        ) : imageUrl && imagePath ? (
          <EnhancementOptions
            imageUrl={imageUrl}
            imagePath={imagePath}
            classification={classification || 'person'}
            options={enhancementOptions}
            selectedEnhancements={selectedEnhancements}
            onSelect={setSelectedEnhancements}
            onGenerate={handleGenerate}
            onBack={handleBack}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            profile={profile}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Upload Portrait Photo</CardTitle>
              <CardDescription>
                Upload a portrait photo to start enhancing with AI Photographer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartImageUploader
                selectedEnhancement={selectedEnhancements[0] || null}
                onImageUploaded={handleImageUploaded}
                onMultipleImagesUploaded={handleMultipleImagesUploaded}
                profile={profile}
                classifyFunction="classify-portrait"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
