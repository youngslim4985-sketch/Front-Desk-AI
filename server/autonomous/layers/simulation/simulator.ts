import { Intent, SimulationResult, ExecutionContext } from '../../types';
import { FunctionRegistry } from '../execution/registry';

export class SimulationEngine {
  constructor(private registry: FunctionRegistry) {}
  
  async simulate(intent: Intent): Promise<SimulationResult> {
    const fn = this.registry.get(intent.action);
    if (!fn) throw new Error(`Unknown action: ${intent.action}`);
    
    // Dry run execution
    const mockContext: ExecutionContext = {
      intentId: intent.id,
      approved: false,
      simulation: {} as any, 
      startTime: new Date().toISOString(),
      budget: 0,
      timebox: 0
    };

    const dryResult = await fn.execute(intent.params, { ...mockContext, dryRun: true } as any);
    
    return {
      dryRun: true,
      estimatedCost: this.estimateCost(intent),
      affectedServices: [intent.params.service || 'unknown'],
      riskLevel: intent.environment === 'production' ? 'high' : 'low',
      estimatedDuration: fn.timeout / 2,
      diff: JSON.stringify(dryResult, null, 2),
      resourcesImpacted: 1
    };
  }
  
  private estimateCost(intent: Intent): number {
    const rates: Record<string, number> = { deploy_service: 0.5, run_tests: 0.1 };
    return (rates[intent.action] || 0.2) * (intent.environment === 'production' ? 5 : 1);
  }
}
