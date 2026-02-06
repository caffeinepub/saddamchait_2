import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingUsers, approveUser, rejectUser, blockUser, promoteToHelperAdmin } from '@/lib/firebase';

export function useFirestorePendingUsersList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: getPendingUsers,
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: (uid: string) => approveUser(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (uid: string) => rejectUser(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const blockMutation = useMutation({
    mutationFn: (uid: string) => blockUser(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (uid: string) => promoteToHelperAdmin(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  return {
    ...query,
    approveUser: approveMutation.mutate,
    rejectUser: rejectMutation.mutate,
    blockUser: blockMutation.mutate,
    promoteToHelperAdmin: promoteMutation.mutate,
    isUpdating: approveMutation.isPending || rejectMutation.isPending || blockMutation.isPending || promoteMutation.isPending,
  };
}
