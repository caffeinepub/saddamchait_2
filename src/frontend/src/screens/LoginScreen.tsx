import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { signInWithEmail } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrorMessages';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToReset: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onNavigateToSignup, onNavigateToReset, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingApproval(false);
    setIsLoggingIn(true);

    try {
      console.log('LoginScreen - Attempting login for:', email);
      const result = await signInWithEmail(email, password);
      console.log('LoginScreen - Login result:', result);

      if (result.success) {
        // Login successful - user is approved
        console.log('LoginScreen - Login successful, user is approved, navigating to /home');
        onLoginSuccess();
      } else if (result.needsApproval) {
        // User exists but not approved or profile missing
        console.log('LoginScreen - User needs approval');
        setPendingApproval(true);
      } else if (result.error) {
        // Firebase error
        console.log('LoginScreen - Firebase error:', result.error);
        const errorMessage = getFirebaseErrorMessage(result.error);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('LoginScreen - Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">saddamchait</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Please login to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {pendingApproval && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your account is pending admin approval. Please contact an administrator to activate your account.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setPendingApproval(false);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setPendingApproval(false);
              }}
              required
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={onNavigateToReset}
              className="text-sm font-medium text-primary hover:underline focus:outline-none focus:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="font-medium text-primary hover:underline focus:outline-none focus:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
