import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, AlertCircle, BookOpen, Code } from 'lucide-react';
import { format } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export default function ApiKeys() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  // Success dialog (show new key)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [showFullKey, setShowFullKey] = useState(false);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchApiKeys();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .maybeSingle();

    setProfile(data);
  };

  const fetchApiKeys = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Error',
        description: 'Nama API key tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-api-key', {
        body: { name: newKeyName.trim() },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setNewApiKey(data.apiKey);
      setShowCreateDialog(false);
      setShowSuccessDialog(true);
      setNewKeyName('');
      fetchApiKeys();

      toast({
        title: 'API Key Created',
        description: 'API key berhasil dibuat. Simpan dengan aman!',
      });
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat API key',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newApiKey);
    toast({
      title: 'Copied!',
      description: 'API key berhasil di-copy ke clipboard',
    });
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyToDelete);

      if (error) throw error;

      toast({
        title: 'API Key Revoked',
        description: 'API key berhasil dinonaktifkan',
      });

      fetchApiKeys();
      setShowDeleteDialog(false);
      setKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Gagal menonaktifkan API key',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const canCreateApiKey = profile?.subscription_plan !== 'free';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">API Keys</h1>
          </div>
          <p className="text-muted-foreground">
            Kelola API keys untuk mengintegrasikan fitur generate ke aplikasi Anda
          </p>
        </div>

        {/* Free Plan Warning */}
        {!canCreateApiKey && (
          <Card className="mb-6 border-orange-500/50 bg-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-500 mb-1">
                    API Keys Tidak Tersedia di Free Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade ke paket Basic atau Pro untuk menggunakan API dan mengintegrasikan
                    fitur generate ke aplikasi Anda.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/settings')} size="sm">
                      Upgrade Sekarang
                    </Button>
                    <Button 
                      onClick={() => navigate('/api-documentation')} 
                      size="sm" 
                      variant="outline"
                    >
                      Lihat Dokumentasi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro/Enterprise Info */}
        {canCreateApiKey && (
          <Card className="mb-6 border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Code className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-500 mb-1">
                    🎉 API Access Aktif!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Anda bisa membuat API key dan mengintegrasikan fitur generate ke aplikasi Anda. 
                    Lihat dokumentasi lengkap untuk panduan penggunaan.
                  </p>
                  
                  {/* Security Info */}
                  <div className="bg-background/50 rounded-lg p-3 mb-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground">🔒 Fitur Keamanan API:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• <strong>Rate Limiting:</strong> Berdasarkan tier subscription Anda</li>
                      <li>• <strong>API Key Expiry:</strong> Otomatis expire setelah 90 hari (dapat diperpanjang)</li>
                      <li>• <strong>Request Tracking:</strong> Semua request tercatat untuk audit</li>
                      <li>• <strong>Secure Storage:</strong> API key di-hash dengan SHA-256</li>
                      <li>• <strong>Revoke Anytime:</strong> Nonaktifkan key kapan saja jika diperlukan</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/api-documentation')} 
                    size="sm" 
                    variant="outline"
                  >
                    📖 Baca Panduan API
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors hover:shadow-lg"
            onClick={() => navigate('/api-documentation')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">📖 Panduan Lengkap API</CardTitle>
                    <CardDescription>Cara pakai API untuk semua user</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Panduan step-by-step, contoh code, dan FAQ
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors hover:shadow-lg"
            onClick={() => navigate('/api-documentation')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">💻 Developer Docs</CardTitle>
                    <CardDescription>Dokumentasi teknis & code examples</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                API reference, endpoints, dan contoh implementasi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your API Keys</CardTitle>
                <CardDescription>
                  {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                disabled={!canCreateApiKey}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum Ada API Key</h3>
                <p className="text-muted-foreground mb-4">
                  Buat API key pertama Anda untuk mulai menggunakan API
                </p>
                {canCreateApiKey && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{key.name}</h3>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mb-1">
                        {key.key_preview}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {format(new Date(key.created_at), 'MMM dd, yyyy')}</span>
                        {key.last_used_at && (
                          <span>
                            Last used: {format(new Date(key.last_used_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {key.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setKeyToDelete(key.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Beri nama untuk API key Anda. Nama ini akan membantu Anda mengidentifikasi
                penggunaan key.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">API Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API, Development, Mobile App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateKey();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={creating}>
                {creating ? 'Creating...' : 'Create API Key'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog (Show New Key) */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Created Successfully!</DialogTitle>
              <DialogDescription>
                Simpan API key ini dengan aman. Anda tidak akan bisa melihatnya lagi setelah
                menutup dialog ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newApiKey}
                    readOnly
                    type={showFullKey ? 'text' : 'password'}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFullKey(!showFullKey)}
                  >
                    {showFullKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopyKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-orange-500 mb-1">Penting!</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Simpan API key di tempat yang aman</li>
                      <li>Jangan share ke orang lain</li>
                      <li>Jangan commit ke Git/GitHub</li>
                      <li>Gunakan environment variables</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSuccessDialog(false)}>I've Saved It</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
              <AlertDialogDescription>
                API key ini akan dinonaktifkan dan tidak bisa digunakan lagi. Aplikasi yang
                menggunakan key ini akan berhenti bekerja. Tindakan ini tidak bisa dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteKey}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? 'Revoking...' : 'Revoke Key'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
