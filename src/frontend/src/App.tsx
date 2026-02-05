import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import HomeScreen from './screens/HomeScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminChatsScreen from './screens/admin/AdminChatsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import AppHeader from './components/layout/AppHeader';
import { useFirebaseAuthUser } from './hooks/useFirebaseAuthUser';

const queryClient = new QueryClient();

type Route = '/login' | '/signup' | '/reset' | '/home' | '/admin' | '/admin/users' | '/admin/chats' | '/admin/reports' | '/admin/settings';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const path = window.location.pathname as Route;
    const validRoutes = ['/login', '/signup', '/reset', '/home', '/admin', '/admin/users', '/admin/chats', '/admin/reports', '/admin/settings'];
    if (validRoutes.includes(path)) {
      return path;
    }
    return '/login';
  });

  const { authUser } = useFirebaseAuthUser();

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as Route;
      const validRoutes = ['/login', '/signup', '/reset', '/home', '/admin', '/admin/users', '/admin/chats', '/admin/reports', '/admin/settings'];
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

  const isAuthRoute = currentRoute === '/login' || currentRoute === '/signup' || currentRoute === '/reset';
  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAuthRoute && <AppHeader onNavigate={navigate} />}
      
      <div className="flex-1">
        {currentRoute === '/login' ? (
          <LoginScreen 
            onNavigateToSignup={() => navigate('/signup')}
            onNavigateToReset={() => navigate('/reset')}
            onLoginSuccess={() => navigate('/home')}
          />
        ) : currentRoute === '/signup' ? (
          <SignupScreen onNavigateToLogin={() => navigate('/login')} />
        ) : currentRoute === '/reset' ? (
          <PasswordResetScreen onNavigateToLogin={() => navigate('/login')} />
        ) : currentRoute === '/home' ? (
          <HomeScreen />
        ) : currentRoute === '/admin' ? (
          <AdminDashboardScreen onNavigate={navigate} />
        ) : currentRoute === '/admin/users' ? (
          <AdminUsersScreen onNavigate={navigate} />
        ) : currentRoute === '/admin/chats' ? (
          <AdminChatsScreen onNavigate={navigate} />
        ) : currentRoute === '/admin/reports' ? (
          <AdminReportsScreen onNavigate={navigate} />
        ) : currentRoute === '/admin/settings' ? (
          <AdminSettingsScreen onNavigate={navigate} />
        ) : (
          <HomeScreen />
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
