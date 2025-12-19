import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface Profile {
  subscription_plan: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await fetchProfile();
    await fetchKeys();
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const fetchKeys = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching keys:', error);
    } else {
      setKeys(data || []);
    }

    setLoading(false);
  };

  const isFreeUser = profile?.subscription_plan === 'free';

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !user) return;

    if (isFreeUser) {
      toast({
        title: 'Fitur Premium',
        description: 'API Keys hanya tersedia untuk paket berbayar. Upgrade sekarang!',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-api-key', {
        body: { name: newKeyName.trim() },
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      if (error) throw error;

      setNewKey(data.apiKey);
      setShowNewKey(true);
      await fetchKeys();

      toast({
        title: 'API Key Dibuat',
        description: 'Simpan API key ini, karena tidak akan ditampilkan lagi.',
      });
    } catch (error: any) {
      console.error('Error creating key:', error);
      toast({
        title: 'Gagal Membuat API Key',
        description: error.message || 'Terjadi kesalahan saat membuat API key',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setKeys(keys.filter(k => k.id !== keyId));

      toast({
        title: 'API Key Dihapus',
        description: 'API key telah berhasil dihapus.',
      });
    } catch (error: any) {
      console.error('Error deleting key:', error);
      toast({
        title: 'Gagal Menghapus',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Disalin!',
      description: 'API key telah disalin ke clipboard.',
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewKey(null);
    setNewKeyName('');
    setShowNewKey(false);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Kelola API keys untuk mengakses EnhanceAI via API
            </CardDescription>
          </div>
          
          {isFreeUser ? (
            <Button disabled className="opacity-50">
              <Lock className="w-4 h-4 mr-2" />
              Premium Only
            </Button>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat API Key Baru</DialogTitle>
                  <DialogDescription>
                    Berikan nama untuk API key Anda agar mudah diidentifikasi
                  </DialogDescription>
                </DialogHeader>
                
                {newKey ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Simpan API key ini sekarang. Anda tidak akan bisa melihatnya lagi setelah menutup dialog ini.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showNewKey ? 'text' : 'password'}
                          value={newKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowNewKey(!showNewKey)}
                        >
                          {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(newKey)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleDialogClose}>
                      Saya Sudah Menyimpan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">Nama API Key</Label>
                      <Input
                        id="key-name"
                        placeholder="Contoh: Production App"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim() || creating}
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Membuat...
                        </>
                      ) : (
                        'Buat API Key'
                      )}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isFreeUser && (
          <Alert className="mb-4 border-amber-500/20 bg-amber-500/10">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Fitur API Keys hanya tersedia untuk paket berbayar (Basic/Pro). Upgrade untuk mengakses API dan integrasi pihak ketiga.
            </AlertDescription>
          </Alert>
        )}

        {keys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada API key</p>
            <p className="text-sm text-muted-foreground">
              {isFreeUser 
                ? 'Upgrade ke paket berbayar untuk membuat API keys' 
                : 'Buat API key untuk mengakses EnhanceAI via API'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    <Badge variant={key.is_active ? 'default' : 'secondary'}>
                      {key.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground">
                    {key.key_preview}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dibuat {format(new Date(key.created_at), 'dd MMM yyyy', { locale: idLocale })}
                    {key.last_used_at && (
                      <> • Terakhir digunakan {format(new Date(key.last_used_at), 'dd MMM yyyy', { locale: idLocale })}</>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteKey(key.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
