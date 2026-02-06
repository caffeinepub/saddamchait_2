import { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield } from 'lucide-react';
import { signOutUser } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileMenuProps {
  userProfile: {
    fullName: string;
    role: string;
    photoURL: string;
    email: string;
  };
  onNavigate: (route: any) => void;
  children: ReactNode;
}

export default function ProfileMenu({ userProfile, onNavigate, children }: ProfileMenuProps) {
  const queryClient = useQueryClient();
  const isSuperAdmin = userProfile.role === 'super_admin';
  const isUser = userProfile.role === 'user';
  
  // Read ONLY from Firestore userProfile prop (NOT Firebase Auth)
  const displayName = userProfile.fullName || 'User';

  console.log('ProfileMenu - Display name from Firestore:', displayName, 'role:', userProfile.role);

  const handleLogout = async () => {
    try {
      await signOutUser();
      queryClient.clear();
      onNavigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMyProfile = () => {
    onNavigate('/profile');
  };

  const handleAdminDashboard = () => {
    onNavigate('/admin/users');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {!isUser && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {userProfile.role.replace('_', ' ')}
                </Badge>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleMyProfile}>
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        
        {isSuperAdmin && (
          <DropdownMenuItem onClick={handleAdminDashboard}>
            <Shield className="mr-2 h-4 w-4" />
            Admin Dashboard
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
