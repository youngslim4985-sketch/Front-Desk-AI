import React, { useState } from 'react';
import { Phone, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here
    onLogin();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Phone size={24} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to manage your AI receptionist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Email Address</span>
              <div className="mt-2 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full bg-black border border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-colors text-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Password</span>
              <div className="mt-2 relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-colors text-white"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
          >
            Sign In
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account? <button className="text-blue-500 hover:underline font-medium">Contact Sales</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
