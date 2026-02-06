import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

interface PasswordResetScreenProps {
  onNavigateToLogin: () => void;
}

export default function PasswordResetScreen({ onNavigateToLogin }: PasswordResetScreenProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Password Reset</h1>
          <p className="text-sm text-muted-foreground">
            Contact admin for password reset assistance
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Admin-Only Password Reset</AlertTitle>
              <AlertDescription>
                For security reasons, password resets must be performed manually by an administrator.
                Please contact your system administrator to request a password reset.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full">
              I Understand - Request Admin Reset
            </Button>
          </form>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Request Acknowledged</AlertTitle>
            <AlertDescription>
              Please contact your administrator directly to complete the password reset process.
              They will assist you with resetting your password manually.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={onNavigateToLogin}
          variant="ghost"
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  );
}
