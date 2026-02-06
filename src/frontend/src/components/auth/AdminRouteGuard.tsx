import { ReactNode, useEffect } from 'react';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { isAdminRole } from '@/lib/roles';

interface AdminRouteGuardProps {
  children: ReactNode;
  onUnauthorized: () => void;
}

export default function AdminRouteGuard({ children, onUnauthorized }: AdminRouteGuardProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  useEffect(() => {
    if (!isLoading && userProfile) {
      const hasAdminAccess = isAdminRole(userProfile.role);
      console.log('AdminRouteGuard - Role check:', userProfile.role, 'hasAdminAccess:', hasAdminAccess);
      if (!hasAdminAccess) {
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

  const hasAdminAccess = isAdminRole(userProfile?.role);

  if (!hasAdminAccess) {
    return null;
  }

  return <>{children}</>;
}
