import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import { Mail, User, Shield, Settings } from 'lucide-react';

type Route = 
  | '/login' 
  | '/signup' 
  | '/password-reset'
  | '/home' 
  | '/profile' 
  | '/chat' 
  | '/users'
  | '/pending-approval'
  | '/admin'
  | '/admin/users'
  | '/admin/chats'
  | '/admin/reports'
  | '/admin/settings';

interface ProfileScreenProps {
  onNavigate?: (route: Route) => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { data: userProfile, isLoading } = useFirestoreUserProfile();
  const { authUser } = useFirebaseAuthUser();

  console.log('ProfileScreen - Rendering with userProfile:', userProfile, 'authUser:', authUser, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim().length === 0) return '??';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const isSuperAdmin = userProfile.role === 'super_admin';
  
  // Prefer Firebase Auth data when available, fallback to Firestore
  const photoURL = (authUser?.photoURL || userProfile.photoURL || '').trim();
  const hasPhoto = photoURL.length > 0;
  const displayName = authUser?.displayName || userProfile.fullName;
  const displayEmail = authUser?.email || userProfile.email;

  console.log('ProfileScreen - Display bindings:', {
    displayName: displayName,
    displayEmail: displayEmail,
    hasPhoto: hasPhoto,
    photoURL: hasPhoto ? photoURL.substring(0, 50) + '...' : '(empty)',
    role: userProfile.role,
    isSuperAdmin: isSuperAdmin,
    source: authUser?.displayName ? 'Firebase Auth' : 'Firestore users/{uid}'
  });

  const handleAdminDashboard = () => {
    if (onNavigate) {
      onNavigate('/admin/users');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal details and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {hasPhoto && <AvatarImage src={photoURL} alt={displayName} />}
                <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{displayName}</h2>
                {isSuperAdmin && (
                  <Badge variant="outline" className="capitalize">
                    {userProfile.role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base">{displayName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-base">{displayEmail}</p>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Account Role</p>
                    <p className="text-base capitalize">{userProfile.role.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
            </div>

            {isSuperAdmin && (
              <>
                <Separator />
                <div className="pt-2">
                  <Button 
                    onClick={handleAdminDashboard}
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Open Admin Dashboard
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Manage users, review pending approvals, and configure app settings
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
