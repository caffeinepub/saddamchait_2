import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUserApproval, updateUserRole, deleteUserProfile } from '@/lib/firebase';

export function useFirestoreUsersList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    retry: false,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ uid, approved }: { uid: string; approved: boolean }) =>
      updateUserApproval(uid, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: 'user' | 'admin' }) =>
      updateUserRole(uid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ uid }: { uid: string }) =>
      deleteUserProfile(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  return {
    ...query,
    updateApproval: approvalMutation.mutate,
    updateRole: roleMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isUpdating: approvalMutation.isPending || roleMutation.isPending || deleteMutation.isPending,
  };
}
