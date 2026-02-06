import { ReactNode, useEffect } from 'react';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';

interface AuthenticatedRouteGuardProps {
  children: ReactNode;
  onUnauthorized: () => void;
  onUnapproved?: () => void;
}

export default function AuthenticatedRouteGuard({ 
  children, 
  onUnauthorized,
  onUnapproved 
}: AuthenticatedRouteGuardProps) {
  const { authUser, isLoading: authLoading } = useFirebaseAuthUser();
  const { data: userProfile, isLoading: profileLoading } = useFirestoreUserProfile();

  useEffect(() => {
    if (!authLoading && !authUser) {
      onUnauthorized();
    }
  }, [authUser, authLoading, onUnauthorized]);

  // Check approval status after profile is loaded
  useEffect(() => {
    if (!authLoading && !profileLoading && authUser && userProfile) {
      // If user is not approved and not an admin, redirect to pending approval
      const isAdmin = userProfile.role === 'super_admin' || userProfile.role === 'helper_admin';
      if (!userProfile.approved && !isAdmin && onUnapproved) {
        onUnapproved();
      }
    }
  }, [authUser, authLoading, profileLoading, userProfile, onUnapproved]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !userProfile) {
    return null;
  }

  return <>{children}</>;
}
