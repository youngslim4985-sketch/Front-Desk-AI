import { IntentCompiler } from '../layers/intent/compiler';
import { PolicyEngine } from '../layers/policy/engine';
import { SimulationEngine } from '../layers/simulation/simulator';
import { FunctionRegistry, deployService, runTests } from '../layers/execution/registry';
import { ExecutionRunner } from '../layers/execution/runner';
import { AuditLogger } from '../layers/audit/logger';
import { CircuitBreaker, BudgetGuard, RollbackRegistry, Timebox } from '../layers/failure/safety-kernel';
import { AuditEntry } from '../types';

export class AutonomousOrchestrator {
  private compiler = new IntentCompiler();
  private policyEngine = new PolicyEngine();
  private registry = new FunctionRegistry();
  private simulationEngine: SimulationEngine;
  private runner: ExecutionRunner;
  private audit = new AuditLogger();
  private circuitBreaker = new CircuitBreaker();
  private rollbackRegistry = new RollbackRegistry();
  private budgetGuard = new BudgetGuard(50.0);
  
  constructor() {
    this.registry.register(deployService);
    this.registry.register(runTests);
    this.simulationEngine = new SimulationEngine(this.registry);
    this.runner = new ExecutionRunner(this.registry, this.rollbackRegistry);
  }
  
  async execute(userInput: string, approved: boolean = false): Promise<AuditEntry> {
    const trace: string[] = [];
    
    try {
      trace.push("L1: Decoding intent");
      const intent = await this.compiler.compile(userInput);
      trace.push(`Intent: ${intent.action} (${intent.environment})`);
      
      trace.push("L2: Policy evaluation");
      const policy = this.policyEngine.evaluate(intent, { approved });
      if (!policy.allowed) throw new Error(`Blocked by policy: ${policy.reason}`);
      if (policy.requiresApproval) throw new Error("Approval required for sensitive operation");
      
      trace.push("L3: Preflight simulation");
      const simulation = await this.simulationEngine.simulate(intent);
      this.budgetGuard.check(simulation.estimatedCost);
      
      trace.push("L6: Safety check & Timebox");
      const timebox = new Timebox(intent.environment === 'production' ? 120 : 30);
      timebox.begin();
      
      trace.push("L4: Protected execution");
      const execution = await this.circuitBreaker.call(async () => {
        timebox.check();
        return this.runner.execute(intent, simulation, approved);
      });
      
      const entry: AuditEntry = {
        id: intent.id,
        timestamp: new Date().toISOString(),
        intent,
        policyResult: policy,
        simulation,
        execution,
        decisionTrace: trace
      };
      
      this.audit.write(entry);
      return entry;
      
    } catch (err: any) {
      trace.push(`FATAL: ${err.message}`);
      await this.rollbackRegistry.rollbackAll();
      throw err;
    }
  }
}

export const orchestrator = new AutonomousOrchestrator();
