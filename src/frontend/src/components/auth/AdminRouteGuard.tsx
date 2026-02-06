import { ReactNode, useEffect } from 'react';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';

interface AdminRouteGuardProps {
  children: ReactNode;
  onUnauthorized: () => void;
}

export default function AdminRouteGuard({ children, onUnauthorized }: AdminRouteGuardProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  useEffect(() => {
    if (!isLoading && userProfile) {
      const isAdmin = userProfile.role === 'super_admin' || userProfile.role === 'helper_admin';
      if (!isAdmin) {
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

  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'helper_admin';

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
