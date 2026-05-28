import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, AlertCircle, ChevronRight, Calendar, Phone } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello, I am LexGuard's Front Desk AI. How can I assist you with your legal intake or booking today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/orchestrate/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }))
        })
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my brain right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-obsidian-light border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-obsidian">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white/90">LexGuard AI™</h3>
            <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Autonomous Receptionist</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-500">LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                m.role === 'user' ? 'bg-white/5 border-white/10' : 'bg-gold/10 border-gold/20'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white/60" /> : <Bot className="w-4 h-4 text-gold" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-white/5 text-white/90 rounded-tr-none border border-white/5' 
                  : 'bg-obsidian text-white/80 rounded-tl-none border border-white/5'
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-center gap-1 p-4 bg-obsidian rounded-2xl rounded-tl-none border border-white/5">
              <span className="w-1 h-1 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-obsidian border-t border-white/5">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full bg-obsidian-light border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-obsidian transition-all disabled:opacity-50 disabled:hover:bg-gold/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Calendar className="w-3 h-3 text-gold/50" />
            <span>Smart Booking</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Phone className="w-3 h-3 text-gold/50" />
            <span>Legal Triage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
