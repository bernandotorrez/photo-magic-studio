import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface Profile {
  subscription_plan: string;
  monthly_generate_limit: number;
  current_month_generates: number;
}

interface UsageStatsProps {
  profile: Profile | null;
}

export function UsageStats({ profile }: UsageStatsProps) {
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
  );
}
