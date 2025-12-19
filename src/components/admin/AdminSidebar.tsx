import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Settings,
  Shield,
  Home
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNavigateHome: () => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
  },
  {
    id: 'users',
    label: 'Kelola User',
    icon: Users,
    description: 'Manage users & subscriptions',
  },
  {
    id: 'generations',
    label: 'Enhance History',
    icon: Sparkles,
    description: 'All generation history',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'System settings',
  },
];

export function AdminSidebar({ activeSection, onSectionChange, onNavigateHome }: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r bg-card/50">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Management Console</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={onNavigateHome}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto py-3 px-3',
                  isActive && 'bg-secondary'
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={cn(
                  'w-4 h-4 mr-3 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>Admin Access</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
