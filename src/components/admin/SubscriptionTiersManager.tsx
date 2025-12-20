import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionTier {
  id: string;
  tier_id: string;
  tier_name: string;
  display_order: number;
  price: number;
  tokens: number;
  bonus_tokens: number;
  description: string;
  features: string[];
  limitations: string[];
  api_rate_limit: number;
  is_active: boolean;
  is_popular: boolean;
  color: string;
  bg_color: string;
  icon: string;
}

export default function SubscriptionTiersManager() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState<Partial<SubscriptionTier>>({
    tier_id: '',
    tier_name: '',
    display_order: 0,
    price: 0,
    tokens: 0,
    bonus_tokens: 0,
    description: '',
    features: [],
    limitations: [],
    api_rate_limit: 0,
    is_active: true,
    is_popular: false,
    color: 'text-gray-500',
    bg_color: 'bg-gray-500/10',
    icon: 'Sparkles',
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTiers((data as any) || []);
    } catch (error: any) {
      toast.error('Gagal memuat tier: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      tier_id: '',
      tier_name: '',
      display_order: tiers.length + 1,
      price: 0,
      tokens: 0,
      bonus_tokens: 0,
      description: '',
      features: [],
      limitations: [],
      api_rate_limit: 0,
      is_active: true,
      is_popular: false,
      color: 'text-gray-500',
      bg_color: 'bg-gray-500/10',
      icon: 'Sparkles',
    });
  };

  const handleEdit = (tier: SubscriptionTier) => {
    setEditingId(tier.id);
    setFormData(tier);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (!formData.tier_id || !formData.tier_name) {
        toast.error('Tier ID dan Nama wajib diisi');
        return;
      }

      if (isCreating) {
        const { error } = await supabase
          .from('subscription_tiers')
          .insert([formData]);

        if (error) throw error;
        toast.success('Tier berhasil dibuat');
      } else if (editingId) {
        const { error } = await supabase
          .from('subscription_tiers')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Tier berhasil diupdate');
      }

      await fetchTiers();
      handleCancel();
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tier ini?')) return;

    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tier berhasil dihapus');
      await fetchTiers();
    } catch (error: any) {
      toast.error('Gagal menghapus: ' + error.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Tier ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      await fetchTiers();
    } catch (error: any) {
      toast.error('Gagal update status: ' + error.message);
    }
  };

  // Pagination
  const totalPages = Math.ceil(tiers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTiers = tiers.slice(startIndex, endIndex);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kelola Subscription Tiers</h2>
          <p className="text-muted-foreground">Manage paket langganan ({tiers.length} total)</p>
          <p className="text-sm text-muted-foreground mt-1">
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
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tier Baru
        </Button>
      </div>

      {(isCreating || editingId) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{isCreating ? 'Buat' : 'Edit'} Subscription Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier_id">Tier ID *</Label>
                <Input
                  id="tier_id"
                  value={formData.tier_id || ''}
                  onChange={(e) => setFormData({ ...formData, tier_id: e.target.value })}
                  placeholder="e.g., basic_plus"
                  disabled={!isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier_name">Nama Tier *</Label>
                <Input
                  id="tier_name"
                  value={formData.tier_name || ''}
                  onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                  placeholder="e.g., Basic+"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokens">Token</Label>
                <Input
                  id="tokens"
                  type="number"
                  value={formData.tokens || 0}
                  onChange={(e) => setFormData({ ...formData, tokens: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus_tokens">Bonus Token</Label>
                <Input
                  id="bonus_tokens"
                  type="number"
                  value={formData.bonus_tokens || 0}
                  onChange={(e) => setFormData({ ...formData, bonus_tokens: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_rate_limit">API Rate Limit</Label>
                <Input
                  id="api_rate_limit"
                  type="number"
                  value={formData.api_rate_limit || 0}
                  onChange={(e) => setFormData({ ...formData, api_rate_limit: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Cocok untuk..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (satu per baris)</Label>
              <Textarea
                id="features"
                value={(formData.features || []).join('\n')}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                placeholder="Masukkan features, satu per baris&#10;Contoh:&#10;40 token per bulan&#10;Semua fitur enhancement&#10;API access"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Atau klik "Auto Generate" untuk generate otomatis dari tokens
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const autoFeatures = [];
                  
                  // Token info
                  if (formData.bonus_tokens && formData.bonus_tokens > 0) {
                    autoFeatures.push(`${formData.tokens} token + ${formData.bonus_tokens} bonus token`);
                  } else {
                    autoFeatures.push(`${formData.tokens} token per bulan`);
                  }
                  
                  // Basic features
                  if (formData.price === 0) {
                    autoFeatures.push('Akses fitur dasar');
                    autoFeatures.push('Support email');
                    autoFeatures.push('Bisa top-up token tambahan');
                  } else {
                    autoFeatures.push('Semua fitur enhancement');
                    autoFeatures.push('Tanpa watermark');
                    autoFeatures.push('Export HD quality');
                    
                    if (formData.api_rate_limit && formData.api_rate_limit > 0) {
                      autoFeatures.push(`API Access (${formData.api_rate_limit} req/min)`);
                    }
                    
                    if (formData.price >= 50000) {
                      autoFeatures.push('Priority email support');
                      autoFeatures.push('Bulk processing');
                    }
                    
                    if (formData.price >= 75000) {
                      autoFeatures.push('Custom enhancement prompts');
                      autoFeatures.push('Priority support (WhatsApp)');
                      autoFeatures.push('Advanced analytics');
                    }
                    
                    if (formData.price >= 100000) {
                      autoFeatures.push('Dedicated support');
                      autoFeatures.push('Custom AI training');
                      autoFeatures.push('White-label option');
                      autoFeatures.push('Early access to beta features');
                    }
                    
                    autoFeatures.push('Bisa top-up token tambahan');
                  }
                  
                  setFormData({ ...formData, features: autoFeatures });
                  toast.success('Features berhasil di-generate otomatis');
                }}
              >
                Auto Generate Features
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Urutan</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Aktif</Label>
                <div className="flex items-center h-10">
                  <Switch
                    id="is_active"
                    checked={formData.is_active || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_popular">Popular</Label>
                <div className="flex items-center h-10">
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DataTable */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>API Limit</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Belum ada tier. Klik "Tambah Tier Baru" untuk membuat.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTiers.map((tier) => (
                    <TableRow key={tier.id} className={!tier.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        <Switch
                          checked={tier.is_active}
                          onCheckedChange={() => handleToggleActive(tier.id, tier.is_active)}
                          disabled={editingId !== null || isCreating}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {tier.tier_name}
                            {tier.is_popular && (
                              <Badge variant="default" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <code className="text-xs text-muted-foreground">{tier.tier_id}</code>
                        </div>
                      </TableCell>
                      <TableCell>Rp {tier.price.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{tier.tokens}</TableCell>
                      <TableCell>
                        {tier.bonus_tokens > 0 ? (
                          <span className="text-green-600">+{tier.bonus_tokens}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{tier.api_rate_limit} req/min</TableCell>
                      <TableCell className="text-center">{tier.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tier)}
                            disabled={editingId !== null || isCreating}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tier.id)}
                            disabled={editingId !== null || isCreating}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {tiers.length > itemsPerPage && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, tiers.length)} of {tiers.length} tiers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
