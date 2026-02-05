import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

interface PasswordResetScreenProps {
  onNavigateToLogin: () => void;
}

export default function PasswordResetScreen({ onNavigateToLogin }: PasswordResetScreenProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only - no backend logic, no email sending, no Firebase API call
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Request Submitted</h1>
          </div>

          <Alert className="border-primary/50 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle>Password Reset - Admin Only</AlertTitle>
            <AlertDescription>
              Password resets are handled manually by an Admin only. Your request for <strong>{email}</strong> has been noted. 
              An administrator will contact you to complete the password reset process.
            </AlertDescription>
          </Alert>

          <Button onClick={onNavigateToLogin} className="w-full">
            Back to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Password resets are handled manually by an Admin. Enter your email to submit a reset request.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            An administrator will review your request and contact you to complete the password reset.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Reset Request
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-medium text-primary hover:underline focus:outline-none focus:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
