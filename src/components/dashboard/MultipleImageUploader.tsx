import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Loader2, Link as LinkIcon, X, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface UploadedImage {
  url: string;
  path: string;
  preview: string;
}

interface MultipleImageUploaderProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  profile: Profile | null;
  minImages: number;
  maxImages: number;
  description?: string;
}

export function MultipleImageUploader({ 
  onImagesUploaded, 
  profile, 
  minImages,
  maxImages,
  description 
}: MultipleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has tokens
  const subscriptionTokens = profile?.subscription_tokens || 0;
  const purchasedTokens = profile?.purchased_tokens || 0;
  const totalTokens = subscriptionTokens + purchasedTokens;
  const canGenerate = !profile || totalTokens > 0;

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    if (!user) throw new Error('User not authenticated');

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('upload-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get signed URL for the uploaded image
    const { data: signedUrlData } = await supabase.storage
      .from('upload-images')
      .createSignedUrl(fileName, 3600); // 1 hour

    if (!signedUrlData?.signedUrl) throw new Error('Failed to get signed URL');

    return {
      url: signedUrlData.signedUrl,
      path: fileName,
      preview: URL.createObjectURL(file)
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const error = rejection.errors[0];
      
      if (error.code === 'file-too-large') {
        toast({
          title: 'File Terlalu Besar',
          description: 'Ukuran file maksimal 2MB per gambar.',
          variant: 'destructive',
        });
      } else if (error.code === 'file-invalid-type') {
        toast({
          title: 'Format File Tidak Valid',
          description: 'Hanya file PNG, JPG, JPEG, dan WebP yang diperbolehkan.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Upload Gagal',
          description: error.message || 'File tidak dapat diupload.',
          variant: 'destructive',
        });
      }
      return;
    }

    if (!user) return;

    // Check if adding these files would exceed max
    if (uploadedImages.length + acceptedFiles.length > maxImages) {
      toast({
        title: 'Terlalu Banyak Gambar',
        description: `Maksimal ${maxImages} gambar. Anda sudah upload ${uploadedImages.length} gambar.`,
        variant: 'destructive',
      });
      return;
    }

    // Check token limit
    if (profile && !canGenerate) {
      toast({
        title: 'Token Habis',
        description: `Token Anda sudah habis. Silakan top up untuk melanjutkan.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload all files
      const uploadPromises = acceptedFiles.map(file => uploadFile(file));
      const newImages = await Promise.all(uploadPromises);
      
      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onImagesUploaded(updatedImages);

      toast({
        title: 'Gambar Berhasil Diupload',
        description: `${acceptedFiles.length} gambar berhasil diupload. Total: ${updatedImages.length}/${maxImages}`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Gagal',
        description: error.message || 'Terjadi kesalahan saat upload gambar',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, uploadedImages, maxImages, canGenerate, onImagesUploaded, toast, profile]);

  const handleUrlUpload = async () => {
    if (!imageUrl.trim() || !user) return;

    // Check if adding this would exceed max
    if (uploadedImages.length >= maxImages) {
      toast({
        title: 'Maksimal Gambar Tercapai',
        description: `Maksimal ${maxImages} gambar.`,
        variant: 'destructive',
      });
      return;
    }

    // Check token limit
    if (profile && !canGenerate) {
      toast({
        title: 'Token Habis',
        description: `Token Anda sudah habis. Silakan top up untuk melanjutkan.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      toast({
        title: 'URL Tidak Valid',
        description: 'Masukkan URL gambar yang valid',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Download image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Gagal mengunduh gambar dari URL');
      
      const blob = await response.blob();
      
      // Check file size (max 2MB)
      if (blob.size > 2 * 1024 * 1024) {
        throw new Error('Ukuran gambar terlalu besar (max 2MB)');
      }

      // Check if it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL bukan gambar yang valid');
      }

      // Convert blob to file
      const file = new File([blob], 'image.jpg', { type: blob.type });
      const newImage = await uploadFile(file);
      
      const updatedImages = [...uploadedImages, newImage];
      setUploadedImages(updatedImages);
      onImagesUploaded(updatedImages);

      toast({
        title: 'Gambar Berhasil Diupload',
        description: `Total: ${updatedImages.length}/${maxImages}`,
      });
      
      setImageUrl('');
    } catch (error: any) {
      console.error('URL upload error:', error);
      
      let errorTitle = 'Upload Gagal';
      let errorDescription = error.message || 'Terjadi kesalahan saat upload gambar dari URL';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorTitle = 'Link Tidak Bisa Diakses';
        errorDescription = 'Website tersebut memblokir akses langsung ke gambar. Silakan download gambar terlebih dahulu.';
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesUploaded(updatedImages);
    
    toast({
      title: 'Gambar Dihapus',
      description: `Sisa: ${updatedImages.length}/${maxImages}`,
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: maxImages - uploadedImages.length,
    maxSize: 2 * 1024 * 1024, // 2MB
    disabled: isUploading || uploadedImages.length >= maxImages || (profile && !canGenerate),
    multiple: true,
  });

  const canUploadMore = uploadedImages.length < maxImages;
  const hasMinimum = uploadedImages.length >= minImages;

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <Alert>
        <ImageIcon className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">
              Upload {minImages === maxImages ? minImages : `${minImages}-${maxImages}`} gambar
            </p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <p className="text-sm">
              Progress: <span className={hasMinimum ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                {uploadedImages.length}/{maxImages}
              </span>
              {!hasMinimum && (
                <span className="text-muted-foreground ml-2">
                  (Minimal {minImages} gambar)
                </span>
              )}
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Token Warning */}
      {profile && !canGenerate && (
        <Alert variant="destructive">
          <AlertDescription>
            Token Anda sudah habis. Silakan top up untuk melanjutkan.
          </AlertDescription>
        </Alert>
      )}

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image.preview} 
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-border"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              Dari URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${isUploading || !canUploadMore || (profile && !canGenerate) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-medium">Mengupload...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {isDragActive ? (
                      <ImageIcon className="w-6 h-6 text-primary" />
                    ) : (
                      <Plus className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isDragActive ? 'Lepaskan gambar di sini' : 'Tambah gambar'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG, WebP (Max 2MB per file)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bisa upload multiple sekaligus
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL Gambar</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isUploading || !canUploadMore || (profile && !canGenerate)}
                />
                <p className="text-xs text-muted-foreground">
                  Masukkan URL gambar yang valid (PNG, JPG, JPEG, WebP - Max 2MB)
                </p>
              </div>
              
              <Button 
                onClick={handleUrlUpload}
                disabled={!imageUrl.trim() || isUploading || !canUploadMore || (profile && !canGenerate)}
                className="w-full"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah dari URL
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Status Message */}
      {!canUploadMore && (
        <Alert>
          <AlertDescription>
            Maksimal {maxImages} gambar tercapai. Hapus gambar jika ingin mengganti.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
