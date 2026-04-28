import { motion } from 'framer-motion';
import { Phone, CheckCircle, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function LandingPage({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Phone size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Front Desk AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <button onClick={onLogin} className="hover:text-white transition-colors">Login</button>
        </div>
        <button 
          onClick={onStart}
          className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-slate-200 transition-all"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20">
            Now Powered by Gemini 1.5
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            NEVER MISS <br />
            <span className="text-blue-600">ANOTHER CALL.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The AI receptionist that answers, books, and converts calls 24/7. 
            Automate your front desk and recover missed revenue instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-slate-800">
              Book a Demo
            </button>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 pt-12 border-t border-slate-900"
        >
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by 500+ Businesses
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            <div className="text-2xl font-bold">MEDICARE</div>
            <div className="text-2xl font-bold">DENTALHUB</div>
            <div className="text-2xl font-bold">LAWGROUP</div>
            <div className="text-2xl font-bold">SALONPRO</div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={Zap}
              title="Instant Booking"
              description="AI handles the entire booking flow via voice or SMS, syncing directly with your calendar."
            />
            <FeatureCard 
              icon={Shield}
              title="Missed Call Recovery"
              description="Automatically text back missed calls to ensure you never lose a potential lead again."
            />
            <FeatureCard 
              icon={Globe}
              title="24/7 Availability"
              description="Your front desk never sleeps. Handle calls at 3 AM just as professionally as at 3 PM."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-slate-900 text-center">
        <p className="text-slate-500 text-sm">
          © 2024 Front Desk AI™. Owned by T & F Investments and Holdings LLC.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-black border border-slate-900 hover:border-blue-600/50 transition-all group">
      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
