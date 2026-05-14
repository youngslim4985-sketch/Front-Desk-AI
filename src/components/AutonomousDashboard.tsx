import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  History,
  Lock,
  Unlock,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditEntry {
  id: string;
  timestamp: string;
  intent: {
    action: string;
    environment: string;
    params: any;
  };
  policyResult: {
    allowed: boolean;
    requiresApproval: boolean;
    reason?: string;
  };
  simulation: {
    estimatedCost: number;
    riskLevel: string;
    diff: string;
  };
  execution: {
    success: boolean;
    output?: any;
    error?: string;
    duration: number;
  };
  decisionTrace: string[];
}

import { intentCompiler } from "../lib/intent";

export default function AutonomousDashboard({ onBack }: { onBack: () => void }) {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCommand = async (approved = false) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Compile intent in frontend (Adheres to gemini-api skill)
      const compiledIntent = await intentCompiler.compile(command);

      // 2. Send compiled intent to backend for orchestration
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: compiledIntent, approved })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("Approval required")) {
          setPendingAction({ input: command });
          setError("Approval required for sensitive operation");
        } else {
          throw new Error(data.error || "Execution failed");
        }
      } else {
        setLogs([data, ...logs]);
        setCommand("");
        setPendingAction(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors text-sm font-medium"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Intake Center
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Intake Assurance Kernel
          </h1>
          <p className="text-gray-400 mt-2">Autonomous Workflow Monitoring & Critical Escalation System</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-500">MONITORING: ACTIVE</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Command Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-mono text-gray-500">
              <Terminal className="w-4 h-4" />
              INPUT_PROMPT
            </div>
            <div className="relative">
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
                placeholder="e.g., 'open matter for John Smith' or 'run conflict check'"
                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <button
                onClick={() => executeCommand()}
                disabled={loading || !command}
                className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md flex items-center gap-2 transition-all"
              >
                {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                EXECUTE
              </button>
            </div>
            
            <AnimatePresence>
              {pendingAction && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-yellow-500">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-medium">Pending override for: "{pendingAction.input}"</span>
                  </div>
                  <button
                    onClick={() => executeCommand(true)}
                    className="px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded hover:bg-yellow-400 flex items-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    AUTHORIZE HIGH-RISK MATTER
                  </button>
                </motion.div>
              )}
              {error && !pendingAction && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audit Log / Event Trace */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              Event Trace
            </h2>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {logs.length === 0 && (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl text-gray-600 font-mono text-sm">
                  NO_EVENTS_LOGGED
                </div>
              )}
              {logs.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${entry.execution.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-mono text-white">{entry.intent.action.toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.intent.environment === 'production' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        {entry.intent.environment.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Decision Path</div>
                      <div className="space-y-1.5">
                        {entry.decisionTrace.map((t, idx) => (
                          <div key={idx} className="flex font-mono text-[11px] text-gray-400 gap-2 items-center">
                            <ChevronRight className="w-3 h-3 text-blue-500" />
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Execution Output</div>
                      <div className="bg-black rounded p-3 h-24 overflow-auto scrollbar-none font-mono text-[11px] text-green-500">
                        {entry.execution.success ? (
                          <pre>{JSON.stringify(entry.execution.output, null, 2)}</pre>
                        ) : (
                          <span className="text-red-500">{entry.execution.error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Runtime Guards
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-black/50 rounded-lg space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>BUDGET_UTILIZATION</span>
                  <span className="text-blue-400">0%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full">
                  <div className="w-0 h-full bg-blue-500 rounded-full" />
                </div>
              </div>
              <div className="p-3 bg-black/50 rounded-lg space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>TIMEBOX_LIMITS</span>
                  <span className="text-green-400">ACTIVE</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full">
                  <div className="w-full h-full bg-green-500 rounded-full opacity-20" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              Live Context
            </h3>
            <div className="font-mono text-[11px] text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>PROJECT_ID:</span>
                <span className="text-white">tf-invest-123</span>
              </div>
              <div className="flex justify-between">
                <span>OPERATOR:</span>
                <span className="text-white">ADMIN_LEVEL_1</span>
              </div>
              <div className="flex justify-between">
                <span>ENFORCE_RBAC:</span>
                <span className="text-green-500">TRUE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
