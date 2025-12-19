import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash from URL (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'signup') {
          // Set session with the token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (!error && data.session) {
            // Mark email as verified
            sessionStorage.setItem('emailVerified', 'true');
            // Redirect to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/auth', { replace: true });
          }
        } else {
          // If no valid token, redirect to auth
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Memverifikasi Email...</h2>
        <p className="text-muted-foreground">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}
