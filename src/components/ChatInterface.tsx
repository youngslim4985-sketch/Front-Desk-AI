import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface({ businessName, businessId }: { businessName: string; businessId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hello! I'm the AI assistant for ${businessName}. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "" });
  const [leadSaved, setLeadSaved] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const saveLead = async (formData: typeof leadForm) => {
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          business_id: businessId,
          inquiry: messages[messages.length - 2]?.content || "Inquiry from chat"
        })
      });
      setLeadSaved(true);
      setTimeout(() => setShowLeadCapture(false), 2000);
    } catch (err) {
      console.error("Failed to save lead", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Trigger lead capture check
    if (/book|appointment|call|price|someone|talk|visit/i.test(userMessage)) {
      setTimeout(() => setShowLeadCapture(true), 1500);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          userMessage,
          history: messages
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages([...newMessages, { role: "assistant", content: data.response || "I'm sorry, I couldn't process that." }]);
      
      // Explicitly trigger UI based on server-side decision
      if (data.action === "capture_lead") {
        setShowLeadCapture(true);
      } else if (data.action === "escalate") {
        // You could show a special priority toast here
        console.warn("High priority escalation triggered");
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white text-slate-900 font-sans">
      {/* Header */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">{businessName} Assistant</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === "user" ? "bg-slate-200" : "bg-blue-100"
            }`}>
              {msg.role === "user" ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-blue-600" />}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-medium uppercase tracking-widest">Assistant is typing...</span>
          </div>
        )}
        
        {/* Inline Lead Capture */}
        <AnimatePresence>
          {showLeadCapture && !leadSaved && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-2 space-y-3 shadow-md"
            >
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                <Calendar size={16} />
                Request a Follow-up
              </div>
              <p className="text-xs text-blue-600">Enter your details and our team will get back to you shortly.</p>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={leadForm.name}
                  onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={leadForm.phone}
                  onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                />
                <button 
                  onClick={() => saveLead(leadForm)}
                  className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </motion.div>
          )}
          {leadSaved && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center mt-2"
            >
              <div className="text-emerald-700 font-bold text-sm">Inquiry Sent!</div>
              <p className="text-xs text-emerald-600">We'll be in touch soon.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <input
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="How can we help?"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white p-2.5 rounded-xl block hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 text-[9px] text-center text-slate-400 uppercase tracking-widest font-bold">
          Powered by Front Desk AI™
        </div>
      </div>
    </div>
  );
}
