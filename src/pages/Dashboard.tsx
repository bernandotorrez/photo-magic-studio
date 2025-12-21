import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/Logo';
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
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
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
  const [enhancementOptions, setEnhancementOptions] = useState<any[]>([]); // Support both object[] and string[]
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
        description: 'Selamat datang di PixelNova AI. Akun Anda sudah aktif.',
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
      .select('id, full_name, subscription_plan, subscription_tokens, purchased_tokens, subscription_expires_at, is_admin')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
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
        <div className="container mx-auto px-3 sm:px-4 h-20 sm:h-24 flex items-center justify-between gap-2">
          <div className="flex items-center">
            <Logo size="lg" />
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

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 sm:py-6 px-3 sm:px-4 mt-8">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Butuh Bantuan? Hubungi WhatsApp{' '}
              <a 
                href="https://wa.me/6289687610639" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                +62 896-8761-0639
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
