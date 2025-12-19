import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Shield } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  subscription_plan: string;
  is_admin: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    if (data && user.email) {
      // Get actual generation count by email
      const { data: emailCount } = await supabase
        .rpc('get_generation_count_by_email', { p_email: user.email });
      
      // Update profile with email-based count
      const updatedProfile = {
        ...data,
        current_month_generates: emailCount || 0
      };
      setProfile(updatedProfile);
      setFullName(updatedProfile.full_name || '');
    } else if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });
      
      fetchProfile();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Pengaturan</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Kelola profil dan preferensi akun Anda</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Profil
              </CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Status Email</span>
                <span className="text-sm font-medium text-green-600">Terverifikasi</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Paket Langganan</span>
                <span className="text-sm font-medium capitalize">
                  {profile?.subscription_plan || 'Free'}
                </span>
              </div>

              {profile?.is_admin && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4 text-primary" />
                    Administrator
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
