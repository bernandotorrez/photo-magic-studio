import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard,
  ImagePlus,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isAdmin?: boolean;
  onSignOut?: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export function Sidebar({ isAdmin = false, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/stats' },
    { icon: ImagePlus, label: 'Optimisasi Gambar', path: '/dashboard' },
    { icon: Users, label: 'Kelola User', path: '/admin/users', adminOnly: true },
    { icon: Shield, label: 'Admin Panel', path: '/admin', adminOnly: true },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border/50 flex flex-col transition-all duration-300',
        'w-64 lg:w-64',
        collapsed && 'lg:w-16'
      )}
    >
      {/* Header */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base sm:text-lg">Photo Magic</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 sm:h-8 sm:w-8 hidden lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-3 sm:py-4">
        <div className="space-y-1 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-left',
                  'hover:bg-accent hover:text-accent-foreground',
                  active && 'bg-secondary text-secondary-foreground font-medium',
                  collapsed && 'lg:justify-center'
                )}
              >
                <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0', active && 'text-primary')} />
                {!collapsed && (
                  <span className="text-xs sm:text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className={cn(
            'w-full justify-start gap-2 sm:gap-3 text-xs sm:text-sm',
            collapsed && 'lg:justify-center lg:px-0'
          )}
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          {!collapsed && <span>Keluar</span>}
        </Button>
      </div>
    </aside>
  );
}
