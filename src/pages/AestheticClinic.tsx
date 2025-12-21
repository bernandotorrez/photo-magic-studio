import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { SmartImageUploader } from '@/components/dashboard/SmartImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenAlert } from '@/components/TokenAlert';
import { Sparkle, Info, Scissors, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

interface SubcategoryEnhancements {
  hair_style: any[];
  makeup: any[];
}

export default function AestheticClinic() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [subcategories, setSubcategories] = useState<SubcategoryEnhancements>({ hair_style: [], makeup: [] });
  const [activeTab, setActiveTab] = useState<'hair_style' | 'makeup'>('hair_style');
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

  const handleImageUploaded = (url: string, path: string, classif: string, options: any[], responseData?: any) => {
    setImageUrl(url);
    setImagePath(path);
    setClassification(classif);
    
    // Extract gender and subcategories from response
    if (responseData?.gender) {
      setGender(responseData.gender);
      console.log('✅ Gender detected:', responseData.gender);
    }
    
    if (responseData?.subcategories) {
      setSubcategories(responseData.subcategories);
      console.log('✅ Subcategories loaded:', {
        hair_style: responseData.subcategories.hair_style.length,
        makeup: responseData.subcategories.makeup.length
      });
    } else {
      // Fallback: use flat options list
      console.warn('⚠️ No subcategories in response, using fallback');
      setSubcategories({ hair_style: options, makeup: [] });
    }
    
    setSelectedEnhancements([]);
    setGeneratedResults([]);
    setActiveTab('hair_style'); // Default to hair style tab
  };

  const handleBack = () => {
    setImageUrl(null);
    setImagePath(null);
    setClassification(null);
    setSubcategories({ hair_style: [], makeup: [] });
    setSelectedEnhancements([]);
    setGeneratedResults([]);
    setActiveTab('hair_style');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Aesthetic Clinic 💄</h1>
              <p className="text-sm text-muted-foreground">
                AI Beauty Enhancement - Hair Style & Makeup Transformation
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
            <strong>Cara Pakai:</strong> Upload foto portrait → AI deteksi gender → Pilih tab Hair Style atau Makeup → 
            Pilih enhancement → Generate! (Makeup mendukung custom warna)
          </AlertDescription>
        </Alert>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scissors className="w-4 h-4 text-pink-600" />
                Hair Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Auto gender detection - Tampilkan gaya rambut sesuai gender yang terdeteksi
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-600" />
                Makeup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                25+ pilihan makeup dari natural hingga glam dengan custom color support
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
                Tentukan warna lipstik, eyeshadow, dan blush sesuai keinginan Anda
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
                <Sparkle className="w-5 h-5 text-pink-600" />
                Pilih Enhancement
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Detected: {gender === 'male' ? '👨 Male' : '👩 Female'})
                </span>
              </CardTitle>
              <CardDescription>
                Pilih kategori dan enhancement yang ingin diterapkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'hair_style' | 'makeup')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="hair_style" className="flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Hair Style ({subcategories.hair_style.length})
                  </TabsTrigger>
                  <TabsTrigger value="makeup" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Makeup ({subcategories.makeup.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hair_style">
                  {subcategories.hair_style.length > 0 ? (
                    <EnhancementOptions
                      imageUrl={imageUrl}
                      imagePath={imagePath}
                      classification={classification || 'beauty'}
                      options={subcategories.hair_style}
                      selectedEnhancements={selectedEnhancements}
                      onSelect={setSelectedEnhancements}
                      onGenerate={handleGenerate}
                      onBack={handleBack}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                      profile={profile}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada hair style enhancement tersedia</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="makeup">
                  {subcategories.makeup.length > 0 ? (
                    <EnhancementOptions
                      imageUrl={imageUrl}
                      imagePath={imagePath}
                      classification={classification || 'beauty'}
                      options={subcategories.makeup}
                      selectedEnhancements={selectedEnhancements}
                      onSelect={setSelectedEnhancements}
                      onGenerate={handleGenerate}
                      onBack={handleBack}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                      profile={profile}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada makeup enhancement tersedia</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Upload Portrait Photo</CardTitle>
              <CardDescription>
                Upload foto portrait untuk beauty enhancement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartImageUploader
                selectedEnhancement={selectedEnhancements[0] || null}
                onImageUploaded={handleImageUploaded}
                profile={profile}
                classifyFunction="classify-beauty"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
