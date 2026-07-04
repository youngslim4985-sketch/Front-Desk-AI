import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Phone, 
  Rocket, 
  ChevronRight, 
  ArrowLeft, 
  Globe, 
  Calendar, 
  Sparkles, 
  Check, 
  Loader2 
} from 'lucide-react';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { useLanguages } from '../hooks/useLanguages';
import { useIntegrations } from '../hooks/useIntegrations';

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const businessId = "tf-invest-123"; // Standard demo context businessId

  // Hooks Integration
  const { settings, isSaving: isSavingSettings, saveSettings } = useBusinessSettings(businessId);
  const { draftLanguages, toggleLanguageDraft, saveLanguages } = useLanguages(businessId);
  const { integrations, connectIntegration } = useIntegrations(businessId);

  // Local Form state synced from loaded settings
  const [form, setForm] = useState({
    businessName: settings?.businessName || '',
    phone: settings?.phone || '',
    industry: settings?.industry || 'Legal (Personal Injury)'
  });

  const [savingStep, setSavingStep] = useState(false);

  const nextStep = async () => {
    if (step === 1) {
      setSavingStep(true);
      // Save settings
      await saveSettings({
        ...settings,
        businessName: form.businessName,
        phone: form.phone,
        industry: form.industry
      });
      setSavingStep(false);
      setStep(2);
    } else if (step === 2) {
      setSavingStep(true);
      // Save language draft settings
      await saveLanguages();
      setSavingStep(false);
      setStep(3);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-obsidian-light border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full filter blur-3xl" />
        
        <div className="mb-8 text-center space-y-3 relative">
          <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto border border-gold/20">
            <Rocket size={22} className="text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Intake Configuration Wizard</h1>
            <p className="text-white/40 text-xs">Establish your 24/7 autonomous front desk reception parameters.</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 relative">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-gold' : 'bg-white/5'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative"
          >
            {/* STEP 1: Core Profile */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs text-white/40 uppercase font-mono tracking-widest">Business Name</span>
                    <div className="mt-1.5 relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text"
                        placeholder="e.g. T & F Investments"
                        className="w-full bg-obsidian border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        value={form.businessName}
                        onChange={e => setForm({...form, businessName: e.target.value})}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs text-white/40 uppercase font-mono tracking-widest">Practice Phone</span>
                    <div className="mt-1.5 relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="w-full bg-obsidian border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs text-white/40 uppercase font-mono tracking-widest">Vertical / Industry</span>
                    <select 
                      className="mt-1.5 w-full bg-obsidian border border-white/5 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                      value={form.industry}
                      onChange={e => setForm({...form, industry: e.target.value})}
                    >
                      <option value="Legal (Personal Injury)">Legal (Personal Injury Practice)</option>
                      <option value="Legal (Criminal Defense)">Legal (Criminal Defense Practice)</option>
                      <option value="Legal (Family Law)">Legal (Family Law Practice)</option>
                      <option value="SaaS / Startup Ops">SaaS / Startup Operations</option>
                      <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    </select>
                  </label>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!form.businessName || !form.phone || savingStep}
                  className="w-full bg-gold text-obsidian disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-gold/5"
                >
                  {savingStep ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Synchronizing Profile...
                    </>
                  ) : (
                    <>
                      Configure Language Support
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: Language Capabilities */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <span className="text-xs text-white/40 uppercase font-mono tracking-widest block">Select Supported Languages</span>
                  <p className="text-[11px] text-white/30 leading-relaxed mb-2">LexGuard handles translation streams on-the-fly. Choose languages to support.</p>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {draftLanguages.map((lang) => (
                      <div 
                        key={lang.code}
                        onClick={() => !lang.isDefault && toggleLanguageDraft(lang.code)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          lang.enabled 
                            ? 'bg-gold/5 border-gold/20 text-white' 
                            : 'bg-obsidian border-white/5 text-white/40 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe size={16} className={lang.enabled ? "text-gold" : "text-white/20"} />
                          <span className="text-sm font-medium">{lang.name}</span>
                        </div>
                        {lang.enabled && (
                          <span className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={prevStep}
                    disabled={savingStep}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold text-xs transition-all border border-white/5"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={savingStep}
                    className="flex-[2] bg-gold text-obsidian py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-gold/5"
                  >
                    {savingStep ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Persisting Locale...
                      </>
                    ) : (
                      <>
                        Connect OAuth Calendar
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Connect Live & Ready */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-gold/5 rounded-2xl border border-gold/10 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center mx-auto text-gold animate-pulse">
                    <Check size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">LexGuard AI Ready</h3>
                    <p className="text-xs text-white/40 leading-relaxed mt-1">
                      Your autonomous receptionist is compiled for <span className="text-white font-bold">{form.businessName}</span>.
                    </p>
                  </div>
                </div>

                <div className="text-left space-y-3">
                  <span className="text-[10px] text-white/30 uppercase font-mono tracking-widest block text-center">Highly Recommended Integration</span>
                  
                  {integrations.slice(0, 1).map((item) => (
                    <div key={item.id} className="p-4 bg-obsidian border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gold">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-white/30">Auto-schedule appointments</p>
                        </div>
                      </div>
                      
                      {item.connected ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded font-bold border border-emerald-500/20">Active</span>
                      ) : (
                        <button 
                          onClick={() => connectIntegration(item.id)}
                          className="bg-white/5 hover:bg-gold text-white hover:text-obsidian text-[10px] font-bold px-3 py-1.5 rounded transition-all border border-white/5"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={prevStep}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold text-xs transition-all border border-white/5"
                  >
                    Back
                  </button>
                  <button 
                    onClick={onComplete}
                    className="flex-[2] bg-gold hover:bg-white text-obsidian py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-gold/10"
                  >
                    Activate Dashboard
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
