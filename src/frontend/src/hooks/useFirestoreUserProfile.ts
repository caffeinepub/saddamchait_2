import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/firebase';
import { useFirebaseAuthUser } from './useFirebaseAuthUser';

export function useFirestoreUserProfile() {
  const { authUser, isLoading: authLoading } = useFirebaseAuthUser();

  const query = useQuery({
    queryKey: ['userProfile', authUser?.uid],
    queryFn: async () => {
      if (!authUser) return null;
      return getUserProfile(authUser.uid);
    },
    enabled: !!authUser && !authLoading,
    retry: false,
  });

  return {
    ...query,
    isLoading: authLoading || query.isLoading,
  };
}
