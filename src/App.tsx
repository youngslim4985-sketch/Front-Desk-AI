import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Widget from './components/Widget';
import AutonomousDashboard from './components/AutonomousDashboard';

type View = 'landing' | 'login' | 'onboarding' | 'dashboard' | 'autonomous';

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
        <LandingPage onStart={handleStart} onLogin={() => setView('login')} />
      )}
      
      {view === 'login' && (
        <Login onLogin={handleLogin} onBack={() => setView('landing')} />
      )}

      {view === 'onboarding' && (
        <Onboarding onComplete={() => {
          setIsLoggedIn(true);
          setView('dashboard');
        }} />
      )}

      {view === 'dashboard' && isLoggedIn && (
        <Dashboard onSwitch={() => setView('autonomous')} />
      )}

      {view === 'autonomous' && isLoggedIn && (
        <AutonomousDashboard onBack={() => setView('dashboard')} />
      )}

      {/* Floating Chat Widget for Demo (Except in Dashboard) */}
      {view !== 'dashboard' && (
        <Widget 
          businessName="T & F Investments" 
          businessId="tf-invest-123" 
        />
      )}
    </div>
  );
}
