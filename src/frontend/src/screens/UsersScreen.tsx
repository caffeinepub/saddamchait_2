import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { Loader2 } from 'lucide-react';
import ApprovedUsersListView from './users/ApprovedUsersListView';

interface UsersScreenProps {
  onNavigate: (route: any) => void;
}

export default function UsersScreen({ onNavigate }: UsersScreenProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  // All users see the unified Users List view
  return <ApprovedUsersListView onNavigate={onNavigate} />;
}
