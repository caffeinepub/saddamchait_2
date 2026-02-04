import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

interface PasswordResetScreenProps {
  onNavigateToLogin: () => void;
}

export default function PasswordResetScreen({ onNavigateToLogin }: PasswordResetScreenProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only - no backend logic, no email sending
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Check Your Email</h1>
          </div>

          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
              <br />
              <span className="text-xs text-muted-foreground">(UI placeholder - no actual email sent)</span>
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
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

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
            Send Reset Instructions
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
