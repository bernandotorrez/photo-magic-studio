import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStats } from '@/components/admin/AdminStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { GenerationsHistory } from '@/components/admin/GenerationsHistory';
import { Analytics } from '@/components/admin/Analytics';
import { AdminSettings } from '@/components/admin/AdminSettings';
import EnhancementPromptsManager from '@/components/admin/EnhancementPromptsManager';
import CategoryEnhancementMapper from '@/components/admin/CategoryEnhancementMapper';
import PaymentManagement from '@/components/admin/PaymentManagement';
import SubscriptionTiersManager from '@/components/admin/SubscriptionTiersManager';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error || !profile?.is_admin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Overview of platform statistics and analytics</p>
            </div>
            <AdminStats />
            <div className="pt-6">
              <Analytics />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kelola User</h1>
              <p className="text-muted-foreground">Manage users and subscriptions</p>
            </div>
            <UserManagement />
          </div>
        );
      case 'enhancements':
        return <EnhancementPromptsManager />;
      case 'mappings':
        return <CategoryEnhancementMapper />;
      case 'payments':
        return <PaymentManagement />;
      case 'tiers':
        return <SubscriptionTiersManager />;
      case 'generations':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Enhance History</h1>
              <p className="text-muted-foreground">All image enhancement history</p>
            </div>
            <GenerationsHistory />
          </div>
        );
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 hidden lg:block">
        <div className="fixed w-64 h-screen">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onNavigateHome={() => navigate('/dashboard')}
          />
        </div>
      </div>

      {/* Mobile Sidebar - Responsive */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
        <div className="flex justify-around p-2">
          {['dashboard', 'users', 'payments', 'enhancements', 'mappings', 'generations', 'settings'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 py-2 px-1 text-xs font-medium rounded ${
                activeSection === section
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
