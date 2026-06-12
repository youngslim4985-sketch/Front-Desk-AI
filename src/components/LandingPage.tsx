import { motion } from 'motion/react';
import { Phone, CheckCircle, ArrowRight, Shield, Zap, Globe, Briefcase, TrendingUp } from 'lucide-react';

export default function LandingPage({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-obsidian text-white selection:bg-gold/30">
      {/* Hero Section */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-gold font-bold mb-8">
            <Zap className="w-3 h-3" />
            Autonomous Revenue Infrastructure
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-[0.9] text-white">
            REVENUE <br />
            <span className="text-gold">ASSURANCE.</span>
          </h1>
          
          <p className="text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-sans">
            LexGuard AI™ is your 24/7 autonomous front desk. We don't just answer calls; 
            we perform conflict checks, triage leads, and secure bookings for high-stakes law firms.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-gold text-obsidian px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl shadow-gold/10"
            >
              Protect My Intake
              <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/5">
              Calculated Lost Revenue
            </button>
          </div>
        </motion.div>

        {/* Vertical Wedge Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 pt-12 border-t border-white/5"
        >
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-12 text-center">
            Securing Matters For Global Practices
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-display font-bold text-xl"><Shield className="w-5 h-5" /> LexGuard Global</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl"><Briefcase className="w-5 h-5" /> Prime Intake</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl"><TrendingUp className="w-5 h-5" /> Scale Legal</div>
          </div>
        </motion.div>
      </section>

      {/* Outcome Grid */}
      <section className="px-8 py-32 bg-obsidian-light border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Autonomous Triage"
              description="Claude-3.5-powered decision loops identify high-value leads and perform conflict checks instantly."
            />
            <FeatureCard 
              icon={Shield}
              title="Revenue Guard"
              description="Automatically recovers missed calls with context-aware SMS sequences designed for legal urgency."
            />
            <FeatureCard 
              icon={Globe}
              title="White-Label Ready"
              description="Modular infrastructure built for agencies. Rebrand and deploy LexGuard as your own premium service."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 text-center opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-white text-[10px] font-mono tracking-widest uppercase">
          © 2026 LexGuard AI™ // Infrastructure by T & F Investments
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-obsidian border border-white/5 hover:border-gold/30 transition-all group">
      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-obsidian transition-all">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold mb-3 text-white/90 font-display">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed font-sans">{description}</p>
    </div>
  );
}
