import AdminLayout from './AdminLayout';
import AdminRouteGuard from '@/components/auth/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface AdminReportsScreenProps {
  onNavigate: (route: any) => void;
}

export default function AdminReportsScreen({ onNavigate }: AdminReportsScreenProps) {
  return (
    <AdminRouteGuard onUnauthorized={() => onNavigate('/home')}>
      <AdminLayout currentPath="/admin/reports" onNavigate={onNavigate}>
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">View analytics and generate reports</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                This feature is coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reporting and analytics functionality will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
