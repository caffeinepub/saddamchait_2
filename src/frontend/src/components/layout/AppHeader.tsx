import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import ProfileMenu from './ProfileMenu';

interface AppHeaderProps {
  onNavigate: (route: any) => void;
}

export default function AppHeader({ onNavigate }: AppHeaderProps) {
  const { data: userProfile, isLoading: profileLoading } = useFirestoreUserProfile();
  const { authUser } = useFirebaseAuthUser();

  console.log('AppHeader - Rendering with userProfile:', userProfile, 'authUser:', authUser, 'isLoading:', profileLoading);

  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim().length === 0) return '??';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Prefer Firebase Auth data when available, fallback to Firestore
  const photoURL = (authUser?.photoURL || userProfile?.photoURL || '').trim();
  const hasPhoto = photoURL.length > 0;
  const displayName = authUser?.displayName || userProfile?.fullName || 'User';

  console.log('AppHeader - Display bindings:', {
    displayName: displayName,
    hasPhoto: hasPhoto,
    photoURL: hasPhoto ? photoURL.substring(0, 50) + '...' : '(empty)',
    source: authUser?.displayName ? 'Firebase Auth' : 'Firestore users/{uid}'
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/app-logo.dim_256x256.png" 
            alt="App Logo" 
            className="h-8 w-8"
          />
          <h1 className="text-lg font-semibold">Saddam Chat</h1>
        </div>

        {!profileLoading && userProfile && (
          <ProfileMenu onNavigate={onNavigate} />
        )}
      </div>
    </header>
  );
}
