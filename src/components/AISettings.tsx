import React, { useState, useEffect } from 'react';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { Save, Loader2, Sparkles, MessageSquare, Phone, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AISettings({ businessId }: { businessId: string }) {
  const { settings, isLoading, isSaving, error, saveSettings } = useBusinessSettings(businessId);
  const [localForm, setLocalForm] = useState(settings);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync with hook updates when fully loaded
  useEffect(() => {
    if (settings) {
      setLocalForm(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    const success = await saveSettings(localForm);
    if (success) {
      setSuccessMessage('AI configuration successfully synchronized!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-sm font-mono uppercase tracking-widest">Loading AI Settings...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white">AI Agent Core</h2>
          <p className="text-xs text-white/40">Adjust the personality, directive context, and backup targets of LexGuard AI.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-600/10 border border-rose-600/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AI Persona */}
          <div className="p-6 bg-obsidian-light border border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm font-display uppercase tracking-wider text-gold">
              <Sparkles className="w-4 h-4" />
              Personality & Vibe
            </h3>
            
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-white/40 uppercase font-mono">Agent Personality</span>
                <select 
                  className="mt-1 w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  value={localForm.aiPersonality}
                  onChange={e => setLocalForm({ ...localForm, aiPersonality: e.target.value as any })}
                >
                  <option value="friendly">Warm & Empathetic (Family Law, Care)</option>
                  <option value="professional">Sovereign & Formal (Corporate, IP, Standard)</option>
                  <option value="assertive">Assertive & Strategic (Criminal Defense, PI)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-white/40 uppercase font-mono">Greeting Message</span>
                <textarea 
                  className="mt-1 w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors h-24 resize-none leading-relaxed"
                  value={localForm.greetingMessage}
                  onChange={e => setLocalForm({ ...localForm, greetingMessage: e.target.value })}
                  placeholder="Welcome greeting..."
                />
              </label>
            </div>
          </div>

          {/* Backup Targets */}
          <div className="p-6 bg-obsidian-light border border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm font-display uppercase tracking-wider text-gold">
              <Phone className="w-4 h-4" />
              Safety & Routing
            </h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-white/40 uppercase font-mono">Emergency Forwarding Target</span>
                <input 
                  type="text"
                  className="mt-1 w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  value={localForm.forwardingNumber}
                  onChange={e => setLocalForm({ ...localForm, forwardingNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </label>

              <label className="block">
                <span className="text-xs text-white/40 uppercase font-mono flex items-center gap-1">
                  Response Tone Guidelines 
                  <HelpCircle className="w-3 h-3 text-white/20" title="Instruct how the AI should respond to clients" />
                </span>
                <textarea 
                  className="mt-1 w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors h-24 resize-none leading-relaxed"
                  value={localForm.responseTone}
                  onChange={e => setLocalForm({ ...localForm, responseTone: e.target.value })}
                  placeholder="e.g. Keep answers under 3 sentences..."
                />
              </label>
            </div>
          </div>
        </div>

        {/* System Prompt Context */}
        <div className="p-6 bg-obsidian-light border border-white/5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm font-display uppercase tracking-wider text-gold">
            <MessageSquare className="w-4 h-4" />
            System Prompt Context & Directives
          </h3>
          <p className="text-xs text-white/30">
            This represents the core compilation instructions injected into Claude’s runtime for tool orchestration.
          </p>
          <textarea 
            className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-gold transition-colors h-36 resize-none leading-relaxed"
            value={localForm.promptContext}
            onChange={e => setLocalForm({ ...localForm, promptContext: e.target.value })}
            placeholder="System prompt context..."
          />
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-gold text-obsidian font-bold px-6 py-3 rounded-xl hover:bg-white transition-all text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save AI Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
