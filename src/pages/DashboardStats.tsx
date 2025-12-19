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

interface Profile {
  subscription_plan: string;
  monthly_generate_limit: number;
  current_month_generates: number;
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
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data && user.email) {
      // Get actual generation count by email
      const { data: emailCount } = await supabase
        .rpc('get_generation_count_by_email', { p_email: user.email });
      
      // Update profile with email-based count
      setProfile({
        ...data,
        current_month_generates: emailCount || 0
      });
    } else if (data) {
      setProfile(data);
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
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.current_month_generates || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                dari {profile?.monthly_generate_limit || 0} limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paket</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {profile?.subscription_plan || 'Free'}
              </div>
              <p className="text-xs text-muted-foreground">
                Paket langganan aktif
              </p>
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

          {/* Monthly Usage Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Penggunaan Quota Bulanan
              </CardTitle>
              <CardDescription>
                Progress penggunaan limit generate bulan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {profile?.current_month_generates || 0} / {profile?.monthly_generate_limit || 0} Generate
                    </span>
                    <span className="text-muted-foreground">
                      {profile?.monthly_generate_limit 
                        ? Math.round(((profile?.current_month_generates || 0) / profile.monthly_generate_limit) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                      style={{ 
                        width: `${profile?.monthly_generate_limit 
                          ? Math.min(((profile?.current_month_generates || 0) / profile.monthly_generate_limit) * 100, 100)
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-2xl font-bold text-primary">
                      {profile?.current_month_generates || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Sudah Digunakan</div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-2xl font-bold text-green-600">
                      {(profile?.monthly_generate_limit || 0) - (profile?.current_month_generates || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Sisa Quota</div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-2xl font-bold capitalize">
                      {profile?.subscription_plan || 'Free'}
                    </div>
                    <div className="text-sm text-muted-foreground">Paket Aktif</div>
                  </div>
                </div>

                {/* Warning if quota is low */}
                {profile && profile.monthly_generate_limit > 0 && 
                 ((profile.current_month_generates / profile.monthly_generate_limit) >= 0.8) && (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-900 dark:text-amber-100">
                          Quota Hampir Habis
                        </div>
                        <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                          Anda telah menggunakan {Math.round((profile.current_month_generates / profile.monthly_generate_limit) * 100)}% 
                          dari quota bulanan. Pertimbangkan untuk upgrade paket jika membutuhkan lebih banyak generate.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
