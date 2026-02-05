import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import ProfileMenu from './ProfileMenu';

interface AppHeaderProps {
  onNavigate: (route: any) => void;
}

export default function AppHeader({ onNavigate }: AppHeaderProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/app-logo.dim_256x256.png" 
            alt="App Logo" 
            className="h-8 w-8"
          />
          <h1 className="text-lg font-semibold">Admin Portal</h1>
        </div>

        {!isLoading && userProfile && (
          <ProfileMenu userProfile={userProfile} onNavigate={onNavigate}>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          </ProfileMenu>
        )}
      </div>
    </header>
  );
}
