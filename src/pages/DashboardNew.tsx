import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  History, 
  Key,
  Image as ImageIcon
} from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { GenerationHistory } from '@/components/dashboard/GenerationHistory';
import { ApiKeyManager } from '@/components/dashboard/ApiKeyManager';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  subscription_plan: string;
  monthly_generate_limit: number;
  current_month_generates: number;
  is_admin: boolean;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

type GenerationStep = 'upload' | 'options' | 'result';

export default function DashboardNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Get active tab from URL or default to 'generate'
  const activeTab = searchParams.get('tab') || 'generate';
  
  // Generation flow state
  const [step, setStep] = useState<GenerationStep>('upload');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [enhancementOptions, setEnhancementOptions] = useState<string[]>([]);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for email verification success
  useEffect(() => {
    const emailVerified = sessionStorage.getItem('emailVerified');
    if (emailVerified === 'true') {
      sessionStorage.removeItem('emailVerified');
      toast({
        title: '✅ Email Berhasil Diverifikasi!',
        description: 'Selamat datang di EnhanceAI. Akun Anda sudah aktif.',
        duration: 5000,
      });
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data && user.email) {
      // Get actual generation count by email
      const { data: emailCount } = await supabase
        .rpc('get_generation_count_by_email', { p_email: user.email });
      
      // Update profile with email-based count
      setProfile({
        ...data,
        current_month_generates: emailCount || 0
      });
    } else if (data) {
      setProfile(data);
    }
  };

  const resetGeneration = () => {
    setStep('upload');
    setUploadedImageUrl(null);
    setUploadedImagePath(null);
    setClassification(null);
    setEnhancementOptions([]);
    setSelectedEnhancements([]);
    setGeneratedResults([]);
  };

  const handleImageUploaded = (url: string, path: string, classResult: string, options: string[]) => {
    setUploadedImageUrl(url);
    setUploadedImagePath(path);
    setClassification(classResult);
    setEnhancementOptions(options);
    setStep('options');
  };

  const handleEnhancementsSelected = (enhancements: string[]) => {
    setSelectedEnhancements(enhancements);
  };

  const handleGenerated = (results: GeneratedResult[]) => {
    setGeneratedResults(results);
    setStep('result');
    fetchProfile(); // Refresh usage stats
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="generate" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Riwayat</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">API</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Enhance Gambar
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Upload gambar, pilih enhancement, dan generate hasil yang amazing!
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {step === 'upload' && (
                  <ImageUploader 
                    onImageUploaded={handleImageUploaded}
                    profile={profile}
                  />
                )}
                
                {step === 'options' && uploadedImageUrl && (
                  <EnhancementOptions
                    imageUrl={uploadedImageUrl}
                    imagePath={uploadedImagePath!}
                    classification={classification!}
                    options={enhancementOptions}
                    selectedEnhancements={selectedEnhancements}
                    onSelect={handleEnhancementsSelected}
                    onGenerate={handleGenerated}
                    onBack={resetGeneration}
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                    profile={profile}
                  />
                )}
                
                {step === 'result' && generatedResults.length > 0 && (
                  <GenerationResult
                    originalUrl={uploadedImageUrl!}
                    results={generatedResults}
                    onRegenerate={() => setStep('options')}
                    onNewImage={resetGeneration}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <GenerationHistory />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
