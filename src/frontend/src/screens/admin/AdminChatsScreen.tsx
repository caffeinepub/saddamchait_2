import AdminLayout from './AdminLayout';
import AdminRouteGuard from '@/components/auth/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface AdminChatsScreenProps {
  onNavigate: (route: any) => void;
}

export default function AdminChatsScreen({ onNavigate }: AdminChatsScreenProps) {
  return (
    <AdminRouteGuard onUnauthorized={() => onNavigate('/home')}>
      <AdminLayout currentPath="/admin/chats" onNavigate={onNavigate}>
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
            <p className="text-muted-foreground">View and manage chat conversations</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Management
              </CardTitle>
              <CardDescription>
                This feature is coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chat management functionality will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
