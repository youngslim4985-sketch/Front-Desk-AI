import { Intent, SimulationResult, ExecutionResult, ExecutionContext } from '../../types';
import { FunctionRegistry } from './registry';
import { RollbackRegistry } from '../failure/safety-kernel';

export class ExecutionRunner {
  constructor(
    private registry: FunctionRegistry,
    private rollbackRegistry: RollbackRegistry
  ) {}
  
  async execute(intent: Intent, simulation: SimulationResult, approved: boolean): Promise<ExecutionResult> {
    const fn = this.registry.get(intent.action);
    if (!fn) throw new Error(`Unknown function: ${intent.action}`);
    
    const context: ExecutionContext = {
      intentId: intent.id,
      approved,
      simulation,
      startTime: new Date().toISOString(),
      budget: 10.0, 
      timebox: fn.timeout
    };
    
    const start = Date.now();
    try {
      const output = await fn.execute(intent.params, context);
      
      if (fn.rollback) {
        this.rollbackRegistry.register(() => fn.rollback!(output, context));
      }
      
      return {
        success: true,
        output,
        duration: (Date.now() - start) / 1000
      };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        duration: (Date.now() - start) / 1000
      };
    }
  }
}
