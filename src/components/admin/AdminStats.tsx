import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, TrendingUp, Calendar } from 'lucide-react';

interface Statistics {
  total_users: number;
  free_users: number;
  basic_users: number;
  pro_users: number;
  total_generations: number;
  generations_today: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_statistics');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
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

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      description: `Free: ${stats.free_users} | Basic: ${stats.basic_users} | Pro: ${stats.pro_users}`,
    },
    {
      title: 'Total Generations',
      value: stats.total_generations,
      icon: Zap,
      description: 'All time generations',
    },
    {
      title: 'Today',
      value: stats.generations_today,
      icon: Calendar,
      description: 'Generations today',
    },
    {
      title: 'Avg per User',
      value: stats.total_users > 0 ? Math.round(stats.total_generations / stats.total_users) : 0,
      icon: TrendingUp,
      description: 'Average generations',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
