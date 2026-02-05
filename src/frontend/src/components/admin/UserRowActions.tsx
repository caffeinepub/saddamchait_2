import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserCheck, UserX, Shield, User } from 'lucide-react';
import { useState } from 'react';

interface UserRowActionsProps {
  user: {
    uid: string;
    name: string;
    role: string;
    approved: boolean;
  };
  currentUserRole: string;
  isSuperAdmin: boolean;
  onApprove: () => void;
  onBlock: () => void;
  onChangeRole: (role: 'user' | 'admin') => void;
  isUpdating: boolean;
}

export default function UserRowActions({
  user,
  currentUserRole,
  isSuperAdmin,
  onApprove,
  onBlock,
  onChangeRole,
  isUpdating,
}: UserRowActionsProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [targetRole, setTargetRole] = useState<'user' | 'admin'>('user');

  const isSuperAdminUser = user.role === 'super_admin';
  const isAdminUser = user.role === 'admin';
  const canModify = !isSuperAdminUser || isSuperAdmin;

  const handleApprove = () => {
    onApprove();
    setShowApproveDialog(false);
  };

  const handleBlock = () => {
    onBlock();
    setShowBlockDialog(false);
  };

  const handleChangeRole = () => {
    onChangeRole(targetRole);
    setShowRoleDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isUpdating}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {!user.approved && canModify && (
            <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Approve User
            </DropdownMenuItem>
          )}
          
          {user.approved && canModify && (
            <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
              <UserX className="mr-2 h-4 w-4" />
              Block User
            </DropdownMenuItem>
          )}
          
          {!isSuperAdminUser && canModify && (
            <>
              <DropdownMenuSeparator />
              {user.role === 'user' && (
                <DropdownMenuItem
                  onClick={() => {
                    setTargetRole('admin');
                    setShowRoleDialog(true);
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Promote to Admin
                </DropdownMenuItem>
              )}
              {isAdminUser && (
                <DropdownMenuItem
                  onClick={() => {
                    setTargetRole('user');
                    setShowRoleDialog(true);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Demote to User
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {user.name}? They will be able to log in to the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {user.name}? They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {user.name}'s role to {targetRole}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeRole}>Change Role</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
