import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Upload, 
  History, 
  Key, 
  LogOut, 
  Zap,
  Image as ImageIcon,
  Shield
} from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { EnhancementOptions } from '@/components/dashboard/EnhancementOptions';
import { GenerationResult } from '@/components/dashboard/GenerationResult';
import { GenerationHistory } from '@/components/dashboard/GenerationHistory';
import { ApiKeyManager } from '@/components/dashboard/ApiKeyManager';
import { UsageStats } from '@/components/dashboard/UsageStats';
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

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('generate');
  
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
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base sm:text-lg">EnhanceAI</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <UsageStats profile={profile} />
            {profile?.is_admin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin')}
                className="px-2 sm:px-3"
              >
                <Shield className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              Selamat Datang, {profile?.full_name || 'User'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Mulai enhance foto produk Anda dengan AI
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <span className="hidden xs:inline">API Keys</span>
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
      </main>
    </div>
  );
}
