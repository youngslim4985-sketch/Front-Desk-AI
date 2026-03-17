import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Phone, Rocket, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    industry: 'Healthcare'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Rocket size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Configure Your AI</h1>
          <p className="text-slate-400">Let's get your receptionist ready for calls.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-blue-600' : 'bg-slate-800'
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
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Business Name</span>
                  <div className="mt-2 relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text"
                      placeholder="e.g. Acme Dental"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-colors"
                      value={form.businessName}
                      onChange={e => setForm({...form, businessName: e.target.value})}
                    />
                  </div>
                </label>
                <button 
                  onClick={nextStep}
                  disabled={!form.businessName}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  Next Step
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Business Phone</span>
                  <div className="mt-2 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-colors"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                </label>
                <div className="flex gap-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all border border-slate-800"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!form.phone}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Continue
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-8">
                <div className="p-8 bg-blue-600/10 rounded-3xl border border-blue-600/20">
                  <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Ready to Launch</h3>
                  <p className="text-slate-400">
                    Your AI receptionist for <span className="text-white font-medium">{form.businessName}</span> is ready to handle calls.
                  </p>
                </div>
                <button 
                  onClick={onComplete}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all"
                >
                  Launch Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CheckCircle({ className, ...props }: any) {
  return (
    <svg 
      {...props}
      className={className}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
