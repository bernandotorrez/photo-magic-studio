import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  subscription_plan: string;
  monthly_generate_limit: number;
  current_month_generates: number;
}

interface UsageStatsProps {
  profile: Profile | null;
}

export function UsageStats({ profile }: UsageStatsProps) {
  const navigate = useNavigate();
  
  if (!profile) return null;

  const used = profile.current_month_generates;
  const limit = profile.monthly_generate_limit;
  const percentage = (used / limit) * 100;
  
  const getColor = () => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-accent';
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-muted/50">
        <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${getColor()}`} />
        <span className="text-xs sm:text-sm font-medium">
          <span className={getColor()}>{used}</span>
          <span className="text-muted-foreground">/{limit}</span>
        </span>
        <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize px-1.5 sm:px-2">
          {profile.subscription_plan}
        </Badge>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate('/top-up')}
        className="h-7 sm:h-8 px-2 sm:px-3"
      >
        <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
        <span className="hidden sm:inline text-xs">Top Up</span>
      </Button>
    </div>
  );
}
