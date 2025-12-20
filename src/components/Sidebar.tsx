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
  Shield,
  Key,
  BookOpen,
  Info,
  Camera,
  Home,
  Building2,
  Shirt,
  Rocket,
  CreditCard,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  info?: string;
}

export function Sidebar({ isAdmin = false, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/stats' },
    { 
      icon: Shirt, 
      label: 'Fashion & Product', 
      path: '/dashboard',
      info: 'Optimasi gambar untuk produk fashion seperti baju, sepatu, tas, aksesoris, jam tangan, kalung, gelang, cincin, topi, kacamata, dan produk wearable lainnya.'
    },
    { 
      icon: Camera, 
      label: 'AI Photographer', 
      path: '/ai-photographer',
      badge: 'New',
      badgeVariant: 'secondary',
      info: 'AI untuk foto portrait - ganti outfit, ubah pose, ganti background, beauty enhancement, dan professional portrait editing.'
    },
    { 
      icon: Home, 
      label: 'Interior Design', 
      path: '/interior-design',
      badge: 'New',
      badgeVariant: 'secondary',
      info: 'AI untuk interior design - virtual staging, style transformation, color scheme, lighting, dan furniture placement.'
    },
    { 
      icon: Building2, 
      label: 'Exterior Design', 
      path: '/exterior-design',
      badge: 'New',
      badgeVariant: 'secondary',
      info: 'AI untuk exterior & architecture - facade renovation, landscaping, time of day change, weather effects, dan architectural visualization.'
    },
    { 
      icon: Rocket, 
      label: 'More AI Features', 
      path: '/coming-soon',
      badge: 'Soon',
      badgeVariant: 'outline',
      info: 'Fitur AI baru akan segera hadir! Kami terus mengembangkan teknologi AI terbaru untuk membantu bisnis Anda.'
    },
    { icon: Key, label: 'API Keys', path: '/api-keys', badge: 'Basic+', badgeVariant: 'default' },
    { icon: BookOpen, label: 'Dokumentasi API', path: '/api-documentation' },
    { icon: CreditCard, label: 'Paket & Harga', path: '/pricing' },
    { icon: FileText, label: 'Pembayaran Saya', path: '/my-payments' },
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
              <div key={item.path} className="relative group">
                <button
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
                    <div className="flex items-center justify-between flex-1 gap-2">
                      <span className="text-xs sm:text-sm">{item.label}</span>
                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <Badge 
                            variant={item.badgeVariant || 'default'} 
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.info && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <span
                                onClick={(e) => e.stopPropagation()}
                                className="p-0.5 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer inline-flex"
                              >
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 text-sm" side="right">
                              <p className="text-muted-foreground">{item.info}</p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              </div>
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
