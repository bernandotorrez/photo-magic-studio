import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Image as ImageIcon, 
  Calendar,
  Zap,
  Clock
} from 'lucide-react';

import { TokenAlert } from '@/components/TokenAlert';

interface Profile {
  subscription_plan: string;
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface DailyStats {
  date: string;
  count: number;
}

interface EnhancementStats {
  enhancement: string;
  count: number;
}

export default function DashboardStats() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [enhancementStats, setEnhancementStats] = useState<EnhancementStats[]>([]);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [todayGenerations, setTodayGenerations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllStats();
    }
  }, [user]);

  const fetchAllStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchProfile(),
        fetchDailyStats(),
        fetchEnhancementStats(),
        fetchTotalStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_tokens, purchased_tokens, subscription_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data as Profile);
    }
  };

  const fetchDailyStats = async () => {
    if (!user) return;

    // Create array of last 7 days
    const last7Days: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short' 
      });
      last7Days.push({ date: dateStr, count: 0 });
    }

    // Get data from database
    const { data } = await supabase
      .from('generation_history')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (data) {
      // Group by date
      const grouped = data.reduce((acc: Record<string, number>, item) => {
        const date = new Date(item.created_at).toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short' 
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Merge with last 7 days array
      const stats = last7Days.map(day => ({
        date: day.date,
        count: grouped[day.date] || 0
      }));

      setDailyStats(stats);
    } else {
      // If no data, still show 7 days with 0 count
      setDailyStats(last7Days);
    }
  };

  const fetchEnhancementStats = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('generation_history')
      .select('enhancement_type')
      .eq('user_id', user.id);

    if (data) {
      // Count by enhancement type
      const grouped = data.reduce((acc: Record<string, number>, item) => {
        const type = item.enhancement_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const stats = Object.entries(grouped).map(([enhancement, count]) => ({
        enhancement,
        count
      }));

      setEnhancementStats(stats);
    }
  };

  const fetchTotalStats = async () => {
    if (!user) return;

    // Total generations
    const { count: total } = await supabase
      .from('generation_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setTotalGenerations(total || 0);

    // Today's generations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayCount } = await supabase
      .from('generation_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    setTodayGenerations(todayCount || 0);
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Dashboard Statistik</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Lihat statistik penggunaan dan performa optimisasi gambar Anda
          </p>
        </div>

        {/* Token Alert */}
        <TokenAlert profile={profile} />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayGenerations}</div>
              <p className="text-xs text-muted-foreground">
                Gambar dioptimasi hari ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generate</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGenerations}</div>
              <p className="text-xs text-muted-foreground">
                Total gambar yang dioptimasi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Bulanan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.subscription_tokens || 0}</div>
              <p className="text-xs text-muted-foreground">Token dari paket bulanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Top-Up</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.purchased_tokens || 0}</div>
              <p className="text-xs text-muted-foreground">Token yang tidak hangus</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Aktivitas 7 Hari Terakhir
              </CardTitle>
              <CardDescription>
                Jumlah gambar yang dioptimasi per hari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enhancement Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Jenis Enhancement
              </CardTitle>
              <CardDescription>
                Distribusi tipe optimisasi yang digunakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enhancementStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={enhancementStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ enhancement, percent }) => 
                        `${enhancement}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {enhancementStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Belum ada data enhancement
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Balance Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Saldo Token
              </CardTitle>
              <CardDescription>Balance token Anda saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Token Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {profile?.subscription_tokens || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Token Bulanan</div>
                    {profile?.subscription_expires_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Expire: {new Date(profile.subscription_expires_at).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600">{profile?.purchased_tokens || 0}</div>
                    <div className="text-sm text-muted-foreground">Token Top-Up</div>
                    <div className="text-xs text-green-600 mt-1">Tidak akan hangus</div>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="text-2xl font-bold text-accent">
                      {(profile?.subscription_tokens || 0) + (profile?.purchased_tokens || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Token</div>
                    <div className="text-xs text-muted-foreground mt-1 capitalize">
                      Paket: {profile?.subscription_plan || 'Free'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
