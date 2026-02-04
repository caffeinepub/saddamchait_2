import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/auth/AuthLayout';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToReset: () => void;
}

export default function LoginScreen({ onNavigateToSignup, onNavigateToReset }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only - no backend logic yet
    console.log('Login attempt:', { email, password });
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <Button type="submit" className="w-full">
            Login
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
