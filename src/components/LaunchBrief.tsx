import React from 'react';
import { motion } from 'motion/react';
import { Target, Rocket, DollarSign, Users, Mail, Shield, CheckCircle2, ChevronRight, Briefcase, Zap } from 'lucide-react';

export default function LaunchBrief() {
  const sections = [
    {
      title: "Core Positioning",
      icon: <Target className="w-5 h-5 text-gold" />,
      content: "Front Desk AI™ is the only mission-critical communication infrastructure that converts high-stakes missed calls into secured clients for law firms, 24/7."
    },
    {
      title: "The Wedge: LexGuard AI™",
      icon: <Shield className="w-5 h-5 text-gold" />,
      content: "Focus on the legal vertical where 'missed call = lost revenue'. LexGuard provides 24/7 intake, conflict checks, and emergency escalation, creating an immediate ROI proof point."
    }
  ];

  const pricing = [
    { name: "Free Trial", price: "$0", desc: "14-day full feature test" },
    { name: "Pro", price: "$149/mo", desc: "For Solo Practitioners. 50 calls/mo." },
    { name: "Business", price: "$399/mo", desc: "For Mid-Size Firms. Unlimited + White-Label." },
    { name: "Enterprise", price: "Custom", desc: "National Groups. API access + SOC2." }
  ];

  const profiles = [
    "Personal Injury (High Urgency)", "Family Law (High Empathy)", "Criminal Defense (Immediate Need)",
    "Real Estate (Deadline Driven)", "Immigration (Document Intensive)", "Bankruptcy (Volume Sensitive)",
    "Small Business Counsel", "Virtual Law Firms", "Legal Call Center Resellers", "Agency Partners"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <section className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-gold font-bold mb-4"
        >
          Confidential GTM Strategy
        </motion.div>
        <h1 className="text-5xl font-display font-bold text-white tracking-tight">
          Front Desk AI™ <span className="text-gold">Launch Brief</span>
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto">
          The 30-day offensive for dominant legal intake infrastructure.
        </p>
      </section>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-obsidian-light border border-white/5 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-3">
              {s.icon}
              <h3 className="font-bold text-white/90">{s.title}</h3>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Pricing */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-bold text-white">Tiered Monetization</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pricing.map((p, i) => (
            <div key={i} className="p-4 bg-obsidian border border-gold/10 rounded-xl space-y-1 text-center hover:border-gold/30 transition-all cursor-default group">
              <p className="text-[10px] text-white/40 uppercase font-bold group-hover:text-gold/60 transition-colors">{p.name}</p>
              <p className="text-xl font-display font-bold text-white">{p.price}</p>
              <p className="text-[10px] text-white/30">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buyer Profiles */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-bold text-white">Target Buyer Profiles</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p, i) => (
            <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-default">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* 30-Day Execution */}
      <section className="p-8 bg-gold/5 border border-gold/10 rounded-3xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Rocket className="w-24 h-24 text-gold" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">The 30-Day Blitz</h2>
          <p className="text-white/40 text-sm italic">Six phases from zero to revenue.</p>
        </div>
        <div className="space-y-4">
          {[
            { phase: "01: Hardening", task: "Finalize Dead-Man Switch & Idempotency layers." },
            { phase: "02: Demo Deck", task: "Build the 'Call Teardown' interactive demo for firms." },
            { phase: "03: Seed List", task: "Scrape 500 Personal Injury partners via LinkedIn." },
            { phase: "04: Outbound", task: "Launch 'LexGuard' cold email sequence (V1)." },
            { phase: "05: Pilot Sales", task: "Close first 5 firms at the $149 Pilot rate." },
            { phase: "06: Scale", task: "Enable white-label reselling for legal agencies." }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <span className="text-[10px] font-mono text-gold font-bold group-hover:scale-110 transition-transform">{item.phase}</span>
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-sm text-white/70">{item.task}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Outreach Copy */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-white">Outbound Script (V1)</h2>
          </div>
          <div className="p-6 bg-obsidian-light border border-white/5 rounded-2xl space-y-4 font-serif italic text-sm text-white/50 leading-relaxed relative">
             <div className="absolute top-4 right-4"><Briefcase className="w-4 h-4 text-gold/20" /></div>
             <p>"[Name], I saw your firm is running Google Ads for Personal Injury. I performed a 'ghost call' update on your current intake after 6 PM."</p>
             <p>"You have about a 15-second window before a potential client hangs up and calls the next firm on the list. LexGuard AI captures that client instantly."</p>
             <p>"Can I show you the teardown of how we'd handle your after-hours volume?"</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-white">Pilot Offers</h2>
          </div>
          <div className="space-y-3">
             <div className="p-4 bg-obsidian border border-white/5 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-bold text-white">The Intake Audit ($0)</p>
                  <p className="text-xs text-white/30">Free recording of how our AI handles their top 3 worst case scenarios.</p>
                </div>
             </div>
             <div className="p-4 bg-obsidian border border-white/5 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-bold text-white">The Shield Trial ($149)</p>
                  <p className="text-xs text-white/30">Full weekend of after-hours intake protection with human escalation failover.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Discipline Grid */}
      <section className="p-8 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold text-white">Message Discipline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gold uppercase tracking-tighter">Don't Sell</p>
            <p className="text-xs text-white/40 italic">"AI Receptionists"</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gold uppercase tracking-tighter">Sell</p>
            <p className="text-xs text-white/40 italic">"Intake Assurance Infrastructure"</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gold uppercase tracking-tighter">Result</p>
            <p className="text-xs text-white/40 italic">Billable Mattes Secured while you sleep.</p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-12 border-t border-white/5 flex justify-between items-center opacity-30 group">
        <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all">
          <div className="w-6 h-6 rounded bg-gold flex items-center justify-center font-bold text-[10px] text-obsidian">L</div>
          <span className="font-display font-bold text-sm">LexGuard AI™</span>
        </div>
        <p className="text-[10px] font-mono">CODE: GTM_OFFENSIVE_2026</p>
      </footer>
    </div>
  );
}
