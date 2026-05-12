export interface Intent {
  version: string;
  id: string;
  action: string;
  params: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  timestamp: string;
}

export interface PolicyResult {
  allowed: boolean;
  requiresApproval: boolean;
  reason?: string;
  constraints?: Record<string, any>;
}

export interface SimulationResult {
  dryRun: boolean;
  estimatedCost: number;
  affectedServices: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  diff: string;
  resourcesImpacted: number;
}

export interface ExecutionContext {
  intentId: string;
  approved: boolean;
  simulation: SimulationResult;
  startTime: string;
  budget: number;
  timebox: number;
}

export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  rollbackExecuted?: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  intent: Intent;
  policyResult: PolicyResult;
  simulation: SimulationResult;
  execution: ExecutionResult;
  decisionTrace: string[];
}
