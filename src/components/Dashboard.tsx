import React from 'react';
import { 
  Phone, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  Plus, 
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Code,
  Copy,
  Check,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Mic2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceDashboard from './VoiceDashboard';
import AISettings from './AISettings';
import Languages from './Languages';
import Integrations from './Integrations';

// --- Types ---
interface Appointment {
  id: string;
  name: string;
  phone: string;
  date_time: string;
  reason: string;
  status: 'confirmed' | 'cancelled';
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

// --- Mock Data ---
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', name: 'John Doe', phone: '+1234567890', date_time: '2024-03-20 10:00 AM', reason: 'Consultation', status: 'confirmed' },
  { id: '2', name: 'Jane Smith', phone: '+1987654321', date_time: '2024-03-20 11:00 AM', reason: 'Follow-up', status: 'confirmed' },
  { id: '3', name: 'Mike Ross', phone: '+1122334455', date_time: '2024-03-21 02:00 PM', reason: 'New Patient', status: 'cancelled' },
];

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com', notes: 'Prefers morning slots' },
  { id: '2', name: 'Jane Smith', phone: '+1987654321', email: 'jane@example.com', notes: 'VIP client' },
  { id: '3', name: 'Harvey Specter', phone: '+1555000111', email: 'harvey@pearson.com', notes: 'Always on time' },
  { id: '4', name: 'Sarah Wilson', phone: '+1444555666', email: 'sarah@example.com', notes: '[LEAD FROM CHAT] Inquiry: How much for a full dental cleaning?' },
  { id: '5', name: 'Angry User', phone: '+1000999888', email: 'angry@user.com', notes: '[ESCALATED] User issue: The bot is not giving me the price I want!' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend }: { label: string, value: string, icon: any, trend?: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
        <Icon size={24} />
      </div>
      {trend && <span className="text-emerald-500 text-sm font-medium">{trend}</span>}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
);

export default function Dashboard({ onSwitch }: { onSwitch: () => void }) {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [settingsSubTab, setSettingsSubTab] = React.useState<'ai' | 'languages' | 'integrations'>('ai');
  const [isAddClientOpen, setIsAddClientOpen] = React.useState(false);
  const [newClient, setNewClient] = React.useState({ name: '', phone: '', email: '', notes: '' });
  const [clients, setClients] = React.useState<Client[]>(MOCK_CLIENTS);
  const [copied, setCopied] = React.useState(false);

  const businessName = "T & F Investments";
  const businessId = "tf-invest-123";

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClient, business_id: businessId })
      });
      const data = await response.json();
      if (data.success) {
        setClients([...clients, data.client]);
        setIsAddClientOpen(false);
        setNewClient({ name: '', phone: '', email: '', notes: '' });
      }
    } catch (error) {
      console.error('Error adding client:', error);
      // Fallback for demo
      const clientWithId = { ...newClient, id: Math.random().toString() };
      setClients([...clients, clientWithId]);
      setIsAddClientOpen(false);
      setNewClient({ name: '', phone: '', email: '', notes: '' });
    }
  };

  const leads = clients.filter(c => c.notes?.includes('[LEAD FROM CHAT]'));
  const escalations = clients.filter(c => c.notes?.includes('[ESCALATED]'));

  const scriptSnippet = `<script>
  (function () {
    const iframe = document.createElement("iframe");
    iframe.src = "${window.location.origin}/widget?business=${businessId}";
    iframe.style.position = "fixed";
    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "380px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
    document.body.appendChild(iframe);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Phone size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Front Desk AI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Intake Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Mic2} label="After-Hours Voice" active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} />
          <SidebarItem icon={AlertTriangle} label="Urgent Escalations" active={activeTab === 'escalations'} onClick={() => setActiveTab('escalations')} />
          <SidebarItem icon={Plus} label="New Matters" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <SidebarItem icon={Calendar} label="Consultations" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
          <SidebarItem icon={Users} label="Clients" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <SidebarItem icon={Code} label="Embed Intake" active={activeTab === 'embed'} onClick={() => setActiveTab('embed')} />
          <div className="pt-2">
            <button 
              onClick={onSwitch}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all group"
            >
              <ShieldAlert size={20} className="group-hover:animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-widest">Intake Assurance</span>
            </button>
          </div>
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSettingsSubTab('ai'); }} />
          <SidebarItem icon={LogOut} label="Logout" onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, T & F</h1>
            <p className="text-slate-400">Your AI receptionist is active and handling calls.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
            <Plus size={20} />
            New Appointment
          </button>
        </header>

        {/* Main Content Area */}
        {activeTab === 'dashboard' ? (
          <>
            {/* Live Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl text-black shadow-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Inbound Leads</h3>
                <p className="text-4xl font-bold">{leads.length}</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-black shadow-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Escalations</h3>
                <p className="text-4xl font-bold text-rose-600">{escalations.length}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Bot Chats" value="1,284" icon={MessageSquare} trend="+12%" />
              <StatCard label="Leads Captured" value={leads.length.toString()} icon={Plus} trend="+5%" />
              <StatCard label="Critical Issues" value={escalations.length.toString()} icon={AlertTriangle} trend="-2%" />
              <StatCard label="Revenue Saved" value="$12,400" icon={BarChart3} trend="+15%" />
            </div>
            
            {/* ... Rest of Dashboard ... */}
          </>
        ) : activeTab === 'voice' ? (
          <VoiceDashboard />
        ) : activeTab === 'escalations' ? (
          <div className="space-y-6">
            <div className="bg-rose-600/10 border border-rose-600/20 rounded-2xl p-6 text-rose-400 flex items-center gap-4">
              <AlertTriangle size={32} />
              <div>
                <h3 className="text-xl font-bold">Critical Supervisor Attention Required</h3>
                <p className="text-sm text-rose-400/80">These requests have hit deterministic guardrails and require manual resolution.</p>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50">
                  <tr className="text-slate-400 text-sm uppercase">
                    <th className="px-6 py-4 font-medium">Issue Context</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {escalations.map((esc) => (
                    <tr key={esc.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300 font-mono bg-black/50 p-3 rounded-lg border border-slate-700">
                          {esc.notes.replace('[ESCALATED] ', '')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{esc.name}</div>
                        <div className="text-xs text-slate-500">{esc.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all">
                            <UserCheck size={14} /> Resolve
                          </button>
                          <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                            Ignore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {escalations.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">No active escalations. Everything is running smoothly.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'leads' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Inbound Chat Leads</h2>
                <div className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Live Capture Active
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Lead</th>
                      <th className="px-6 py-4 font-medium">Contact</th>
                      <th className="px-6 py-4 font-medium">Inquiry</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{lead.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300">{lead.phone}</div>
                          <div className="text-xs text-slate-500">{lead.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-400 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 italic">
                            "{lead.notes.replace('[LEAD FROM CHAT] Inquiry: ', '')}"
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          Just now
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        ) : activeTab === 'customers' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Client Directory</h2>
              <button 
                onClick={() => setIsAddClientOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <Plus size={16} />
                Add Client
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Notes</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{client.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{client.email}</div>
                        <div className="text-sm text-slate-500">{client.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 italic text-sm">{client.notes}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Client Modal */}
            <AnimatePresence>
              {isAddClientOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"
                  >
                    <h3 className="text-2xl font-bold mb-6">Add New Client</h3>
                    <form onSubmit={handleAddClient} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <input 
                          type="text"
                          required
                          className="w-full bg-black border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-white"
                          value={newClient.name}
                          onChange={e => setNewClient({...newClient, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                        <input 
                          type="tel"
                          required
                          className="w-full bg-black border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-white"
                          value={newClient.phone}
                          onChange={e => setNewClient({...newClient, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <input 
                          type="email"
                          required
                          className="w-full bg-black border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-white"
                          value={newClient.email}
                          onChange={e => setNewClient({...newClient, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                        <textarea 
                          className="w-full bg-black border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-white h-24 resize-none"
                          value={newClient.notes}
                          onChange={e => setNewClient({...newClient, notes: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setIsAddClientOpen(false)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
                        >
                          Save Client
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : activeTab === 'embed' ? (
          <div className="max-w-3xl space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <Code size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Installation Script</h3>
                  <p className="text-slate-400 text-sm">Paste this onto your website to activate the AI receptionist.</p>
                </div>
              </div>

              <div className="bg-black border border-slate-800 rounded-xl p-6 relative group">
                <pre className="text-blue-400 text-sm overflow-x-auto font-mono leading-relaxed">
                  {scriptSnippet}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-all border border-slate-700/50"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/30">
                  <div className="text-white font-bold text-xs uppercase tracking-widest mb-2">Step 1</div>
                  <div className="text-slate-400 text-xs">Copy the script above</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/30">
                  <div className="text-white font-bold text-xs uppercase tracking-widest mb-2">Step 2</div>
                  <div className="text-slate-400 text-xs">Paste before &lt;/body&gt;</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/30">
                  <div className="text-white font-bold text-xs uppercase tracking-widest mb-2">Step 3</div>
                  <div className="text-slate-400 text-xs">AI goes live instantly</div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="max-w-5xl space-y-8">
            <div className="flex border-b border-white/5 pb-4 gap-6 text-sm font-medium">
              <button 
                onClick={() => setSettingsSubTab('ai')}
                className={`pb-2 border-b-2 transition-all ${settingsSubTab === 'ai' ? 'border-gold text-gold font-bold' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                AI Agent Core
              </button>
              <button 
                onClick={() => setSettingsSubTab('languages')}
                className={`pb-2 border-b-2 transition-all ${settingsSubTab === 'languages' ? 'border-gold text-gold font-bold' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                Languages
              </button>
              <button 
                onClick={() => setSettingsSubTab('integrations')}
                className={`pb-2 border-b-2 transition-all ${settingsSubTab === 'integrations' ? 'border-gold text-gold font-bold' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                Integrations & OAuth
              </button>
            </div>

            <div className="mt-6">
              {settingsSubTab === 'ai' && <AISettings businessId={businessId} />}
              {settingsSubTab === 'languages' && <Languages businessId={businessId} />}
              {settingsSubTab === 'integrations' && <Integrations businessId={businessId} />}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <BarChart3 size={48} className="mb-4 opacity-20" />
            <p className="text-lg">Select a tab to view details</p>
          </div>
        )}
      </main>
    </div>
  );
}
