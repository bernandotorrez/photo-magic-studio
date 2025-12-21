import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Database, Mail, Shield } from 'lucide-react';

export function AdminSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">System Settings</h2>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="PixelNova AI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" defaultValue="support@pixelnovaai.com" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable user access
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* User Limits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Default User Limits</CardTitle>
            </div>
            <CardDescription>Set default generation limits for new users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="free-limit">Free Tier</Label>
                <Input id="free-limit" type="number" defaultValue="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basic-limit">Basic Tier</Label>
                <Input id="basic-limit" type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pro-limit">Pro Tier</Label>
                <Input id="pro-limit" type="number" defaultValue="999999" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-reset Monthly</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reset user limits each month
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>Configure email notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Welcome Email</Label>
                <p className="text-sm text-muted-foreground">
                  Send welcome email to new users
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Limit Warning</Label>
                <p className="text-sm text-muted-foreground">
                  Notify users when approaching limit
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Report</Label>
                <p className="text-sm text-muted-foreground">
                  Send monthly usage reports to admins
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Maintenance</CardTitle>
            </div>
            <CardDescription>Database cleanup and optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-cleanup Old History</Label>
                <p className="text-sm text-muted-foreground">
                  Remove generation history older than 90 days for free users
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>History Retention (Free Tier)</Label>
              <Input type="number" defaultValue="7" placeholder="Days" />
              <p className="text-xs text-muted-foreground">
                Number of days to keep history for free tier users
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
