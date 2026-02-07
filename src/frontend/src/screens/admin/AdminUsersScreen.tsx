import { useState } from 'react';
import { useFirestoreUsersList } from '@/hooks/useFirestoreUsersList';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import AdminLayout from './AdminLayout';
import AdminRouteGuard from '@/components/auth/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserRowActions from '@/components/admin/UserRowActions';
import PendingUserDetailsDialog from '@/components/admin/PendingUserDetailsDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdminUsersScreenProps {
  onNavigate: (route: any) => void;
}

export default function AdminUsersScreen({ onNavigate }: AdminUsersScreenProps) {
  const { data: users, isLoading, approveUser, rejectUser, blockUser, promoteToHelperAdmin, deleteUser, isUpdating } = useFirestoreUsersList();
  const { data: currentUserProfile } = useFirestoreUserProfile();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const isSuperAdmin = currentUserProfile?.role === 'super_admin';
  const isHelperAdmin = currentUserProfile?.role === 'helper_admin';

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.blocked) return <Badge variant="destructive">Blocked</Badge>;
    if (user.rejected) return <Badge variant="destructive">Rejected</Badge>;
    if (user.approved) return <Badge variant="default" className="bg-green-600">Approved</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <AdminRouteGuard onUnauthorized={() => onNavigate('/chat')}>
      <AdminLayout currentPath="/admin/users" onNavigate={onNavigate}>
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Complete list of all registered users with their details and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={user.photoURL} alt={user.fullName} />
                                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="text-muted-foreground">{user.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <UserRowActions
                              user={{
                                uid: user.uid,
                                fullName: user.fullName,
                                role: user.role,
                                approved: user.approved,
                                rejected: user.rejected,
                                blocked: user.blocked,
                              }}
                              currentUserRole={currentUserProfile?.role || 'user'}
                              isSuperAdmin={isSuperAdmin}
                              isHelperAdmin={isHelperAdmin}
                              onApprove={() => approveUser(user.uid)}
                              onReject={() => rejectUser(user.uid)}
                              onBlock={() => blockUser(user.uid)}
                              onPromoteToHelperAdmin={() => promoteToHelperAdmin(user.uid)}
                              onDelete={() => deleteUser(user.uid)}
                              onViewDetails={() => setSelectedUser(user)}
                              isUpdating={isUpdating}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      {selectedUser && (
        <PendingUserDetailsDialog
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
          user={selectedUser}
        />
      )}
    </AdminRouteGuard>
  );
}
