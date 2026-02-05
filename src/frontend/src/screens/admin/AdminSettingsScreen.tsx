import AdminLayout from './AdminLayout';
import AdminRouteGuard from '@/components/auth/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface AdminSettingsScreenProps {
  onNavigate: (route: any) => void;
}

export default function AdminSettingsScreen({ onNavigate }: AdminSettingsScreenProps) {
  return (
    <AdminRouteGuard onUnauthorized={() => onNavigate('/home')}>
      <AdminLayout currentPath="/admin/settings" onNavigate={onNavigate}>
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure application settings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Settings
              </CardTitle>
              <CardDescription>
                This feature is coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings configuration will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
