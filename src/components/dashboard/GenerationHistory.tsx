import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { imageCache } from '@/lib/image-cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageMagnifier } from '@/components/ui/image-magnifier';
import { useToast } from '@/hooks/use-toast';
import { History, Download, Loader2, ImageIcon, AlertCircle, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface GenerationRecord {
  id: string;
  original_image_path: string;
  generated_image_path: string;
  classification_result: string;
  enhancement_type: string;
  created_at: string;
  presigned_url: string | null;
  presigned_url_expires_at: string | null;
}

interface RecordWithPreview extends GenerationRecord {
  previewUrl: string | null;
}

interface Profile {
  subscription_plan: string;
}

export function GenerationHistory() {
  const [records, setRecords] = useState<RecordWithPreview[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; record: RecordWithPreview } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Cleanup expired cache on mount
  useEffect(() => {
    imageCache.cleanup();
  }, []);

  const loadData = async () => {
    await fetchProfile();
    await fetchHistory();
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    
    // Get profile first to check subscription
    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // For free users, only show last 7 days
    const isFreeUser = profileData?.subscription_plan === 'free';
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let query = supabase
      .from('generation_history')
      .select('*')
      .eq('user_id', user.id);
    
    // Apply 7-day filter for free users
    if (isFreeUser) {
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'Gagal memuat riwayat',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Get preview URLs for all records with caching
    const recordsWithPreviews = await Promise.all(
      (data || []).map(async (record) => {
        let previewUrl = null;
        
        try {
          // Try to get from cache first
          const cachedUrl = imageCache.get(record.generated_image_path);
          
          if (cachedUrl) {
            previewUrl = cachedUrl;
            console.log('Cache hit for:', record.generated_image_path);
          } else {
            // Check if presigned URL from DB is still valid
            if (record.presigned_url && 
                record.presigned_url_expires_at && 
                new Date(record.presigned_url_expires_at) > new Date()) {
              previewUrl = record.presigned_url;
              
              // Cache the DB URL
              const expiresAt = new Date(record.presigned_url_expires_at).getTime();
              const now = Date.now();
              const ttl = expiresAt - now;
              
              if (ttl > 0) {
                imageCache.set(record.generated_image_path, previewUrl, ttl);
              }
            } else {
              // Get new signed URL for preview
              const { data: urlData } = await supabase.storage
                .from('generated-images')
                .createSignedUrl(record.generated_image_path, 3600); // 1 hour
              
              if (urlData?.signedUrl) {
                previewUrl = urlData.signedUrl;
                
                // Cache the new URL (50 minutes to be safe)
                imageCache.set(record.generated_image_path, previewUrl, 50 * 60 * 1000);
              }
            }
            
            console.log('Cache miss for:', record.generated_image_path);
          }
        } catch (err) {
          console.error('Error getting preview URL:', err);
        }
        
        return {
          ...record,
          previewUrl,
        };
      })
    );
    
    setRecords(recordsWithPreviews);
    setLoading(false);
  };

  const handleDownload = async (record: GenerationRecord) => {
    setDownloadingId(record.id);
    
    try {
      // Check if we have a valid presigned URL
      let downloadUrl = record.presigned_url;
      
      if (!downloadUrl || 
          !record.presigned_url_expires_at || 
          new Date(record.presigned_url_expires_at) < new Date()) {
        // Get new presigned URL
        const { data, error } = await supabase.functions.invoke('get-presigned-url', {
          body: { 
            imagePath: record.generated_image_path,
            historyId: record.id,
          },
        });

        if (error) throw error;
        downloadUrl = data.signedUrl;
      }

      // Download the image
      const response = await fetch(downloadUrl!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-${record.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download Berhasil',
        description: 'Gambar telah didownload',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Download Gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isFreeUser = profile?.subscription_plan === 'free';

  return (
    <>
      {/* Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg font-semibold truncate">
              {previewImage?.title || 'Preview'}
            </DialogTitle>
            {previewImage?.record && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {previewImage.record.classification_result}
                </Badge>
                <span className="text-xs text-muted-foreground">→</span>
                <Badge variant="outline" className="text-xs">
                  {previewImage.record.enhancement_type}
                </Badge>
              </div>
            )}
          </DialogHeader>
          <div className="relative bg-muted/30 flex items-center justify-center p-6 flex-1 overflow-auto">
            {previewImage && (
              <div className="flex items-center justify-center w-full h-full">
                <ImageMagnifier
                  src={previewImage.url}
                  alt={previewImage.title}
                  magnifierSize={200}
                  zoomLevel={2.5}
                  className="max-w-full max-h-full"
                />
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex justify-center gap-3 border-t flex-shrink-0">
            <Button
              onClick={() => previewImage && handleDownload(previewImage.record)}
              variant="hero"
              size="sm"
              disabled={downloadingId === previewImage?.record.id}
            >
              {downloadingId === previewImage?.record.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Gambar
                </>
              )}
            </Button>
            <Button
              onClick={() => setPreviewImage(null)}
              variant="outline"
              size="sm"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Riwayat Generate
          </CardTitle>
          <CardDescription>
            {isFreeUser 
              ? 'Riwayat 7 hari terakhir (Paket Free)'
              : 'Semua hasil generate gambar Anda tersimpan di sini'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
        {isFreeUser && (
          <Alert className="mb-4 border-amber-500/20 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Paket Free hanya menyimpan riwayat 7 hari terakhir. Upgrade ke Pro atau Enterprise untuk akses riwayat unlimited.
            </AlertDescription>
          </Alert>
        )}
        
        {records.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada riwayat generate</p>
            <p className="text-sm text-muted-foreground">Mulai enhance gambar pertama Anda!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors group"
              >
                <div 
                  className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 relative cursor-pointer"
                  onClick={() => {
                    if (record.previewUrl) {
                      setPreviewImage({
                        url: record.previewUrl,
                        title: `${record.enhancement_type} - ${format(new Date(record.created_at), 'dd MMM yyyy', { locale: idLocale })}`,
                        record,
                      });
                    }
                  }}
                >
                  {record.previewUrl ? (
                    <>
                      <img 
                        src={record.previewUrl} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-2">
                          <Maximize2 className="w-4 h-4 text-gray-900" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {record.classification_result}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs">
                      {record.enhancement_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(record.created_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (record.previewUrl) {
                        setPreviewImage({
                          url: record.previewUrl,
                          title: `${record.enhancement_type} - ${format(new Date(record.created_at), 'dd MMM yyyy', { locale: idLocale })}`,
                          record,
                        });
                      }
                    }}
                    disabled={!record.previewUrl}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(record)}
                    disabled={downloadingId === record.id}
                  >
                    {downloadingId === record.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>
    </>
  );
}
