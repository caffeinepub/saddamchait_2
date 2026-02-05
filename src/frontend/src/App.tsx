import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import HomeScreen from './screens/HomeScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminChatsScreen from './screens/admin/AdminChatsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import AppHeader from './components/layout/AppHeader';
import AuthenticatedRouteGuard from './components/auth/AuthenticatedRouteGuard';
import SuperAdminRouteGuard from './components/auth/SuperAdminRouteGuard';
import { useFirebaseAuthUser } from './hooks/useFirebaseAuthUser';

const queryClient = new QueryClient();

type Route = '/login' | '/signup' | '/reset' | '/pending-approval' | '/profile' | '/chat' | '/home' | '/admin' | '/admin/users' | '/admin/chats' | '/admin/reports' | '/admin/settings';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const path = window.location.pathname as Route;
    const validRoutes = ['/login', '/signup', '/reset', '/pending-approval', '/profile', '/chat', '/home', '/admin', '/admin/users', '/admin/chats', '/admin/reports', '/admin/settings'];
    if (validRoutes.includes(path)) {
      return path;
    }
    return '/login';
  });

  const { authUser } = useFirebaseAuthUser();

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as Route;
      const validRoutes = ['/login', '/signup', '/reset', '/pending-approval', '/profile', '/chat', '/home', '/admin', '/admin/users', '/admin/chats', '/admin/reports', '/admin/settings'];
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
        ) : currentRoute === '/chat' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <ChatScreen />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/home' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <HomeScreen />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminDashboardScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/users' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <SuperAdminRouteGuard onUnauthorized={() => navigate('/admin')}>
              <AdminUsersScreen onNavigate={navigate} />
            </SuperAdminRouteGuard>
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/chats' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminChatsScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/reports' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminReportsScreen onNavigate={navigate} />
          </AuthenticatedRouteGuard>
        ) : currentRoute === '/admin/settings' ? (
          <AuthenticatedRouteGuard onUnauthorized={() => navigate('/login')}>
            <AdminSettingsScreen onNavigate={navigate} />
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
