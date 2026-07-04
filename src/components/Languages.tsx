import React from 'react';
import { useLanguages } from '../hooks/useLanguages';
import { Globe, Check, AlertCircle, RefreshCw, Save, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Languages({ businessId }: { businessId: string }) {
  const {
    draftLanguages,
    isLoading,
    isSaving,
    error,
    hasChanges,
    toggleLanguageDraft,
    setDefaultLanguageDraft,
    resetDraft,
    saveLanguages
  } = useLanguages(businessId);

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSave = async () => {
    setSuccessMessage(null);
    const success = await saveLanguages();
    if (success) {
      setSuccessMessage('Language configuration updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-sm font-mono uppercase tracking-widest">Loading Languages...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Multi-lingual Routing</h2>
          <p className="text-xs text-white/40">Configure which languages LexGuard AI understands and speaks on call triggers.</p>
        </div>
        
        {hasChanges && (
          <span className="bg-amber-600/10 border border-amber-600/20 text-amber-400 text-[10px] uppercase font-mono px-2 py-1 rounded tracking-wider animate-pulse">
            Unsaved Modifications
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-600/10 border border-rose-600/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 animate-pulse" />
          {successMessage}
        </div>
      )}

      <div className="bg-obsidian-light border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        {draftLanguages.map((lang) => (
          <div 
            key={lang.code}
            className={`p-5 flex items-center justify-between transition-colors ${
              lang.isDefault ? 'bg-gold/5' : 'hover:bg-white/[0.01]'
            }`}
          >
            <div className="flex items-center gap-4">
              <input 
                type="checkbox"
                id={`check-${lang.code}`}
                checked={lang.enabled}
                onChange={() => toggleLanguageDraft(lang.code)}
                disabled={lang.isDefault}
                className="w-4 h-4 rounded border-white/10 bg-obsidian text-gold focus:ring-gold accent-gold"
              />
              <label htmlFor={`check-${lang.code}`} className="cursor-pointer select-none">
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${lang.enabled ? 'text-gold' : 'text-white/20'}`} />
                  {lang.name}
                </p>
                <p className="text-xs text-white/30 font-mono">Locale: {lang.code.toUpperCase()}</p>
              </label>
            </div>

            <div className="flex items-center gap-4">
              {lang.isDefault ? (
                <span className="bg-gold text-obsidian text-[10px] font-bold px-2.5 py-1 rounded font-mono uppercase tracking-widest">
                  Primary Language
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setDefaultLanguageDraft(lang.code)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    lang.enabled 
                      ? 'border-white/10 text-white/60 hover:border-gold hover:text-gold' 
                      : 'border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                  disabled={!lang.enabled}
                >
                  Set Primary
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={resetDraft}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/60 hover:text-white rounded-xl text-sm transition-all hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4" />
            Discard Changes
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-obsidian font-bold rounded-xl text-sm hover:bg-white transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Commit Language Settings
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
