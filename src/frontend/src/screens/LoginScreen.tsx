import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { signInWithEmail, getUserProfile } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrorMessages';
import { getPostLoginRoute } from '@/lib/postLoginRedirect';
import { useQueryClient } from '@tanstack/react-query';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToReset: () => void;
  onLoginSuccess: (redirectTo: '/chat' | '/pending-approval' | '/admin/users') => void;
}

export default function LoginScreen({ onNavigateToSignup, onNavigateToReset, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      console.log('LoginScreen - Attempting login for:', email);
      const result = await signInWithEmail(email, password);
      console.log('LoginScreen - Login result:', result);

      if (result.success && result.uid) {
        // Fetch user profile to determine redirect
        const profile = await getUserProfile(result.uid);
        console.log('LoginScreen - Profile fetched:', profile);

        if (!profile) {
          setError('Profile not found. Please contact support.');
          setIsLoggingIn(false);
          return;
        }

        // Pre-populate React Query cache with the fetched profile
        queryClient.setQueryData(['userProfile', result.uid], profile);
        console.log('LoginScreen - Profile cached in React Query for uid:', result.uid);

        // Check if user is blocked
        if (profile.blocked) {
          setError('Your account has been blocked. Please contact support.');
          setIsLoggingIn(false);
          return;
        }

        // Check if user is rejected
        if (profile.rejected) {
          setError('Rejected by admin');
          setIsLoggingIn(false);
          return;
        }

        // Use the shared redirect helper
        const redirectTo = getPostLoginRoute(profile);
        console.log('LoginScreen - Redirecting to:', redirectTo);
        onLoginSuccess(redirectTo);
      } else if (result.error) {
        // Firebase error
        console.log('LoginScreen - Firebase error:', result.error);
        const errorMessage = getFirebaseErrorMessage(result.error);
        setError(errorMessage);
        setIsLoggingIn(false);
      }
    } catch (err) {
      console.error('LoginScreen - Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Saddam Chat</h1>
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
