import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import ProfileMenu from './ProfileMenu';

interface AppHeaderProps {
  onNavigate: (route: any) => void;
}

export default function AppHeader({ onNavigate }: AppHeaderProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  console.log('AppHeader - userProfile:', userProfile, 'isLoading:', isLoading);

  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const photoURL = userProfile?.photoURL?.trim() || '';
  const hasPhoto = photoURL.length > 0;
  const displayName = userProfile?.name || 'User';

  console.log('AppHeader - Rendering with:', {
    hasPhoto,
    photoURL,
    displayName
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

        {!isLoading && userProfile && (
          <ProfileMenu userProfile={userProfile} onNavigate={onNavigate}>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                {hasPhoto && <AvatarImage src={photoURL} alt={displayName} />}
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </button>
          </ProfileMenu>
        )}
      </div>
    </header>
  );
}
