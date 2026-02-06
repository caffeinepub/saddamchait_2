import { ReactNode, useEffect } from 'react';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { isAdminRole } from '@/lib/roles';

interface AuthenticatedRouteGuardProps {
  children: ReactNode;
  onUnauthenticated: () => void;
  onUnapproved?: () => void;
}

export default function AuthenticatedRouteGuard({
  children,
  onUnauthenticated,
  onUnapproved,
}: AuthenticatedRouteGuardProps) {
  const { authUser, isLoading: authLoading } = useFirebaseAuthUser();
  const { data: userProfile, isLoading: profileLoading } = useFirestoreUserProfile();

  useEffect(() => {
    if (!authLoading && !authUser) {
      onUnauthenticated();
    }
  }, [authUser, authLoading, onUnauthenticated]);

  useEffect(() => {
    if (!authLoading && !profileLoading && authUser && userProfile) {
      // Admins bypass approval check
      const hasAdminAccess = isAdminRole(userProfile.role);
      console.log('AuthenticatedRouteGuard - Approval check:', {
        role: userProfile.role,
        hasAdminAccess: hasAdminAccess,
        approved: userProfile.approved,
        blocked: userProfile.blocked,
        rejected: userProfile.rejected
      });
      
      if (!hasAdminAccess && !userProfile.approved && onUnapproved) {
        onUnapproved();
      }
    }
  }, [authUser, userProfile, authLoading, profileLoading, onUnapproved]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  // Admins bypass approval check
  const hasAdminAccess = isAdminRole(userProfile?.role);
  if (!hasAdminAccess && !userProfile?.approved) {
    return null;
  }

  return <>{children}</>;
}
