import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Mail, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

interface PendingApprovalScreenProps {
  onNavigateToLogin: () => void;
}

export default function PendingApprovalScreen({ onNavigateToLogin }: PendingApprovalScreenProps) {
  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Pending approval for admin</h1>
            <p className="text-sm text-muted-foreground">
              Your account is awaiting approval from an administrator
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
            <CardDescription>
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Admin Review</p>
                <p className="text-xs text-muted-foreground">
                  An administrator will review your account and approve access within 24-48 hours.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <AlertCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email Notification</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive an email notification once your account has been approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Need immediate access?</AlertTitle>
          <AlertDescription>
            Contact your system administrator if you need urgent access to the platform.
          </AlertDescription>
        </Alert>

        <Button onClick={onNavigateToLogin} variant="outline" className="w-full">
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  );
}
