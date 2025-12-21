import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Zap,
  History, 
  Key,
  Image as ImageIcon,
  AlertCircle,
  Coins
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

export default function DashboardNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    
    if (data) {
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

          <TabsContent value="generate" className="space-y-4">
            {/* Token Expired/Expiring Soon Alert */}
            {profile && profile.subscription_expires_at && (() => {
              const expiresAt = new Date(profile.subscription_expires_at);
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry <= 0 && profile.subscription_tokens > 0) {
                return (
                  <Alert className="border-red-500/50 bg-red-500/5">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-500">Token Bulanan Sudah Expired</AlertTitle>
                    <AlertDescription className="space-y-3">
                      <p>
                        Token bulanan Anda sebanyak <strong>{profile.subscription_tokens}</strong> sudah expired dan akan dihapus otomatis. 
                        Token top-up Anda (<strong>{profile.purchased_tokens}</strong>) masih aktif dan tidak akan hangus.
                      </p>
                      <Button 
                        onClick={() => navigate('/top-up')}
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Top Up Token Sekarang
                      </Button>
                    </AlertDescription>
                  </Alert>
                );
              } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 7 && profile.subscription_tokens > 0) {
                return (
                  <Alert className="border-yellow-500/50 bg-yellow-500/5">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Token Bulanan Akan Segera Expired</AlertTitle>
                    <AlertDescription className="space-y-3">
                      <p>
                        Token bulanan Anda sebanyak <strong>{profile.subscription_tokens}</strong> akan expired dalam <strong>{daysUntilExpiry} hari</strong> ({expiresAt.toLocaleDateString('id-ID')}). 
                        Gunakan sebelum hangus! Token top-up Anda (<strong>{profile.purchased_tokens}</strong>) tidak akan hangus.
                      </p>
                      <Button 
                        onClick={() => navigate('/top-up')}
                        size="sm"
                        variant="outline"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Top Up Token Tambahan
                      </Button>
                    </AlertDescription>
                  </Alert>
                );
              }
              return null;
            })()}

            {/* No Tokens Alert */}
            {profile && (profile.subscription_tokens + profile.purchased_tokens) <= 0 && (
              <Alert className="border-red-500/50 bg-red-500/5">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-500">Token Habis</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>
                    Token Anda sudah habis. Silakan top up untuk melanjutkan generate gambar.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate('/top-up')}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Top Up Token Sekarang
                    </Button>
                    <Button 
                      onClick={() => navigate('/payment-history')}
                      size="sm"
                      variant="outline"
                    >
                      Lihat Riwayat Pembayaran
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Low Tokens Warning */}
            {profile && 
             (profile.subscription_tokens + profile.purchased_tokens) > 0 &&
             (profile.subscription_tokens + profile.purchased_tokens) <= 5 && (
              <Alert className="border-yellow-500/50 bg-yellow-500/5">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">Token Hampir Habis</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>
                    Sisa token Anda: <strong>{profile.subscription_tokens}</strong> token bulanan + <strong>{profile.purchased_tokens}</strong> token top-up = <strong>{profile.subscription_tokens + profile.purchased_tokens}</strong> total.
                  </p>
                  <Button 
                    onClick={() => navigate('/top-up')}
                    size="sm"
                    variant="outline"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Top Up Token
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="border-blue-500/50 bg-blue-500/5">
              <ImageIcon className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-500">Produk yang Didukung</AlertTitle>
              <AlertDescription>
                Optimasi gambar untuk produk e-commerce seperti <strong>baju, jaket, sweater, dress, celana, sepatu, tas, dompet, aksesoris, jam tangan, kalung, gelang, cincin, topi, kacamata, produk kecantikan (parfum, skin care, dll)</strong>, dan produk fashion lainnya.
              </AlertDescription>
            </Alert>

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
                    classifyFunction="classify-fashion"
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
