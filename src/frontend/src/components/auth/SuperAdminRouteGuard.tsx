import { ReactNode, useEffect } from 'react';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';

interface SuperAdminRouteGuardProps {
  children: ReactNode;
  onUnauthorized: () => void;
}

export default function SuperAdminRouteGuard({ children, onUnauthorized }: SuperAdminRouteGuardProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  useEffect(() => {
    if (!isLoading && userProfile) {
      const isSuperAdmin = userProfile.role === 'super_admin';
      if (!isSuperAdmin) {
        onUnauthorized();
      }
    }
  }, [userProfile, isLoading, onUnauthorized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = userProfile?.role === 'super_admin';

  if (!isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
