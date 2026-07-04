import { useState } from 'react';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Widget from './components/Widget';
import AutonomousDashboard from './components/AutonomousDashboard';
import ChatInterface from './components/ChatInterface';
import LaunchBrief from './components/LaunchBrief';
import GoToMarketKit from './components/GoToMarketKit';

type View = 'landing' | 'login' | 'onboarding' | 'dashboard' | 'autonomous' | 'chat' | 'brief' | 'launch';

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
    <div className="min-h-screen bg-obsidian text-white">
      {/* Universal Navigation for Demo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gold flex items-center justify-center font-bold text-obsidian">L</div>
          <span className="font-display font-bold tracking-tight text-xl">LexGuard<span className="text-gold">AI</span></span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-white/60">
          <button onClick={() => setView('landing')} className={`hover:text-gold transition-colors ${view === 'landing' ? 'text-gold' : ''}`}>System</button>
          <button onClick={() => setView('chat')} className={`hover:text-gold transition-colors ${view === 'chat' ? 'text-gold' : ''}`}>AI Console</button>
          <button onClick={() => setView('brief')} className={`hover:text-gold transition-colors ${view === 'brief' ? 'text-gold' : ''}`}>Brief</button>
          <button onClick={() => setView('launch')} className={`hover:text-gold transition-colors ${view === 'launch' ? 'text-gold' : ''}`}>🚀 Launch</button>
          <button onClick={() => setView('dashboard')} className={`hover:text-gold transition-colors ${view === 'dashboard' ? 'text-gold' : ''}`}>Admin</button>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-12">
        {view === 'landing' && (
          <LandingPage onStart={handleStart} onLogin={() => setView('login')} />
        )}
        
        {view === 'login' && (
          <Login onLogin={handleLogin} onBack={() => setView('landing')} />
        )}

        {view === 'onboarding' && (
          <OnboardingWizard onComplete={() => {
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

        {view === 'chat' && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-display font-bold text-white">Advanced AI Orchestration</h2>
              <p className="text-white/40 max-w-md mx-auto">Interact with the hardened Claude autonomous loop with tool-calling capabilities.</p>
            </div>
            <ChatInterface />
          </div>
        )}

        {view === 'brief' && (
          <LaunchBrief />
        )}

        {view === 'launch' && (
          <GoToMarketKit />
        )}
      </main>

      {/* Floating Chat Widget for Demo */}
      {view !== 'chat' && view !== 'brief' && view !== 'launch' && (
        <Widget 
          businessName="T & F Investments" 
          businessId="tf-invest-123" 
        />
      )}
    </div>
  );
}
