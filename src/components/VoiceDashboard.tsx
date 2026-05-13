import React, { useState, useEffect } from "react";
import { 
  Phone, 
  Search, 
  Plus, 
  Settings, 
  History, 
  Activity, 
  Play, 
  Headphones,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function VoiceDashboard() {
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [purchasedNumber, setPurchasedNumber] = useState<any>(null);

  const searchNumbers = async () => {
    setSearchLoading(true);
    try {
      const res = await fetch("/api/twilio/numbers/search");
      const data = await res.json();
      setAvailableNumbers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const buyNumber = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/twilio/numbers/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (data.success) {
        setPurchasedNumber(data.purchased);
        setAvailableNumbers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Voice Receptionist Settings</h2>
          <p className="text-slate-400">Configure your AI incoming call handler and phone numbers.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono text-blue-500 text-xs font-bold uppercase tracking-widest">Voice Engine Primary</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Number Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Phone className="text-blue-500" />
                Active Phone Numbers
              </h3>
              <button 
                onClick={searchNumbers}
                disabled={searchLoading}
                className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                {searchLoading ? "Searching..." : <><Search size={14} /> Find New Number</>}
              </button>
            </div>

            {purchasedNumber ? (
              <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white mb-1">{purchasedNumber.phoneNumber}</div>
                  <div className="text-xs text-blue-400 font-mono uppercase tracking-widest">Active & Handling Calls</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                <Phone size={24} className="mb-2 opacity-20" />
                <p className="text-sm">No active Twilio numbers found for this business.</p>
              </div>
            )}

            {availableNumbers.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Available Local Numbers</h4>
                <div className="space-y-2">
                  {availableNumbers.map((n) => (
                    <div key={n.phoneNumber} className="flex items-center justify-between p-4 bg-black/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors">
                      <span className="font-mono text-white text-lg">{n.phoneNumber}</span>
                      <button 
                        onClick={() => buyNumber(n.phoneNumber)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {loading ? "Provisioning..." : "Purchase ($1.00/mo)"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="text-slate-500" />
              Recent Call Transcripts
            </h3>
            <div className="space-y-4">
               <div className="flex flex-col items-center justify-center py-12 text-slate-600 border border-slate-800/50 bg-black/20 rounded-xl">
                 <Headphones size={32} className="mb-2 opacity-10" />
                 <p className="text-sm italic">Call logs will appear here as they come in.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Config */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-purple-500" />
              Voice Personality
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-black/50 rounded-lg border border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tone of Voice</label>
                <div className="text-sm text-white">Professional & Warm (Amy - British)</div>
              </div>
              <div className="p-3 bg-black/50 rounded-lg border border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Greeting Message</label>
                <div className="text-xs text-slate-400 italic">"Hello, thanks for calling Front Desk A I. How can I help you today?"</div>
              </div>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all">
                Edit Persona Prompt
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-amber-500" />
              Safety Safeguards
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Max Call Duration</span>
                <span className="text-white font-mono">10:00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">PII Filtering</span>
                <span className="text-emerald-500 font-bold">ENABLED</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Human Transfer</span>
                <span className="text-blue-500 font-bold">READY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
