import { useState } from 'react';
import { useFirestorePendingUsersList } from '@/hooks/useFirestorePendingUsersList';
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
  const { data: users, isLoading, approveUser, rejectUser, blockUser, promoteToHelperAdmin, isUpdating } = useFirestorePendingUsersList();
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

  return (
    <AdminRouteGuard onUnauthorized={() => onNavigate('/chat')}>
      <AdminLayout currentPath="/admin/users" onNavigate={onNavigate}>
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Users</h1>
            <p className="text-muted-foreground">Review and approve user registrations</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Users waiting for approval to access the application
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Relation</TableHead>
                        {isSuperAdmin && <TableHead>Phone</TableHead>}
                        {isSuperAdmin && <TableHead>Email</TableHead>}
                        {isSuperAdmin && <TableHead>Role</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL} alt={user.fullName} />
                                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.age}</TableCell>
                          <TableCell className="capitalize">{user.relation}</TableCell>
                          {isSuperAdmin && <TableCell className="text-muted-foreground">{user.phoneNumber}</TableCell>}
                          {isSuperAdmin && <TableCell className="text-muted-foreground">{user.email}</TableCell>}
                          {isSuperAdmin && (
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant={user.rejected ? 'destructive' : user.blocked ? 'destructive' : 'secondary'}>
                              {user.rejected ? 'Rejected' : user.blocked ? 'Blocked' : 'Pending'}
                            </Badge>
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
                  No pending users
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
