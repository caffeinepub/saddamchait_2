import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import UsersScreen from './screens/UsersScreen';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminChatsScreen from './screens/admin/AdminChatsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import AuthenticatedRouteGuard from './components/auth/AuthenticatedRouteGuard';
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import AppHeader from './components/layout/AppHeader';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

type Route = 
  | '/login' 
  | '/signup' 
  | '/password-reset'
  | '/home' 
  | '/profile' 
  | '/chat' 
  | '/users'
  | '/pending-approval'
  | '/admin'
  | '/admin/users'
  | '/admin/chats'
  | '/admin/reports'
  | '/admin/settings';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('/login');

  const navigate = (route: Route) => {
    console.log('Navigating to:', route);
    setCurrentRoute(route);
  };

  useEffect(() => {
    console.log('Current route:', currentRoute);
  }, [currentRoute]);

  const renderContent = () => {
    switch (currentRoute) {
      case '/login':
        return (
          <LoginScreen 
            onNavigateToSignup={() => navigate('/signup')}
            onNavigateToReset={() => navigate('/password-reset')}
            onLoginSuccess={(redirectTo) => navigate(redirectTo)}
          />
        );
      case '/signup':
        return (
          <SignupScreen 
            onNavigateToLogin={() => navigate('/login')}
            onSignupSuccess={(redirectTo) => navigate(redirectTo)}
          />
        );
      case '/password-reset':
        return (
          <PasswordResetScreen 
            onNavigateToLogin={() => navigate('/login')}
          />
        );
      case '/home':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AppHeader onNavigate={navigate} />
            <HomeScreen />
          </AuthenticatedRouteGuard>
        );
      case '/profile':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AppHeader onNavigate={navigate} />
            <ProfileScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        );
      case '/chat':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AppHeader onNavigate={navigate} />
            <ChatScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        );
      case '/users':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AppHeader onNavigate={navigate} />
            <UsersScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        );
      case '/pending-approval':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
          >
            <PendingApprovalScreen onNavigateToLogin={() => navigate('/login')} />
          </AuthenticatedRouteGuard>
        );
      case '/admin':
      case '/admin/users':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminUsersScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        );
      case '/admin/chats':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminChatsScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        );
      case '/admin/reports':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminReportsScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        );
      case '/admin/settings':
        return (
          <AuthenticatedRouteGuard 
            onUnauthenticated={() => navigate('/login')}
            onUnapproved={() => navigate('/pending-approval')}
          >
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminSettingsScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        );
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p>Page not found</p>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {renderContent()}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
