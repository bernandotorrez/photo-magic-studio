import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wand2, Loader2, Check, Sparkles, Image as ImageIcon, Type, Upload, Download } from 'lucide-react';

interface EnhancementOption {
  id: string;
  enhancement_type: string;
  display_name: string;
  description?: string;
  is_default?: boolean;
  is_featured?: boolean;
}

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface GeneratedResult {
  enhancement: string;
  url: string;
}

interface EnhancementOptionsProps {
  imageUrl: string;
  imagePath: string;
  classification: string;
  options: EnhancementOption[] | string[]; // Support both new and legacy format
  selectedEnhancements: string[];
  onSelect: (enhancements: string[]) => void;
  onGenerate: (results: GeneratedResult[]) => void;
  onBack: () => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  profile: Profile | null;
  showHairColorPicker?: boolean; // NEW: Show hair color picker
  showMakeupDetails?: boolean; // NEW: Show makeup details
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
  showHairColorPicker = false,
  showMakeupDetails = false,
}: EnhancementOptionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Watermark state
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('none');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkLogo, setWatermarkLogo] = useState<File | null>(null);
  const [watermarkLogoPreview, setWatermarkLogoPreview] = useState<string | null>(null);
  
  // Custom input state
  const [customPose, setCustomPose] = useState('');
  const [customFurniture, setCustomFurniture] = useState('');
  const [customMakeup, setCustomMakeup] = useState('');
  const [customHairColor, setCustomHairColor] = useState('');
  
  // Generated result state
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);

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

  const handleToggleEnhancement = (enhancementId: string) => {
    // Check if this is a hair style enhancement (single selection only)
    const isHairStyle = classification === 'beauty' && 
      (enhancementId.toLowerCase().includes('hair_style') || 
       enhancementId.toLowerCase().includes('hairstyle'));
    
    if (isHairStyle) {
      // For hair style: single selection only
      if (selectedEnhancements.includes(enhancementId)) {
        // Deselect if already selected
        onSelect(selectedEnhancements.filter(e => e !== enhancementId));
      } else {
        // Replace any existing hair style selection with this one
        const otherSelections = selectedEnhancements.filter(e => 
          !e.toLowerCase().includes('hair_style') && 
          !e.toLowerCase().includes('hairstyle')
        );
        onSelect([...otherSelections, enhancementId]);
      }
    } else {
      // For other enhancements: multiple selection
      if (selectedEnhancements.includes(enhancementId)) {
        onSelect(selectedEnhancements.filter(e => e !== enhancementId));
      } else {
        onSelect([...selectedEnhancements, enhancementId]);
      }
    }
  };

  const handleGenerate = async () => {
    if (selectedEnhancements.length === 0 || !user) return;
    
    // Check if user has enough tokens (dual token system)
    if (profile) {
      const totalTokens = (profile.subscription_tokens || 0) + (profile.purchased_tokens || 0);
      if (totalTokens < 1) {
        toast({
          title: 'Token Habis',
          description: 'Token Anda sudah habis. Silakan top up untuk melanjutkan.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsGenerating(true);

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

      // Combine all selected enhancements into one prompt
      // Check if options are objects with IDs (new format) or strings (legacy)
      const isNewFormat = options.length > 0 && typeof options[0] === 'object' && 'id' in options[0];
      
      let enhancementIds: string[] = [];
      let combinedEnhancement = '';
      
      if (isNewFormat) {
        // New format: send enhancement IDs
        enhancementIds = selectedEnhancements;
        // Get display names for the combined enhancement string
        const selectedOptions = (options as EnhancementOption[]).filter(opt => 
          selectedEnhancements.includes(opt.id)
        );
        combinedEnhancement = selectedOptions.map(opt => opt.display_name).join(', ');
      } else {
        // Legacy format: send enhancement strings
        combinedEnhancement = selectedEnhancements.join(', ');
      }

      const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
        body: {
          originalImagePath: imagePath,
          classification,
          ...(isNewFormat ? { enhancementIds } : { enhancement: combinedEnhancement }),
          customPose: customPose || undefined,
          customFurniture: customFurniture || undefined,
          customMakeup: customMakeup || undefined,
          customHairColor: customHairColor || undefined,
          watermark: watermarkType !== 'none' ? {
            type: watermarkType,
            text: watermarkType === 'text' ? watermarkText : undefined,
            logoUrl: watermarkLogoUrl,
          } : undefined,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        if (error.message?.includes('Rate limit')) {
          toast({
            title: 'Rate Limit',
            description: 'Anda hanya bisa generate 5 kali per menit. Tunggu sebentar...',
            variant: 'destructive',
          });
          throw new Error('Rate limit exceeded');
        }
        if (error.message?.includes('Token')) {
          toast({
            title: 'Token Habis',
            description: 'Token Anda sudah habis. Silakan top up untuk melanjutkan.',
            variant: 'destructive',
          });
          throw new Error('Insufficient tokens');
        }
        if (error.message?.includes('Enhancement not found')) {
          toast({
            title: 'Enhancement Tidak Ditemukan',
            description: 'Enhancement yang dipilih tidak tersedia. Silakan refresh halaman.',
            variant: 'destructive',
          });
          throw new Error('Enhancement not found');
        }
        toast({
          title: 'Generate Gagal',
          description: error.message || 'Terjadi kesalahan saat generate. Silakan coba lagi.',
          variant: 'destructive',
        });
        throw error;
      }

      if (data.error) {
        console.error('API error:', data.error, data.details);
        toast({
          title: 'Generate Gagal',
          description: data.error || 'Terjadi kesalahan saat generate.',
          variant: 'destructive',
        });
        throw new Error(data.error);
      }

      // Return single result with combined enhancement
      const results: GeneratedResult[] = [{
        enhancement: combinedEnhancement,
        url: data.generatedImageUrl,
      }];

      // Set local state for preview
      setGeneratedResult(results[0]);

      onGenerate(results);

      toast({
        title: 'Generate Berhasil!',
        description: `Gambar dengan ${selectedEnhancements.length} enhancement berhasil di-generate`,
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
    }
  };

  const handleDownload = async (url: string, enhancement: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `enhanced-${enhancement.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const tokensNeeded = selectedEnhancements.length > 0 ? 1 : 0;

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

      {/* Main Layout: Original+Watermark (left) + Options/Result (right) */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Original Image + Watermark Options + Generate Button */}
        <div className="space-y-4 sm:space-y-6">
          {/* Original Image */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">Gambar Original</h3>
            <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
              <img 
                src={imageUrl} 
                alt="Original" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Custom Input Options */}
          {(classification === 'person' || classification === 'interior' || (classification === 'beauty' && (showHairColorPicker || showMakeupDetails))) && (
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-xl border border-border bg-muted/20">
              <h3 className="font-medium text-xs sm:text-sm">
                {classification === 'person' && 'Custom Pose (Opsional)'}
                {classification === 'interior' && 'Custom Furniture Items (Opsional)'}
                {classification === 'beauty' && 'Custom Options (Opsional)'}
              </h3>
              
              {classification === 'person' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-pose">Deskripsi Pose yang Diinginkan</Label>
                  <Input
                    id="custom-pose"
                    placeholder="Contoh: standing with arms crossed, smiling confidently"
                    value={customPose}
                    onChange={(e) => setCustomPose(e.target.value)}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk pose random. Isi untuk pose spesifik yang Anda inginkan.
                  </p>
                </div>
              )}
              
              {classification === 'interior' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-furniture">Item Furniture yang Diinginkan</Label>
                  <Input
                    id="custom-furniture"
                    placeholder="Contoh: sofa, meja TV, rak buku, lemari, karpet"
                    value={customFurniture}
                    onChange={(e) => setCustomFurniture(e.target.value)}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk furniture otomatis. Isi untuk menentukan item furniture spesifik (pisahkan dengan koma).
                  </p>
                </div>
              )}
              
              {classification === 'beauty' && (
                <>
                  {/* Hair Color Picker - Only show if enabled */}
                  {showHairColorPicker && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-hair-color">✂️ Custom Hair Color (Warna Rambut)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-hair-color"
                          type="color"
                          value={customHairColor || '#000000'}
                          onChange={(e) => setCustomHairColor(e.target.value)}
                          disabled={isGenerating}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          placeholder="atau ketik: blonde, brown, red, black, etc"
                          value={customHairColor}
                          onChange={(e) => setCustomHairColor(e.target.value)}
                          disabled={isGenerating}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ✂️ Pilih warna dari color picker atau ketik nama warna (blonde, brown, red, black, burgundy, platinum, etc). 
                        Kosongkan untuk warna default.
                      </p>
                    </div>
                  )}

                  {/* Makeup Details - Only show if enabled */}
                  {showMakeupDetails && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-makeup">💄 Custom Makeup Details</Label>
                      <Input
                        id="custom-makeup"
                        placeholder="Contoh: red lipstick, smokey eyes, pink blush"
                        value={customMakeup}
                        onChange={(e) => setCustomMakeup(e.target.value)}
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-muted-foreground">
                        💄 Tentukan warna lipstik (red, pink, nude), style eyeshadow (smokey, natural, glitter), 
                        warna blush (pink, peach, coral), atau detail makeup lainnya.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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

          {/* Generate Button - Centered */}
          <div className="flex flex-col items-center gap-3 pt-3 sm:pt-4 border-t border-border">
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
                  <span className="hidden xs:inline">Generating...</span>
                  <span className="xs:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate <span className="hidden xs:inline">Gambar </span>
                  ({selectedEnhancements.length} enhancement{selectedEnhancements.length > 1 ? 's' : ''})
                </>
              )}
            </Button>

            {profile && (
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground px-2">
                  Sisa token: {(profile.subscription_tokens || 0) + (profile.purchased_tokens || 0)} token
                  {profile.subscription_tokens > 0 && profile.purchased_tokens > 0 && (
                    <span className="block mt-1">
                      ({profile.subscription_tokens} bulanan + {profile.purchased_tokens} top-up)
                    </span>
                  )}
                </p>
                {isGenerating && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium px-2">
                    ⏱️ Proses generate membutuhkan waktu 20 Detik sampai 5 Menit (paling lama) untuk hasil yang Optimal
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Enhancement Options OR Generated Result */}
        {!generatedResult ? (
          /* Show Enhancement Options before generate */
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">
                Pilih Enhancement {selectedEnhancements.length > 0 && `(${selectedEnhancements.length} dipilih)`}
              </h3>
              {tokensNeeded > 0 && (
                <Badge variant="outline" className="text-xs w-fit">
                  {tokensNeeded} token akan digunakan
                </Badge>
              )}
            </div>
            <div className="grid gap-2 max-h-[600px] overflow-y-auto">
              {options.map((option) => {
                // Support both new format (object with id) and legacy format (string)
                const isNewFormat = typeof option === 'object' && 'id' in option;
                const optionId = isNewFormat ? option.id : option;
                const optionDisplay = isNewFormat ? option.display_name : option;
                const optionDescription = isNewFormat ? option.description : undefined;
                const isFeatured = isNewFormat ? option.is_featured : false;
                
                const isSelected = selectedEnhancements.includes(optionId);
                return (
                  <button
                    key={optionId}
                    onClick={() => handleToggleEnhancement(optionId)}
                    disabled={isGenerating}
                    className={`
                      p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : isFeatured
                        ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/50'
                        : 'border-border hover:border-primary/50'
                      }
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm sm:text-base break-words">{optionDisplay}</span>
                          {isFeatured && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Unggulan
                            </Badge>
                          )}
                        </div>
                        {optionDescription && (
                          <span className="text-xs text-muted-foreground mt-1 block">{optionDescription}</span>
                        )}
                      </div>
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
        ) : (
          /* Show Generated Result after generate */
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">Hasil Generate</h3>
              <Badge variant="secondary" className="text-xs">
                {selectedEnhancements.length} enhancement
              </Badge>
            </div>
            <div className="rounded-xl overflow-hidden border-2 border-primary bg-primary/5">
              <div className="p-2 bg-background/80 border-b border-border">
                <Badge variant="outline" className="text-xs truncate max-w-full block">
                  {generatedResult.enhancement}
                </Badge>
              </div>
              <div className="p-4 bg-muted/30">
                <img 
                  src={generatedResult.url} 
                  alt="Generated" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="p-3 bg-background/80 border-t border-border flex gap-2">
                <Button
                  onClick={() => handleDownload(generatedResult.url, generatedResult.enhancement)}
                  variant="hero"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setGeneratedResult(null)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Ulang
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
