import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { SmartImageUploader } from '@/components/dashboard/SmartImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenAlert } from '@/components/TokenAlert';
import { Scissors, Info } from 'lucide-react';
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

export default function HairStyle() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [fullResponseData, setFullResponseData] = useState<any>(null);
  const [hairStyleOptions, setHairStyleOptions] = useState<any[]>([]);
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
    
    // For hair style, classification is the gender (male or female)
    const detectedGender = classif as 'male' | 'female';
    setGender(detectedGender);
    setClassification('beauty'); // Set classification to beauty for backend
    
    // Store full response data for gender switching
    setFullResponseData(responseData);
    
    // Use enhancement options directly
    setHairStyleOptions(options);
    
    setSelectedEnhancements([]);
    setGeneratedResults([]);
  };

  const handleGenderChange = async (newGender: 'male' | 'female') => {
    setGender(newGender);
    
    // Reset selected enhancements when gender changes
    setSelectedEnhancements([]);
    
    // Reload hair style options from database based on new gender
    try {
      const { data: beautyCategory } = await supabase
        .from('image_categories')
        .select('id')
        .eq('category_code', 'beauty')
        .single();

      if (!beautyCategory) return;

      const categoryFilter = newGender === 'male' ? 'hair_style_male' : 'hair_style_female';

      const { data: enhancements } = await supabase
        .from('category_enhancements')
        .select(`
          enhancement_id,
          enhancement_prompts (
            id,
            enhancement_type,
            display_name,
            description,
            category,
            supports_custom_prompt
          )
        `)
        .eq('category_id', beautyCategory.id)
        .order('sort_order');

      if (enhancements) {
        const filteredOptions = enhancements
          .filter((item: any) => item.enhancement_prompts?.category === categoryFilter)
          .map((item: any) => ({
            id: item.enhancement_prompts.id,
            enhancement_type: item.enhancement_prompts.enhancement_type,
            display_name: item.enhancement_prompts.display_name,
            description: item.enhancement_prompts.description,
            supports_custom_prompt: item.enhancement_prompts.supports_custom_prompt || false,
          }));

        setHairStyleOptions(filteredOptions);
      }
    } catch (error) {
      console.error('Error loading hair styles:', error);
    }
  };

  const handleBack = () => {
    setImageUrl(null);
    setImagePath(null);
    setClassification(null);
    setHairStyleOptions([]);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Hair Style ✂️</h1>
              <p className="text-sm text-muted-foreground">
                AI Hair Style Transformation - Ubah Gaya Rambut Anda
              </p>
            </div>
          </div>
        </div>

        {/* Token Alert */}
        <TokenAlert profile={profile} />

        {/* Info Alert */}
        <Alert className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm">
            <strong>Cara Pakai:</strong> Upload foto portrait → AI deteksi gender → Pilih gaya rambut → Generate!
            Tersedia berbagai gaya rambut untuk pria dan wanita.
          </AlertDescription>
        </Alert>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scissors className="w-4 h-4 text-purple-600" />
              Fitur Hair Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Auto gender detection - Tampilkan gaya rambut sesuai gender yang terdeteksi (pria/wanita).
              Pilih dari berbagai style: pendek, panjang, keriting, lurus, modern, klasik, dan lainnya.
            </CardDescription>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-purple-600" />
                    Pilih Gaya Rambut
                  </CardTitle>
                  <CardDescription>
                    Pilih gaya rambut yang ingin diterapkan pada foto Anda
                  </CardDescription>
                </div>
                
                {/* Gender Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={gender === 'male' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGenderChange('male')}
                    disabled={isGenerating}
                  >
                    👨 Pria
                  </Button>
                  <Button
                    variant={gender === 'female' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGenderChange('female')}
                    disabled={isGenerating}
                  >
                    👩 Wanita
                  </Button>
                </div>
              </div>
              
              {/* Gender Detection Info */}
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs">
                  <strong>Gender Terdeteksi:</strong> {gender === 'male' ? '👨 Pria' : '👩 Wanita'}. 
                  Jika salah, klik tombol di atas untuk mengubah gender dan melihat gaya rambut yang sesuai.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent>
              {hairStyleOptions.length > 0 ? (
                <EnhancementOptions
                  imageUrl={imageUrl}
                  imagePath={imagePath}
                  classification={classification || 'beauty'}
                  options={hairStyleOptions}
                  selectedEnhancements={selectedEnhancements}
                  onSelect={setSelectedEnhancements}
                  onGenerate={handleGenerate}
                  onBack={handleBack}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  profile={profile}
                  showHairColorPicker={true}
                  showMakeupDetails={false}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tidak ada hair style enhancement tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Upload Portrait Photo</CardTitle>
              <CardDescription>
                Upload foto portrait untuk hair style transformation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartImageUploader
                selectedEnhancement={selectedEnhancements[0] || null}
                onImageUploaded={handleImageUploaded}
                profile={profile}
                classifyFunction="classify-hairstyle"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
