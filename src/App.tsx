import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

type View = 'landing' | 'login' | 'onboarding' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle successful login
  const handleLogin = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  // Handle starting onboarding from landing
  const handleStart = () => {
    setView('onboarding');
  };

  return (
    <div className="min-h-screen bg-black">
      {view === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      
      {view === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {view === 'onboarding' && (
        <Onboarding onComplete={() => {
          setIsLoggedIn(true);
          setView('dashboard');
        }} />
      )}

      {view === 'dashboard' && isLoggedIn && (
        <Dashboard />
      )}

      {/* Simple navigation helper for demo purposes */}
      {view === 'landing' && (
        <button 
          onClick={() => setView('login')}
          className="fixed bottom-8 right-8 text-slate-500 hover:text-white text-sm font-medium transition-colors"
        >
          Already have an account? Login
        </button>
      )}
    </div>
  );
}
