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
import { MoreHorizontal, UserCheck, UserX, Ban, Shield, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface UserRowActionsProps {
  user: {
    uid: string;
    fullName: string;
    role: string;
    approved: boolean;
    rejected?: boolean;
    blocked?: boolean;
  };
  currentUserRole: string;
  isSuperAdmin: boolean;
  isHelperAdmin: boolean;
  onApprove: () => void;
  onReject: () => void;
  onBlock?: () => void;
  onPromoteToHelperAdmin?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  isUpdating: boolean;
}

export default function UserRowActions({
  user,
  currentUserRole,
  isSuperAdmin,
  isHelperAdmin,
  onApprove,
  onReject,
  onBlock,
  onPromoteToHelperAdmin,
  onDelete,
  onViewDetails,
  isUpdating,
}: UserRowActionsProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleApprove = () => {
    onApprove();
    setShowApproveDialog(false);
  };

  const handleReject = () => {
    onReject();
    setShowRejectDialog(false);
  };

  const handleBlock = () => {
    if (onBlock) {
      onBlock();
    }
    setShowBlockDialog(false);
  };

  const handlePromote = () => {
    if (onPromoteToHelperAdmin) {
      onPromoteToHelperAdmin();
    }
    setShowPromoteDialog(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteDialog(false);
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
          
          {onViewDetails && (
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
            <UserCheck className="mr-2 h-4 w-4" />
            Approve User
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
            <UserX className="mr-2 h-4 w-4" />
            Reject User
          </DropdownMenuItem>
          
          {isSuperAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                <Ban className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
              
              {user.role === 'user' && (
                <DropdownMenuItem onClick={() => setShowPromoteDialog(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Make Helper Admin
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {user.fullName}? They will gain access to the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {user.fullName}? They will not be able to access the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {user.fullName}? This will immediately revoke their access.
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

      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Helper Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote {user.fullName} to Helper Admin? They will gain administrative privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromote}>Promote</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {user.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
