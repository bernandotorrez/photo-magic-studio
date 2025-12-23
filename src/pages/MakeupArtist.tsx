import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { SmartImageUploader } from '@/components/dashboard/SmartImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenAlert } from '@/components/TokenAlert';
import { Palette, Info, Sparkle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

export default function MakeupArtist() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [makeupOptions, setMakeupOptions] = useState<any[]>([]);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleImageUploaded = (url: string, path: string, classif: string, options: any[], responseData?: any) => {
    setImageUrl(url);
    setImagePath(path);
    setClassification(classif);
    
    // Extract only makeup subcategory
    if (responseData?.subcategories?.makeup) {
      setMakeupOptions(responseData.subcategories.makeup);
    } else {
      setMakeupOptions(options);
    }
    
    setSelectedEnhancements([]);
    setGeneratedResults([]);
  };

  const handleBack = () => {
    setImageUrl(null);
    setImagePath(null);
    setClassification(null);
    setMakeupOptions([]);
    setSelectedEnhancements([]);
    setGeneratedResults([]);
  };

  const handleGenerate = (results: GeneratedResult[]) => {
    setGeneratedResults(results);
    refreshProfile();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Make Up Artist 💄</h1>
              <p className="text-sm text-muted-foreground">
                AI Makeup Transformation - Virtual Makeup Try-On
              </p>
            </div>
          </div>
        </div>

        {/* Token Alert */}
        <TokenAlert profile={profile} />

        {/* Info Alert */}
        <Alert className="mb-6 border-pink-200 bg-pink-50 dark:bg-pink-950/20">
          <Info className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-sm">
            <strong>Cara Pakai:</strong> Upload foto portrait → Pilih style makeup → Customize warna (opsional) → Generate!
            Mendukung custom color untuk lipstik, eyeshadow, dan blush.
          </AlertDescription>
        </Alert>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-600" />
                25+ Makeup Styles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Pilihan makeup dari natural, elegant, glam, hingga bold look untuk berbagai occasion
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-pink-600" />
                Custom Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Tentukan warna lipstik, eyeshadow, dan blush sesuai keinginan dengan color picker
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-600" />
                Pilih Makeup Style
              </CardTitle>
              <CardDescription>
                Pilih style makeup dan customize warna sesuai keinginan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {makeupOptions.length > 0 ? (
                <EnhancementOptions
                  imageUrl={imageUrl}
                  imagePath={imagePath}
                  classification={classification || 'beauty'}
                  options={makeupOptions}
                  selectedEnhancements={selectedEnhancements}
                  onSelect={setSelectedEnhancements}
                  onGenerate={handleGenerate}
                  onBack={handleBack}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  profile={profile}
                  showHairColorPicker={false}
                  showMakeupDetails={true}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tidak ada makeup enhancement tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Upload Portrait Photo</CardTitle>
              <CardDescription>
                Upload foto portrait untuk makeup transformation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartImageUploader
                selectedEnhancement={selectedEnhancements[0] || null}
                onImageUploaded={handleImageUploaded}
                profile={profile}
                classifyFunction="classify-makeup"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
