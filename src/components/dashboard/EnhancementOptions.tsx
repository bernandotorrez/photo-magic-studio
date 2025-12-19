import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wand2, Loader2, Check, Sparkles, Image as ImageIcon, Type, Upload } from 'lucide-react';

interface Profile {
  monthly_generate_limit: number;
  current_month_generates: number;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

interface EnhancementOptionsProps {
  imageUrl: string;
  imagePath: string;
  classification: string;
  options: string[];
  selectedEnhancements: string[];
  onSelect: (enhancements: string[]) => void;
  onGenerate: (results: GeneratedResult[]) => void;
  onBack: () => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  profile: Profile | null;
}

type WatermarkType = 'none' | 'text' | 'logo';

export function EnhancementOptions({
  imageUrl,
  imagePath,
  classification,
  options,
  selectedEnhancements,
  onSelect,
  onGenerate,
  onBack,
  isGenerating,
  setIsGenerating,
  profile,
}: EnhancementOptionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Watermark state
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('none');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkLogo, setWatermarkLogo] = useState<File | null>(null);
  const [watermarkLogoPreview, setWatermarkLogoPreview] = useState<string | null>(null);

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setWatermarkLogo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setWatermarkLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] },
    maxFiles: 1,
    disabled: isGenerating,
  });

  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  const handleToggleEnhancement = (enhancement: string) => {
    if (selectedEnhancements.includes(enhancement)) {
      onSelect(selectedEnhancements.filter(e => e !== enhancement));
    } else {
      onSelect([...selectedEnhancements, enhancement]);
    }
  };

  const handleGenerate = async () => {
    if (selectedEnhancements.length === 0 || !user) return;
    
    // Check if user has enough remaining generations
    if (profile) {
      const remaining = profile.monthly_generate_limit - profile.current_month_generates;
      if (remaining < selectedEnhancements.length) {
        toast({
          title: 'Kuota Tidak Cukup',
          description: `Anda memilih ${selectedEnhancements.length} enhancement tapi sisa kuota hanya ${remaining}. Kurangi pilihan atau upgrade paket.`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: selectedEnhancements.length });

    try {
      // Upload watermark logo if present
      let watermarkLogoUrl: string | null = null;
      if (watermarkType === 'logo' && watermarkLogo) {
        const fileName = `${user.id}/watermarks/${Date.now()}-${watermarkLogo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('upload-images')
          .upload(fileName, watermarkLogo);

        if (uploadError) {
          console.error('Error uploading watermark logo:', uploadError);
        } else {
          const { data: signedUrl } = await supabase.storage
            .from('upload-images')
            .createSignedUrl(fileName, 3600);
          watermarkLogoUrl = signedUrl?.signedUrl || null;
        }
      }

      const results: GeneratedResult[] = [];
      
      // Generate images sequentially (to respect rate limits)
      for (let i = 0; i < selectedEnhancements.length; i++) {
        const enhancement = selectedEnhancements[i];
        setGenerationProgress({ current: i + 1, total: selectedEnhancements.length });

        const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
          body: {
            originalImagePath: imagePath,
            classification,
            enhancement,
            watermark: watermarkType !== 'none' ? {
              type: watermarkType,
              text: watermarkType === 'text' ? watermarkText : undefined,
              logoUrl: watermarkLogoUrl,
            } : undefined,
          },
        });

        if (error) {
          if (error.message?.includes('Rate limit')) {
            toast({
              title: 'Rate Limit',
              description: 'Anda hanya bisa generate 5 kali per menit. Tunggu sebentar...',
              variant: 'destructive',
            });
            // Wait 60 seconds and retry
            await new Promise(resolve => setTimeout(resolve, 60000));
            i--; // Retry this enhancement
            continue;
          }
          throw error;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        results.push({
          enhancement,
          url: data.generatedImageUrl,
        });
      }

      onGenerate(results);

      toast({
        title: 'Generate Berhasil!',
        description: `${results.length} gambar berhasil di-generate`,
      });
    } catch (error: any) {
      console.error('Generate error:', error);
      toast({
        title: 'Generate Gagal',
        description: error.message || 'Terjadi kesalahan saat generate gambar',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0 });
    }
  };

  const tokensNeeded = selectedEnhancements.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isGenerating} className="text-xs sm:text-sm">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Kembali
        </Button>
        <Badge variant="secondary" className="text-xs sm:text-sm">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
          {classification}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Preview Image */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">Gambar Original</h3>
          <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
            <img 
              src={imageUrl} 
              alt="Original" 
              className="w-full h-auto max-h-60 sm:max-h-80 object-contain"
            />
          </div>
        </div>

        {/* Enhancement Options */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">Pilih Enhancement (bisa pilih lebih dari 1)</h3>
            {tokensNeeded > 0 && (
              <Badge variant="outline" className="text-xs w-fit">
                {tokensNeeded} token akan digunakan
              </Badge>
            )}
          </div>
          <div className="grid gap-2 max-h-64 sm:max-h-80 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedEnhancements.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleToggleEnhancement(option)}
                  disabled={isGenerating}
                  className={`
                    p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/50'
                    }
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base break-words">{option}</span>
                    {isSelected && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Watermark Options */}
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-xl border border-border bg-muted/20">
        <h3 className="font-medium text-xs sm:text-sm">Opsi Watermark (Opsional)</h3>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={watermarkType === 'none' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWatermarkType('none')}
            disabled={isGenerating}
            className="text-xs sm:text-sm flex-1 sm:flex-none min-w-[100px]"
          >
            <span className="hidden xs:inline">Tanpa </span>Watermark
          </Button>
          <Button
            variant={watermarkType === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWatermarkType('text')}
            disabled={isGenerating}
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <Type className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Text
          </Button>
          <Button
            variant={watermarkType === 'logo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWatermarkType('logo')}
            disabled={isGenerating}
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Logo
          </Button>
        </div>

        {watermarkType === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="watermark-text">Text Watermark</Label>
            <Input
              id="watermark-text"
              placeholder="Masukkan text watermark..."
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        )}

        {watermarkType === 'logo' && (
          <div className="space-y-2">
            <Label>Logo Watermark</Label>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              {watermarkLogoPreview ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={watermarkLogoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                  <span className="text-sm text-muted-foreground">Klik untuk ganti logo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isDragActive ? 'Drop logo di sini' : 'Drag & drop logo atau klik untuk upload'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-3 sm:pt-4 border-t border-border">
        <Button
          variant="hero"
          size="default"
          onClick={handleGenerate}
          disabled={selectedEnhancements.length === 0 || isGenerating}
          className="w-full sm:w-auto text-sm sm:text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="hidden xs:inline">Generating </span>{generationProgress.current}/{generationProgress.total}...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate {tokensNeeded > 0 ? `${tokensNeeded} ` : ''}<span className="hidden xs:inline">Gambar</span>
            </>
          )}
        </Button>
      </div>

      {profile && (
        <p className="text-xs text-muted-foreground text-center px-2">
          Sisa generate: {profile.monthly_generate_limit - profile.current_month_generates} dari {profile.monthly_generate_limit}
        </p>
      )}
    </div>
  );
}
