import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';

type Screen = 'login' | 'signup' | 'reset';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'login' ? (
        <LoginScreen 
          onNavigateToSignup={() => setCurrentScreen('signup')}
          onNavigateToReset={() => setCurrentScreen('reset')}
        />
      ) : currentScreen === 'signup' ? (
        <SignupScreen onNavigateToLogin={() => setCurrentScreen('login')} />
      ) : (
        <PasswordResetScreen onNavigateToLogin={() => setCurrentScreen('login')} />
      )}
    </div>
  );
}

export default App;
