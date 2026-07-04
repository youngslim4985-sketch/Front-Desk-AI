import React from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { Calendar, Link2, Unlink, Check, AlertCircle, Loader2, MessageSquare, Briefcase, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Integrations({ businessId }: { businessId: string }) {
  const { integrations, isLoading, error, connectIntegration, disconnectIntegration } = useIntegrations(businessId);
  const [activeError, setActiveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (error) {
      setActiveError(error);
    }
  }, [error]);

  const handleToggle = async (id: string, connected: boolean) => {
    setActiveError(null);
    if (connected) {
      await disconnectIntegration(id);
    } else {
      await connectIntegration(id);
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'google_calendar':
        return <Calendar className="w-5 h-5 text-gold" />;
      case 'clio':
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'mycase':
        return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5 text-rose-400" />;
      default:
        return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-sm font-mono uppercase tracking-widest">Loading Integrations...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold font-display text-white">OAuth Integrations</h2>
        <p className="text-xs text-white/40">Securely link calendars, practice CRMs, and chat dispatchers directly to LexGuard AI's decision loop.</p>
      </div>

      {activeError && (
        <div className="p-4 bg-rose-600/10 border border-rose-600/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {activeError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between h-48 bg-obsidian-light ${
              integration.connected 
                ? 'border-gold/20 shadow-lg shadow-gold/[0.02]' 
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  {getIcon(integration.id)}
                </div>
                {integration.connected ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/10 border border-emerald-600/20 rounded-full text-[10px] uppercase font-bold text-emerald-400">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] uppercase font-bold text-white/40">
                    Inactive
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-tight">{integration.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed mt-1">{integration.description}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleToggle(integration.id, integration.connected)}
                disabled={integration.connecting}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  integration.connected 
                    ? 'bg-white/5 hover:bg-rose-600/10 hover:text-rose-400 border border-white/5 hover:border-rose-600/20 text-white/60' 
                    : 'bg-gold hover:bg-white text-obsidian'
                }`}
              >
                {integration.connecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting Secure OAuth...
                  </>
                ) : integration.connected ? (
                  <>
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect Integration
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    Connect {integration.name}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
