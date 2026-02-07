import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import UsersScreen from './screens/UsersScreen';
import ProfileScreen from './screens/ProfileScreen';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminChatsScreen from './screens/admin/AdminChatsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
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
  | '/chat' 
  | '/users' 
  | '/profile' 
  | '/pending-approval'
  | '/admin'
  | '/admin/users'
  | '/admin/chats'
  | '/admin/reports'
  | '/admin/settings'
  | { path: '/chat'; chatId: string };

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('/login');

  const handleNavigate = (route: Route) => {
    setCurrentRoute(route);
  };

  const renderScreen = () => {
    // Handle chat with chatId
    if (typeof currentRoute === 'object' && currentRoute.path === '/chat') {
      return <ChatScreen onNavigate={handleNavigate} chatId={currentRoute.chatId} />;
    }

    // Handle string routes
    switch (currentRoute) {
      case '/login':
        return (
          <LoginScreen
            onNavigateToSignup={() => handleNavigate('/signup')}
            onNavigateToReset={() => handleNavigate('/password-reset')}
            onLoginSuccess={(redirectTo) => handleNavigate(redirectTo)}
          />
        );
      case '/signup':
        return (
          <SignupScreen
            onNavigateToLogin={() => handleNavigate('/login')}
            onSignupSuccess={(redirectTo) => handleNavigate(redirectTo)}
          />
        );
      case '/password-reset':
        return (
          <PasswordResetScreen
            onNavigateToLogin={() => handleNavigate('/login')}
          />
        );
      case '/home':
        return <HomeScreen />;
      case '/chat':
        return <ChatScreen onNavigate={handleNavigate} />;
      case '/users':
        return <UsersScreen onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfileScreen />;
      case '/pending-approval':
        return (
          <PendingApprovalScreen
            onNavigateToLogin={() => handleNavigate('/login')}
          />
        );
      case '/admin':
        return <AdminDashboardScreen onNavigate={handleNavigate} />;
      case '/admin/users':
        return <AdminUsersScreen onNavigate={handleNavigate} />;
      case '/admin/chats':
        return <AdminChatsScreen onNavigate={handleNavigate} />;
      case '/admin/reports':
        return <AdminReportsScreen onNavigate={handleNavigate} />;
      case '/admin/settings':
        return <AdminSettingsScreen onNavigate={handleNavigate} />;
      default:
        return (
          <LoginScreen
            onNavigateToSignup={() => handleNavigate('/signup')}
            onNavigateToReset={() => handleNavigate('/password-reset')}
            onLoginSuccess={(redirectTo) => handleNavigate(redirectTo)}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {renderScreen()}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
