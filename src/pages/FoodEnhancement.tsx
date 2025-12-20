import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { TokenAlert } from '@/components/TokenAlert';
import { UtensilsCrossed, Sparkles, Camera, Palette, Zap } from 'lucide-react';
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

export default function FoodEnhancement() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [enhancementOptions, setEnhancementOptions] = useState<any[]>([]); // Support both object[] and string[]
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
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
    setGeneratedResults([]);
  };

  const handleBack = () => {
    setImageUrl(null);
    setImagePath(null);
    setClassification(null);
    setEnhancementOptions([]);
    setSelectedEnhancements([]);
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
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Food Enhancement AI</h1>
              <p className="text-sm text-muted-foreground">
                Transform food photos into mouth-watering professional images
              </p>
            </div>
          </div>
        </div>

        {/* Token Alert */}
        <TokenAlert profile={profile} />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Perfect Angles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Top-down, 45-degree, atau close-up untuk hasil terbaik
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Styling & Plating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Elegant, rustic, atau tambahkan props untuk presentasi sempurna
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Special Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Steam, sauce drip, vibrant colors, dan bokeh effect
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Banners & Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Menu restoran, delivery app, atau promotional banners
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🎯 Perfect For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <span>Restaurant Menus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <span>Social Media</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🛵</span>
                <span>Delivery Apps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <span>Food Blogs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <span>Advertising</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
            classification={classification || 'food'}
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
              <CardTitle>Upload Food Photo</CardTitle>
              <CardDescription>
                Upload a food photo to start enhancing with AI. Works best with clear, well-lit photos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                profile={profile}
                classifyFunction="classify-food"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
