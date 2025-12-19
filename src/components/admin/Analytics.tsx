import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Zap, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalGenerations: number;
  avgGenerationsPerUser: number;
  generationsToday: number;
  generationsThisWeek: number;
  generationsThisMonth: number;
  topEnhancement: string;
  topClassification: string;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get basic stats
      const { data: stats } = await supabase.rpc('get_user_statistics');
      
      // Get generation counts by period
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const { count: weekCount } = await supabase
        .from('generation_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { count: monthCount } = await supabase
        .from('generation_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      // Get top enhancement type
      const { data: enhancements } = await supabase
        .from('generation_history')
        .select('enhancement_type')
        .limit(1000);

      const enhancementCounts: Record<string, number> = {};
      enhancements?.forEach(e => {
        enhancementCounts[e.enhancement_type] = (enhancementCounts[e.enhancement_type] || 0) + 1;
      });
      
      const topEnhancement = Object.entries(enhancementCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

      // Get top classification
      const { data: classifications } = await supabase
        .from('generation_history')
        .select('classification_result')
        .limit(1000);

      const classificationCounts: Record<string, number> = {};
      classifications?.forEach(c => {
        classificationCounts[c.classification_result] = (classificationCounts[c.classification_result] || 0) + 1;
      });
      
      const topClassification = Object.entries(classificationCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

      if (stats && stats.length > 0) {
        const s = stats[0];
        setAnalytics({
          totalUsers: s.total_users,
          totalGenerations: s.total_generations,
          avgGenerationsPerUser: s.total_users > 0 ? Math.round(s.total_generations / s.total_users) : 0,
          generationsToday: s.generations_today,
          generationsThisWeek: weekCount || 0,
          generationsThisMonth: monthCount || 0,
          topEnhancement,
          topClassification,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  // Only show unique cards (not duplicated in AdminStats)
  const cards = [
    {
      title: 'This Week',
      value: analytics.generationsThisWeek,
      icon: Calendar,
      description: 'Last 7 days',
    },
    {
      title: 'This Month',
      value: analytics.generationsThisMonth,
      icon: Calendar,
      description: 'Last 30 days',
    },
    {
      title: 'Top Enhancement',
      value: analytics.topEnhancement,
      icon: Zap,
      description: 'Most used',
      isText: true,
    },
    {
      title: 'Top Category',
      value: analytics.topClassification,
      icon: TrendingUp,
      description: 'Most common',
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Detailed Analytics</h2>
        <p className="text-muted-foreground">Extended metrics and usage insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`${card.isText ? 'text-xl' : 'text-2xl'} font-bold truncate`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Daily Average</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(analytics.generationsThisWeek / 7)} generations/day
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Weekly Average</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(analytics.generationsThisMonth / 4)} generations/week
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User Engagement</span>
              <span className="text-sm text-muted-foreground">
                {analytics.totalUsers > 0 
                  ? Math.round((analytics.generationsThisMonth / analytics.totalUsers) * 100) 
                  : 0}% active this month
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
