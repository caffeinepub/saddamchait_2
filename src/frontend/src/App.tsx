import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import ProfileScreen from './screens/ProfileScreen';
import UsersScreen from './screens/UsersScreen';
import ChatScreen from './screens/ChatScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminChatsScreen from './screens/admin/AdminChatsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import AppHeader from './components/layout/AppHeader';
import AuthenticatedRouteGuard from './components/auth/AuthenticatedRouteGuard';
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import { useFirebaseAuthUser } from './hooks/useFirebaseAuthUser';

const queryClient = new QueryClient();

type Route = '/login' | '/signup' | '/reset' | '/pending-approval' | '/profile' | '/users' | '/chat' | '/admin' | '/admin/users' | '/admin/chats' | '/admin/reports' | '/admin/settings';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const path = window.location.pathname as Route;
    const validRoutes = ['/login', '/signup', '/reset', '/pending-approval', '/profile', '/users', '/chat', '/admin', '/admin/users', '/admin/chats', '/admin/reports', '/admin/settings'];
    if (validRoutes.includes(path)) {
      return path;
    }
    return '/login';
  });

  const { authUser } = useFirebaseAuthUser();

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as Route;
      const validRoutes = ['/login', '/signup', '/reset', '/pending-approval', '/profile', '/users', '/chat', '/admin', '/admin/users', '/admin/chats', '/admin/reports', '/admin/settings'];
      if (validRoutes.includes(path)) {
        setCurrentRoute(path);
      } else {
        setCurrentRoute('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: Route) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
  };

  const isAuthRoute = currentRoute === '/login' || currentRoute === '/signup' || currentRoute === '/reset' || currentRoute === '/pending-approval';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAuthRoute && <AppHeader onNavigate={navigate} />}
      
      <div className="flex-1">
        {currentRoute === '/login' ? (
          <LoginScreen 
            onNavigateToSignup={() => navigate('/signup')}
            onNavigateToReset={() => navigate('/reset')}
            onLoginSuccess={(redirectTo) => navigate(redirectTo)}
          />
        ) : currentRoute === '/signup' ? (
          <SignupScreen 
            onNavigateToLogin={() => navigate('/login')}
            onSignupSuccess={(redirectTo) => navigate(redirectTo)}
          />
        ) : currentRoute === '/reset' ? (
          <PasswordResetScreen onNavigateToLogin={() => navigate('/login')} />
        ) : currentRoute === '/pending-approval' ? (
          <PendingApprovalScreen onNavigateToLogin={() => navigate('/login')} />
        ) : currentRoute === '/profile' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <ProfileScreen />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/users' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <UsersScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/chat' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <ChatScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminDashboardScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/users' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminUsersScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/chats' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminChatsScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/reports' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminReportsScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/settings' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminRouteGuard onUnauthorized={() => navigate('/chat')}>
              <AdminSettingsScreen onNavigate={navigate} />
            </AdminRouteGuard>
          </AuthenticatedRouteGuard>
        ) : (
          <LoginScreen 
            onNavigateToSignup={() => navigate('/signup')}
            onNavigateToReset={() => navigate('/reset')}
            onLoginSuccess={(redirectTo) => navigate(redirectTo)}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
