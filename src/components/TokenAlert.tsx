import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Coins } from 'lucide-react';

interface Profile {
  subscription_tokens: number;
  purchased_tokens: number;
  subscription_expires_at: string | null;
}

interface TokenAlertProps {
  profile: Profile | null;
}

export function TokenAlert({ profile }: TokenAlertProps) {
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

  // Token Expired Alert
  if (isExpired && subscriptionTokens > 0) {
    return (
      <Alert className="border-red-500/50 bg-red-500/5">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-500">Token Bulanan Sudah Expired</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Token bulanan Anda sebanyak <strong>{subscriptionTokens}</strong> sudah expired dan akan dihapus otomatis.
            Token top-up Anda (<strong>{purchasedTokens}</strong>) masih aktif dan tidak akan hangus.
          </p>
          <Button
            onClick={() => navigate('/top-up')}
            size="sm"
            className="bg-red-500 hover:bg-red-600"
          >
            <Coins className="w-4 h-4 mr-2" />
            Top Up Token Sekarang
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Token Expiring Soon Alert
  if (isExpiring && subscriptionTokens > 0) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/5">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Token Bulanan Akan Segera Expired</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Token bulanan Anda sebanyak <strong>{subscriptionTokens}</strong> akan expired dalam{' '}
            <strong>{daysUntilExpiry} hari</strong> (
            {new Date(profile.subscription_expires_at!).toLocaleDateString('id-ID')}).
            Gunakan sebelum hangus! Token top-up Anda (<strong>{purchasedTokens}</strong>) tidak akan hangus.
          </p>
          <Button onClick={() => navigate('/top-up')} size="sm" variant="outline">
            <Coins className="w-4 h-4 mr-2" />
            Top Up Token Tambahan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No Tokens Alert
  if (totalTokens <= 0) {
    return (
      <Alert className="border-red-500/50 bg-red-500/5">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-500">Token Habis</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Token Anda sudah habis. Silakan top up untuk melanjutkan generate gambar.</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/top-up')} size="sm" className="bg-red-500 hover:bg-red-600">
              <Coins className="w-4 h-4 mr-2" />
              Top Up Token Sekarang
            </Button>
            <Button onClick={() => navigate('/payment-history')} size="sm" variant="outline">
              Lihat Riwayat Pembayaran
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Low Tokens Warning
  if (totalTokens > 0 && totalTokens <= 5) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/5">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Token Hampir Habis</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Sisa token Anda: <strong>{subscriptionTokens}</strong> token bulanan +{' '}
            <strong>{purchasedTokens}</strong> token top-up = <strong>{totalTokens}</strong> total.
          </p>
          <Button onClick={() => navigate('/top-up')} size="sm" variant="outline">
            <Coins className="w-4 h-4 mr-2" />
            Top Up Token
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
