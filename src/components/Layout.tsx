import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/Sidebar';
import { UsageStats } from '@/components/dashboard/UsageStats';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

interface Profile {
  id: string;
  full_name: string | null;
  subscription_plan: string;
  monthly_generate_limit: number;
  current_month_generates: number;
  is_admin: boolean;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Load profile from session storage first for instant display
      const cachedProfile = sessionStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          setProfile(JSON.parse(cachedProfile));
        } catch (e) {
          console.error('Failed to parse cached profile:', e);
        }
      }
      
      // Then fetch fresh data in background
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
      // Cache profile data (nama, plan, dll) di session storage
      sessionStorage.setItem('userProfile', JSON.stringify(data));
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase (this will also clear storage in auth.tsx)
      await signOut();
      
      // Clear profile state
      setProfile(null);
      
      // Force redirect to auth page
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear and redirect even if error
      setProfile(null);
      sessionStorage.clear();
      navigate('/auth', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar isAdmin={profile?.is_admin} onSignOut={handleSignOut} />
      </div>

      {/* Mobile Sidebar - Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 flex flex-col h-full">
          <Sidebar 
            isAdmin={profile?.is_admin} 
            onSignOut={handleSignOut}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <header className="h-14 sm:h-16 border-b border-border/50 bg-card/50 backdrop-blur-lg flex items-center justify-between px-3 sm:px-6 gap-2">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-xl font-bold truncate">
                Selamat Datang, {profile?.full_name || 'User'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">
                Mulai enhance foto produk Anda dengan AI
              </p>
            </div>
            
            {/* Mobile: Show app name */}
            <div className="sm:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">PM</span>
              </div>
              <span className="font-bold text-sm">Photo Magic</span>
            </div>
          </div>
          
          <UsageStats profile={profile} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
