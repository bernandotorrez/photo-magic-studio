import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { Building2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Profile {
  monthly_generate_limit: number;
  current_month_generates: number;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

export default function ExteriorDesign() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [enhancementOptions, setEnhancementOptions] = useState<string[]>([]);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch profile on mount
  useState(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('monthly_generate_limit, current_month_generates')
          .eq('user_id', user.id)
          .single();
        
        if (data) setProfile(data);
      }
    };
    
    fetchProfile();
  });

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
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Exterior Design AI</h1>
              <p className="text-sm text-muted-foreground">
                Transform building exteriors with AI - facade renovation, landscaping, and more
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Facade Renovation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Renovasi tampilan depan bangunan dengan berbagai style arsitektur
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Landscaping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Tambahkan taman, tanaman, pool, dan landscape design profesional
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Time & Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Ubah waktu (day/night/golden hour) dan cuaca (sunny/cloudy/rainy)
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
            classification={classification || 'exterior'}
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
              <CardTitle>Upload Exterior Photo</CardTitle>
              <CardDescription>
                Upload a building exterior photo to start designing with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                profile={profile}
                classifyFunction="classify-exterior"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
