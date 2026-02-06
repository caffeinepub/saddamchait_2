import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, User, Calendar, Users } from 'lucide-react';

interface PendingUserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    uid: string;
    fullName: string;
    age: number;
    relation: string;
    phoneNumber: string;
    email: string;
    photoURL: string;
    role: string;
    approved: boolean;
    rejected?: boolean;
    blocked?: boolean;
  };
}

export default function PendingUserDetailsDialog({
  open,
  onOpenChange,
  user,
}: PendingUserDetailsDialogProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete signup information for review
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Photo and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL} alt={user.fullName} />
              <AvatarFallback className="text-lg">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.rejected ? 'destructive' : user.blocked ? 'destructive' : 'secondary'}>
                  {user.rejected ? 'Rejected' : user.blocked ? 'Blocked' : 'Pending'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-medium">{user.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="text-sm font-medium">{user.age} years</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Relation</p>
                  <p className="text-sm font-medium capitalize">{user.relation}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* User ID */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{user.uid}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
