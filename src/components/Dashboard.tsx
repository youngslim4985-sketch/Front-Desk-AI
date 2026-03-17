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
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isAddClientOpen, setIsAddClientOpen] = React.useState(false);
  const [newClient, setNewClient] = React.useState({ name: '', phone: '', email: '', notes: '' });
  const [clients, setClients] = React.useState<Client[]>(MOCK_CLIENTS);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClient, business_id: 'default_biz' })
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
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Calendar} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
          <SidebarItem icon={MessageSquare} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
          <SidebarItem icon={Users} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <SidebarItem icon={Settings} label="Settings" onClick={() => {}} />
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
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Bookings</h3>
                <p className="text-4xl font-bold">24</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-black shadow-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Revenue Generated</h3>
                <p className="text-4xl font-bold">$3,200</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Calls" value="1,284" icon={Phone} trend="+12%" />
              <StatCard label="Appointments" value="84" icon={Calendar} trend="+5%" />
              <StatCard label="Missed Calls Recovered" value="42" icon={MessageSquare} trend="+18%" />
              <StatCard label="Revenue Saved" value="$12,400" icon={BarChart3} trend="+15%" />
            </div>

            {/* Recent Appointments */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Recent Appointments</h2>
                <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">Reason</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {MOCK_APPOINTMENTS.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{apt.name}</div>
                          <div className="text-sm text-slate-400">{apt.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock size={16} className="text-slate-500" />
                            {apt.date_time}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{apt.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {apt.status === 'confirmed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-white transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
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
