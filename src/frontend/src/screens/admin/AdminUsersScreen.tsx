import { useFirestoreUsersList } from '@/hooks/useFirestoreUsersList';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserRowActions from '@/components/admin/UserRowActions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdminUsersScreenProps {
  onNavigate: (route: any) => void;
}

export default function AdminUsersScreen({ onNavigate }: AdminUsersScreenProps) {
  const { data: users, isLoading, updateApproval, updateRole, deleteUser, isUpdating } = useFirestoreUsersList();
  const { data: currentUserProfile } = useFirestoreUserProfile();

  const isSuperAdmin = currentUserProfile?.role === 'super_admin';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AdminLayout currentPath="/admin/users" onNavigate={onNavigate}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all registered users
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
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
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
                              <AvatarImage src={user.photoURL} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.approved ? 'default' : 'secondary'}>
                            {user.approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <UserRowActions
                            user={user}
                            currentUserRole={currentUserProfile?.role || 'user'}
                            isSuperAdmin={isSuperAdmin}
                            onApprove={() => updateApproval({ uid: user.uid, approved: true })}
                            onBlock={() => updateApproval({ uid: user.uid, approved: false })}
                            onChangeRole={(role) => updateRole({ uid: user.uid, role })}
                            onDelete={() => deleteUser({ uid: user.uid })}
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
  );
}
