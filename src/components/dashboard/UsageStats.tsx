import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Plus, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Profile {
  subscription_plan: string;
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface UsageStatsProps {
  profile: Profile | null;
}

export function UsageStats({ profile }: UsageStatsProps) {
  const navigate = useNavigate();
  
  if (!profile) return null;

  const subscriptionTokens = profile.subscription_tokens || 0;
  const purchasedTokens = profile.purchased_tokens || 0;
  const totalTokens = subscriptionTokens + purchasedTokens;
  
  // Calculate days until expiry
  let daysUntilExpiry = null;
  let isExpiring = false;
  let isExpired = false;
  
  if (profile.subscription_expires_at && subscriptionTokens > 0) {
    const expiresAt = new Date(profile.subscription_expires_at);
    const now = new Date();
    daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isExpiring = daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    isExpired = daysUntilExpiry <= 0;
  }
  
  const getColor = () => {
    if (totalTokens === 0) return 'text-destructive';
    if (totalTokens <= 5) return 'text-yellow-500';
    if (isExpiring || isExpired) return 'text-yellow-500';
    return 'text-accent';
  };

  const getIcon = () => {
    if (totalTokens === 0) return <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />;
    if (isExpiring || isExpired) return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />;
    return <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${getColor()}`} />;
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${
              totalTokens === 0 ? 'bg-destructive/10 border border-destructive/20' :
              (isExpiring || isExpired) ? 'bg-yellow-500/10 border border-yellow-500/20' :
              'bg-muted/50'
            }`}>
              {getIcon()}
              <span className="text-xs sm:text-sm font-medium">
                <span className={getColor()}>{totalTokens}</span>
                <span className="text-muted-foreground text-[10px] sm:text-xs ml-0.5">token</span>
              </span>
              {(isExpiring || isExpired) && subscriptionTokens > 0 && (
                <Badge variant="outline" className="text-[10px] border-yellow-500 text-yellow-600 px-1">
                  {isExpired ? 'Expired' : `${daysUntilExpiry}d`}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize px-1.5 sm:px-2">
                {profile.subscription_plan}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5 text-xs">
              <div className="font-semibold border-b pb-1">Token Balance</div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subscription:</span>
                <span className="font-medium">{subscriptionTokens} token</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Top-up:</span>
                <span className="font-medium">{purchasedTokens} token</span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{totalTokens} token</span>
              </div>
              {profile.subscription_expires_at && subscriptionTokens > 0 && (
                <div className="pt-1 border-t text-[11px]">
                  {isExpired ? (
                    <span className="text-red-500">⚠️ Subscription tokens expired</span>
                  ) : isExpiring ? (
                    <span className="text-yellow-600">⏰ Expires in {daysUntilExpiry} days</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Expires: {new Date(profile.subscription_expires_at).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
              )}
              {totalTokens === 0 && (
                <div className="pt-1 border-t text-red-500 text-[11px]">
                  ⚠️ No tokens available. Please top up.
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button
        size="sm"
        variant={totalTokens === 0 ? "default" : "outline"}
        onClick={() => navigate('/top-up')}
        className={`h-7 sm:h-8 px-2 sm:px-3 ${
          totalTokens === 0 ? 'bg-destructive hover:bg-destructive/90' : ''
        }`}
      >
        <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
        <span className="hidden sm:inline text-xs">Top Up</span>
      </Button>
    </div>
  );
}
