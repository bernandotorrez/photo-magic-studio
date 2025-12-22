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

interface TierUserCount {
  tier_id: string;
  tier_name: string;
  user_count: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tierCounts, setTierCounts] = useState<TierUserCount[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch basic statistics
      const { data, error } = await supabase.rpc('get_user_statistics');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0]);
      }

      // Fetch subscription tiers and count users per tier
      await fetchTierCounts();
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTierCounts = async () => {
    try {
      console.log('Fetching subscription tiers...');
      
      // Get all subscription tiers
      const { data: tiers, error: tiersError } = await supabase
        .from('subscription_tiers' as any)
        .select('tier_id, tier_name')
        .eq('is_active', true)
        .order('display_order');

      console.log('Tiers data:', tiers);
      console.log('Tiers error:', tiersError);

      if (tiersError) {
        console.error('Error fetching tiers:', tiersError);
        return;
      }

      if (!tiers || tiers.length === 0) {
        console.log('No tiers found, setting empty array');
        setTierCounts([]);
        return;
      }

      // Count users for each tier
      const counts: TierUserCount[] = [];
      for (const tier of tiers) {
        const tierData = tier as any;
        console.log(`Counting users for tier: ${tierData.tier_name} (${tierData.tier_id})`);
        
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_plan', tierData.tier_id);

        console.log(`  Count: ${count}, Error:`, countError);

        if (!countError) {
          counts.push({
            tier_id: tierData.tier_id,
            tier_name: tierData.tier_name,
            user_count: count || 0
          });
        }
      }

      console.log('Final tier counts:', counts);
      setTierCounts(counts);
    } catch (error) {
      console.error('Error fetching tier counts:', error);
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

  // Generate tier description dynamically from tierCounts
  // If tierCounts is empty (fetch failed), show loading message instead of hardcoded fallback
  const tierDescription = tierCounts.length > 0
    ? tierCounts.map(t => `${t.tier_name}: ${t.user_count}`).join(' | ')
    : 'Loading tier data...';

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      description: tierDescription,
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
