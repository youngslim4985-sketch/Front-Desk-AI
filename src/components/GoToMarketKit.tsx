import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Copy, 
  Check, 
  MessageSquare, 
  Linkedin, 
  Mail, 
  TrendingUp, 
  Users, 
  ExternalLink,
  Zap,
  Target
} from 'lucide-react';

interface Template {
  id: string;
  category: 'reddit' | 'linkedin' | 'email' | 'dm';
  title: string;
  content: string;
  hook: string;
}

export default function GoToMarketKit() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: 'reddit-1',
      category: 'reddit',
      title: "The 'Founders' Fail-Safe Post",
      hook: "I spent 6 months building a missed call recovery engine. Here is what I learned about lost revenue.",
      content: `I've been analyzing intake data for small law firms and PI practices. The numbers are terrifying. 

Average response time for a web lead is 17 hours. 
Average pickup rate after 6 PM is < 15%. 

Every missed call is literally $1k - $5k out the window depending on the case. 

I built LexGuard AI to fix this. It's an autonomous execution runtime that doesn't just 'answer' - it tries to execute the booking and conflict check in real-time. 

Would love feedback from anyone handling volume: [Link]`
    },
    {
      id: 'dm-1',
      category: 'dm',
      title: "The 'Ghost Call' DM",
      hook: "Hey [Name], I just tried calling your office after hours.",
      content: `Hey [Name], I just tried calling your office after hours to see how your intake handled a PI lead. 

It went to a generic voicemail. That's usually a lost client in about 15 seconds. 

I built a system called LexGuard that acts as your 24/7 autonomous front desk. It handles the intake, conflict check, and bookings while you sleep.

Can I send you a 1-minute teardown of what your current missed calls are costing you?`
    },
    {
      id: 'linkedin-1',
      category: 'linkedin',
      title: "The Architecture vs. Outcomes Post",
      hook: "Stop selling AI bots. Start selling revenue assurance.",
      content: `The market is flooded with 'AI Receptionists'. But firms don't want a bot. They want billable matters.

Most systems are just wrappers. LexGuard is an execution layer. 

We don't just 'talk' to the client. We:
1. Perform conflict checks.
2. Verify practice area fit.
3. Secure the booking.
4. Escalate only the high-value emergencies.

If you are a legal agency or consultant, let's talk about the white-label layer.`
    }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-gold font-bold">
          <Rocket className="w-3 h-3" />
          Revenue Launch Pipeline
        </div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
          LexGuard <span className="text-gold">GTM Power Kit</span>
        </h1>
        <p className="text-white/40 max-w-xl mx-auto text-sm">
          Everything you need to convert your technical build into your first $1,000 in revenue. 
          Use these proven templates to bridge the gap from "infrastructure" to "income".
        </p>
      </section>

      {/* The Roadmap */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoadmapCard 
          step="01" 
          title="The Wedge" 
          desc="Find 10 PI law firms running Google Ads. These firms pay $50+/click. A missed call is an emergency." 
        />
        <RoadmapCard 
          step="02" 
          title="The Triage" 
          desc="Send the 'Ghost Call' DM. Offer a 24-hour trial where LexGuard handles their after-hours overflow." 
        />
        <RoadmapCard 
          step="03" 
          title="The Close" 
          desc="First 5 clients at $149/mo (solo) or $399/mo (firm). High-touch service for the first 30 days." 
        />
      </section>

      {/* Templates */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold" />
            Launch Templates
          </h2>
          <div className="flex gap-2">
            {['reddit', 'linkedin', 'email'].map(cat => (
              <span key={cat} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/40 uppercase">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {templates.map((tpl) => (
            <motion.div 
              key={tpl.id}
              layout
              className="bg-obsidian-light border border-white/5 rounded-2xl overflow-hidden group hover:border-gold/30 transition-all"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-gold/10 rounded">
                        {tpl.category === 'reddit' && <TrendingUp className="w-3 h-3 text-gold" />}
                        {tpl.category === 'linkedin' && <Linkedin className="w-3 h-3 text-gold" />}
                        {tpl.category === 'dm' && <Zap className="w-3 h-3 text-gold" />}
                      </span>
                      <h3 className="font-bold text-white/90">{tpl.title}</h3>
                    </div>
                    <p className="text-xs text-gold/60 italic">Hook: {tpl.hook}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(tpl.content, tpl.id)}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-gold hover:text-obsidian transition-all"
                  >
                    {copiedId === tpl.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-4 bg-obsidian rounded-xl border border-white/5 font-serif text-sm text-white/50 leading-relaxed whitespace-pre-wrap">
                  {tpl.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conversion Tactics */}
      <section className="p-8 bg-gold/5 border border-gold/10 rounded-3xl space-y-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-bold text-white">Conversion Tear-Down</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Pricing Strategy</h4>
            <div className="space-y-4">
              <PricingTactic 
                title="The $49 Micro-Tier" 
                desc="Low friction for solo attorneys just wanting missed call text-back. No setup fee."
              />
              <PricingTactic 
                title="White-Label ($399)" 
                desc="Targeting agencies who want to offer LexGuard as their own backend. Recurring infra revenue."
              />
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Acquisition Loop</h4>
            <div className="space-y-4 text-sm text-white/40 leading-relaxed">
              <p>1. Scrape Apollo.io for law firms with &lt;10 employees.</p>
              <p>2. Automate LinkedIn invites with the "Founders" hook.</p>
              <p>3. Offer a "Case Recovery Audit" - show them exactly where their intake failed in the last 7 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-12 border-t border-white/5 flex justify-between items-center opacity-30 group">
        <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all">
          <div className="w-6 h-6 rounded bg-gold flex items-center justify-center font-bold text-[10px] text-obsidian">L</div>
          <span className="font-display font-bold text-sm">LexGuard GTM</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-[10px] font-mono hover:text-gold transition-colors">LAUNCH_DOCS</a>
          <a href="#" className="text-[10px] font-mono hover:text-gold transition-colors">SALES_ASSETS</a>
        </div>
      </footer>
    </div>
  );
}

function RoadmapCard({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="p-6 bg-obsidian-light border border-white/5 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono bg-gold text-obsidian px-1.5 py-0.5 rounded font-bold">{step}</span>
        <h3 className="font-bold text-white/90 text-sm tracking-tight">{title}</h3>
      </div>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingTactic({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-xs font-bold text-white/90">{title}</p>
        <p className="text-[11px] text-white/30">{desc}</p>
      </div>
    </div>
  );
}
