import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, approveUser as approveUserFn, rejectUser as rejectUserFn, blockUser as blockUserFn, promoteToHelperAdmin as promoteToHelperAdminFn, deleteUser as deleteUserFn } from '@/lib/firebase';
import { toast } from 'sonner';

export function useFirestoreUsersList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    refetchInterval: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: approveUserFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User approved successfully');
    },
    onError: (error) => {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectUserFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User rejected');
    },
    onError: (error) => {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    },
  });

  const blockMutation = useMutation({
    mutationFn: blockUserFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User blocked');
    },
    onError: (error) => {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    },
  });

  const promoteMutation = useMutation({
    mutationFn: promoteToHelperAdminFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User promoted to Helper Admin');
    },
    onError: (error) => {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    approveUser: approveMutation.mutate,
    rejectUser: rejectMutation.mutate,
    blockUser: blockMutation.mutate,
    promoteToHelperAdmin: promoteMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isUpdating: approveMutation.isPending || rejectMutation.isPending || blockMutation.isPending || promoteMutation.isPending || deleteMutation.isPending,
  };
}
