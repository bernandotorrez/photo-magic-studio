import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Loader2, Link as LinkIcon, Camera, Info, SwitchCamera } from 'lucide-react';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface ImageUploaderProps {
  onImageUploaded: (url: string, path: string, classification: string, options: any[], responseData?: any) => void; // Support both object[] and string[]
  onMultipleImagesUploaded?: (images: Array<{url: string, path: string}>) => void; // For multiple images
  profile: Profile | null;
  classifyFunction?: string; // Edge function name for classification
  selectedEnhancement?: string | null; // To check if multiple images needed
}

export function ImageUploader({ 
  onImageUploaded, 
  onMultipleImagesUploaded,
  profile, 
  classifyFunction = 'classify-image',
  selectedEnhancement 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url' | 'camera'>('file');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); // 'user' = depan, 'environment' = belakang
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper function to classify image
  const classifyImage = async (imageUrl: string) => {
    console.log('Calling classify function:', classifyFunction);
    const { data, error } = await supabase.functions.invoke(classifyFunction, {
      body: { imageUrl },
    });

    if (error) {
      console.error('Classification error:', error);
      throw error;
    }

    console.log('Classification response:', data);
    return data;
  };

  // Check if user has tokens
  const subscriptionTokens = profile?.subscription_tokens || 0;
  const purchasedTokens = profile?.purchased_tokens || 0;
  const totalTokens = subscriptionTokens + purchasedTokens;
  const canGenerate = !profile || totalTokens > 0; // Allow during loading or if has tokens

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files (too large, wrong format, etc.)
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const error = rejection.errors[0];
      
      if (error.code === 'file-too-large') {
        toast({
          title: 'File Terlalu Besar',
          description: 'Ukuran file maksimal 2MB. Silakan kompres gambar terlebih dahulu.',
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

    const file = acceptedFiles[0];
    if (!file || !user) return;

    // Check limit only if profile is loaded
    if (profile && !canGenerate) {
      toast({
        title: 'Token Habis',
        description: `Token Anda sudah habis (${subscriptionTokens} bulanan + ${purchasedTokens} top-up = ${totalTokens} total). Silakan top up untuk melanjutkan.`,
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('upload-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL for the uploaded image
      const { data: signedUrlData } = await supabase.storage
        .from('upload-images')
        .createSignedUrl(fileName, 3600); // 1 hour

      if (!signedUrlData?.signedUrl) throw new Error('Failed to get signed URL');

      // Call edge function for classification
      const classificationData = await classifyImage(signedUrlData.signedUrl);

      onImageUploaded(
        signedUrlData.signedUrl,
        fileName,
        classificationData.classification,
        classificationData.enhancementOptions,
        classificationData // Pass full response data
      );

      toast({
        title: 'Gambar Berhasil Diupload',
        description: `Terdeteksi sebagai: ${classificationData.classification}`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Gagal',
        description: error.message || 'Terjadi kesalahan saat upload gambar',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [user, canGenerate, onImageUploaded, toast, classifyImage]);

  const handleUrlUpload = async () => {
    if (!imageUrl.trim() || !user) return;

    // Check limit only if profile is loaded
    if (profile && !canGenerate) {
      toast({
        title: 'Token Habis',
        description: `Token Anda sudah habis (${subscriptionTokens} bulanan + ${purchasedTokens} top-up = ${totalTokens} total). Silakan top up untuk melanjutkan.`,
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

    setPreview(imageUrl);
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

      // Upload to Supabase Storage
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('upload-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get signed URL for the uploaded image
      const { data: signedUrlData } = await supabase.storage
        .from('upload-images')
        .createSignedUrl(fileName, 3600); // 1 hour

      if (!signedUrlData?.signedUrl) throw new Error('Failed to get signed URL');

      // Call edge function for classification
      const classificationData = await classifyImage(signedUrlData.signedUrl);

      onImageUploaded(
        signedUrlData.signedUrl,
        fileName,
        classificationData.classification,
        classificationData.enhancementOptions,
        classificationData // Pass full response data
      );

      toast({
        title: 'Gambar Berhasil Diupload',
        description: `Terdeteksi sebagai: ${classificationData.classification}`,
      });
      
      setImageUrl('');
    } catch (error: any) {
      console.error('URL upload error:', error);
      
      // Check for CORS error
      let errorTitle = 'Upload Gagal';
      let errorDescription = error.message || 'Terjadi kesalahan saat upload gambar dari URL';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorTitle = 'Link Tidak Bisa Diakses';
        errorDescription = 'Website tersebut memblokir akses langsung ke gambar. Silakan download gambar terlebih dahulu, lalu gunakan Upload File.';
      } else if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
        errorTitle = 'Link Tidak Bisa Diakses';
        errorDescription = 'Website tersebut memblokir akses langsung ke gambar. Silakan download gambar terlebih dahulu, lalu gunakan Upload File.';
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    disabled: isUploading || (profile && !canGenerate), // Only disable if profile loaded and limit reached
  });

  // Camera functions
  const startCamera = async () => {
    setCameraError(null);
    console.log('🎥 Starting camera...');
    console.log('🎥 videoRef.current:', videoRef.current);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode, // Use state for camera selection
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('✅ Camera stream obtained:', stream);
      console.log('✅ Stream active:', stream.active);
      console.log('✅ Video tracks:', stream.getVideoTracks());
      
      if (videoRef.current) {
        console.log('✅ Setting stream to video element');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        console.log('✅ Camera activated successfully');
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          console.log('✅ Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };
      } else {
        console.error('❌ videoRef.current is null!');
        throw new Error('Video element not found');
      }
    } catch (error: any) {
      console.error('❌ Camera error:', error);
      let errorMessage = 'Tidak dapat mengakses kamera. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Anda menolak izin akses kamera. Silakan izinkan akses kamera di pengaturan browser Anda.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'Kamera tidak ditemukan pada perangkat Anda.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Kamera sedang digunakan oleh aplikasi lain.';
      } else {
        errorMessage += error.message || 'Terjadi kesalahan saat mengakses kamera.';
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Kamera Gagal Dibuka',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const switchCamera = async () => {
    // Stop current camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Restart camera with new facing mode
    setCameraError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        toast({
          title: 'Kamera Berhasil Diubah',
          description: newFacingMode === 'user' ? 'Menggunakan kamera depan' : 'Menggunakan kamera belakang',
        });
      }
    } catch (error: any) {
      console.error('❌ Switch camera error:', error);
      setCameraError('Gagal mengganti kamera. Perangkat mungkin tidak memiliki kamera ' + (newFacingMode === 'user' ? 'depan' : 'belakang'));
      
      // Revert to previous facing mode
      setFacingMode(facingMode);
      
      toast({
        title: 'Gagal Mengganti Kamera',
        description: 'Perangkat mungkin tidak memiliki kamera ' + (newFacingMode === 'user' ? 'depan' : 'belakang'),
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !user) return;

    // Check limit only if profile is loaded
    if (profile && !canGenerate) {
      toast({
        title: 'Token Habis',
        description: `Token Anda sudah habis (${subscriptionTokens} bulanan + ${purchasedTokens} top-up = ${totalTokens} total). Silakan top up untuk melanjutkan.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create canvas to capture video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Draw current video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.95);
      });

      // Show preview
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);

      // Stop camera after capture
      stopCamera();

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('upload-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get signed URL for the uploaded image
      const { data: signedUrlData } = await supabase.storage
        .from('upload-images')
        .createSignedUrl(fileName, 3600); // 1 hour

      if (!signedUrlData?.signedUrl) throw new Error('Failed to get signed URL');

      // Call edge function for classification
      const classificationData = await classifyImage(signedUrlData.signedUrl);

      onImageUploaded(
        signedUrlData.signedUrl,
        fileName,
        classificationData.classification,
        classificationData.enhancementOptions,
        classificationData // Pass full response data
      );

      toast({
        title: 'Foto Berhasil Diambil',
        description: `Terdeteksi sebagai: ${classificationData.classification}`,
      });
    } catch (error: any) {
      console.error('Capture error:', error);
      toast({
        title: 'Gagal Mengambil Foto',
        description: error.message || 'Terjadi kesalahan saat mengambil foto',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Only show limit warning if profile is loaded and no tokens */}
      {profile && !canGenerate && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <p className="text-sm text-destructive font-medium">
            Token Anda sudah habis ({subscriptionTokens} bulanan + {purchasedTokens} top-up = {totalTokens} total).
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Silakan top up token untuk melanjutkan generate.
          </p>
        </div>
      )}

      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url' | 'camera')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <LinkIcon className="w-4 h-4" />
            Dari URL
          </TabsTrigger>
          <TabsTrigger value="camera" className="gap-2">
            <Camera className="w-4 h-4" />
            Ambil Foto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              ${isUploading || (profile && !canGenerate) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div>
                  <p className="font-medium">Mengupload & Menganalisis...</p>
                  <p className="text-sm text-muted-foreground">AI sedang mengenali gambar Anda</p>
                </div>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center gap-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg shadow-md"
                />
                <p className="text-sm text-muted-foreground">Menganalisis gambar...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {isDragActive ? (
                    <ImageIcon className="w-8 h-8 text-primary" />
                  ) : (
                    <Upload className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isDragActive ? 'Lepaskan gambar di sini' : 'Drag & drop gambar atau klik untuk upload'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG, JPEG, WebP (Max 2MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div className="space-y-4">
            {isUploading && preview ? (
              <div className="border-2 border-dashed rounded-xl p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg shadow-md"
                  />
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Menganalisis gambar...</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL Gambar</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isUploading || (profile && !canGenerate)}
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Masukkan URL gambar yang valid (PNG, JPG, JPEG, WebP - Max 2MB)
                    </p>
                    <p className="text-xs text-amber-600">
                      ⚠️ Beberapa website memblokir akses langsung. Jika gagal, download gambar lalu gunakan Upload File.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleUrlUpload}
                  disabled={!imageUrl.trim() || isUploading || (profile && !canGenerate)}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Upload dari URL
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="camera" className="mt-4">
          <div className="space-y-4">
            {/* Camera Permission Alert */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Izinkan Akses Kamera:</strong> Browser akan meminta izin akses kamera. 
                Klik "Allow" atau "Izinkan" pada popup yang muncul untuk menggunakan fitur ini.
              </AlertDescription>
            </Alert>

            {cameraError && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {cameraError}
                </AlertDescription>
              </Alert>
            )}

            {!isCameraActive ? (
              <div className="border-2 border-dashed rounded-xl p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Ambil Foto dengan Kamera</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Klik tombol di bawah untuk membuka kamera
                    </p>
                  </div>
                  <Button 
                    onClick={startCamera}
                    disabled={isUploading || (profile && !canGenerate)}
                    className="mt-2"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Buka Kamera
                  </Button>
                </div>
              </div>
            ) : null}
            
            {/* Video element - always rendered but hidden when not active */}
            <div className={isCameraActive ? 'space-y-4' : 'hidden'}>
              <div className="relative border-2 border-primary rounded-xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                  style={{ maxHeight: '400px' }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={capturePhoto}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Ambil Foto
                    </>
                  )}
                </Button>
                <Button 
                  onClick={switchCamera}
                  variant="outline"
                  disabled={isUploading}
                  title={facingMode === 'user' ? 'Ganti ke Kamera Belakang' : 'Ganti ke Kamera Depan'}
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  disabled={isUploading}
                >
                  Tutup Kamera
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
