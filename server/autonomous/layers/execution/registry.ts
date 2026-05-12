import { ExecutionContext } from "../../types";

export interface ExecutableFunction {
  name: string;
  execute: (params: any, context: ExecutionContext) => Promise<any>;
  rollback?: (result: any, context: ExecutionContext) => Promise<void>;
  timeout: number;
  maxBudget: number;
}

export class FunctionRegistry {
  private functions = new Map<string, ExecutableFunction>();
  
  register(fn: ExecutableFunction): void {
    this.functions.set(fn.name, fn);
  }
  
  get(name: string): ExecutableFunction | undefined {
    return this.functions.get(name);
  }
}

// Demo functions
export const deployService: ExecutableFunction = {
  name: 'deploy_service',
  timeout: 120,
  maxBudget: 5.0,
  
  async execute(params: any, context: any): Promise<any> {
    if (context.dryRun) {
      return { 
        wouldDeploy: `${params.service}:${params.tag}`,
        endpoint: `https://staging-${params.service}.example.com`
      };
    }
    
    // Simulating real work
    await new Promise(r => setTimeout(r, 2000));
    
    return {
      success: true,
      endpoint: `https://${context.environment}-${params.service}.example.com`,
      deployedAt: new Date().toISOString()
    };
  },
  
  async rollback(result: any, _context: any): Promise<void> {
    console.log(`[rollback] Rolling back deployment from ${result.deployedAt}`);
    await new Promise(r => setTimeout(r, 1000));
  }
};

export const runTests: ExecutableFunction = {
  name: 'run_tests',
  timeout: 45,
  maxBudget: 1.0,
  
  async execute(params: any, context: any): Promise<any> {
    if (context.dryRun) {
      return { testsToRun: params.suite };
    }
    
    await new Promise(r => setTimeout(r, 1000));
    return { passed: true, testsRun: 42, failures: 0 };
  }
};
