import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/firebase';
import { useFirebaseAuthUser } from './useFirebaseAuthUser';

export function useFirestoreUserProfile() {
  const { authUser, isLoading: authLoading } = useFirebaseAuthUser();

  const query = useQuery({
    queryKey: ['userProfile', authUser?.uid],
    queryFn: async () => {
      if (!authUser) {
        console.log('useFirestoreUserProfile - No auth user, returning null');
        return null;
      }
      console.log('useFirestoreUserProfile - Fetching profile for uid:', authUser.uid);
      const profile = await getUserProfile(authUser.uid);
      console.log('useFirestoreUserProfile - Profile fetched:', profile);
      return profile;
    },
    enabled: !!authUser && !authLoading,
    retry: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  return {
    ...query,
    isLoading: authLoading || query.isLoading,
  };
}
