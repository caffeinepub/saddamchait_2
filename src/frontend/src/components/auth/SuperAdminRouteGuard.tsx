import { ReactNode, useEffect } from 'react';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { isSuperAdminRole } from '@/lib/roles';

interface SuperAdminRouteGuardProps {
  children: ReactNode;
  onUnauthorized: () => void;
}

export default function SuperAdminRouteGuard({ children, onUnauthorized }: SuperAdminRouteGuardProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  useEffect(() => {
    if (!isLoading && userProfile) {
      const hasSuperAdminAccess = isSuperAdminRole(userProfile.role);
      console.log('SuperAdminRouteGuard - Role check:', userProfile.role, 'hasSuperAdminAccess:', hasSuperAdminAccess);
      if (!hasSuperAdminAccess) {
        onUnauthorized();
      }
    }
  }, [userProfile, isLoading, onUnauthorized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const hasSuperAdminAccess = isSuperAdminRole(userProfile?.role);

  if (!hasSuperAdminAccess) {
    return null;
  }

  return <>{children}</>;
}
