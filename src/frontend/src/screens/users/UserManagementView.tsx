import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUserApproval } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagementView() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
  });

  const approveMutation = useMutation({
    mutationFn: ({ uid, approved }: { uid: string; approved: boolean }) =>
      updateUserApproval(uid, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    },
  });

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user approvals and view all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={user.photoURL} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{user.name}</p>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">
                          {user.role.replace('_', ' ')}
                        </Badge>
                        {user.approved ? (
                          <Badge variant="default" className="text-xs shrink-0">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    {user.approved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          approveMutation.mutate({ uid: user.uid, approved: false })
                        }
                        disabled={approveMutation.isPending || user.role === 'super_admin'}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Block
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          approveMutation.mutate({ uid: user.uid, approved: true })
                        }
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
