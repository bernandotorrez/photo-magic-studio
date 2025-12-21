import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { 
  Sparkles, 
  LayoutDashboard,
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
  FileText,
  UtensilsCrossed,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isAdmin?: boolean;
  onSignOut?: () => void;
  onNavigate?: () => void; // Callback untuk close mobile menu
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  action?: () => void;
  adminOnly?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  info?: string;
  isLogout?: boolean;
}

export function Sidebar({ isAdmin = false, onSignOut, onNavigate }: SidebarProps) {
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
      icon: UtensilsCrossed, 
      label: 'Food Enhancement', 
      path: '/food-enhancement',
      badge: 'New',
      badgeVariant: 'secondary',
      info: 'AI untuk food photography - perfect angles, plating styles, lighting effects, ingredient overlays, banners untuk menu & delivery apps.'
    },
    { 
      icon: Rocket, 
      label: 'More AI Features', 
      path: '/coming-soon',
      badge: 'Soon',
      badgeVariant: 'outline',
      info: 'Fitur AI baru akan segera hadir! Kami terus mengembangkan teknologi AI terbaru untuk membantu bisnis Anda.'
    },
    { icon: History, label: 'Riwayat Generate', path: '/history' },
    { icon: Key, label: 'API Keys', path: '/api-keys', badge: 'Basic+', badgeVariant: 'default' },
    { icon: BookOpen, label: 'Dokumentasi API', path: '/api-documentation' },
    { icon: CreditCard, label: 'Paket & Harga', path: '/pricing' },
    { icon: FileText, label: 'Pembayaran Saya', path: '/my-payments' },
    { icon: Users, label: 'Kelola User', path: '/admin/users', adminOnly: true },
    { icon: Shield, label: 'Admin Panel', path: '/admin', adminOnly: true },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
    { icon: LogOut, label: 'Keluar', action: onSignOut, isLogout: true },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const isActive = (item: MenuItem) => {
    return item.path ? location.pathname === item.path : false;
  };

  const handleMenuClick = (item: MenuItem) => {
    // If it's an action (like logout), execute the action
    if (item.action) {
      item.action();
      // Close mobile menu
      if (onNavigate) {
        onNavigate();
      }
      return;
    }
    
    // Otherwise navigate to path
    if (item.path) {
      navigate(item.path);
      // Close mobile menu after navigation starts
      if (onNavigate) {
        onNavigate();
      }
    }
  };

  return (
    <aside
      className={cn(
        'h-full bg-card border-r border-border/50 flex flex-col transition-all duration-300',
        'w-64 lg:w-64 lg:h-screen',
        collapsed && 'lg:w-16'
      )}
    >
      {/* Header */}
      <div className="h-20 sm:h-24 flex items-center justify-between px-3 sm:px-4 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center">
            <Logo size="lg" />
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
            const active = isActive(item);
            
            return (
              <div key={item.path || item.label} className="relative group">
                <button
                  onClick={() => handleMenuClick(item)}
                  className={cn(
                    'w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-left',
                    'hover:bg-accent hover:text-accent-foreground',
                    active && 'bg-secondary text-secondary-foreground font-medium',
                    item.isLogout && 'text-destructive hover:text-foreground',
                    collapsed && 'lg:justify-center'
                  )}
                >
                  <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0', active && 'text-primary', item.isLogout && 'group-hover:text-foreground')} />
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
    </aside>
  );
}
