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

// Legal Operation Functions
export const openLegalMatter: ExecutableFunction = {
  name: 'open_legal_matter',
  timeout: 60,
  maxBudget: 2.0,
  
  async execute(params: any, context: any): Promise<any> {
    if (context.dryRun) {
      return { 
        action: 'Provisioning Matter Folder',
        practiceArea: params.practice || 'General Litigation',
        status: 'PENDING_CONFLICT_CHECK'
      };
    }
    
    await new Promise(r => setTimeout(r, 1500));
    
    return {
      success: true,
      matterId: `MAT-${Math.floor(Math.random()*10000)}`,
      createdAt: new Date().toISOString()
    };
  },
  
  async rollback(result: any, _context: any): Promise<void> {
    console.log(`[rollback] Archiving failed matter ${result.matterId}`);
    await new Promise(r => setTimeout(r, 1000));
  }
};

export const runConflictCheck: ExecutableFunction = {
  name: 'run_conflict_check',
  timeout: 30,
  maxBudget: 0.5,
  
  async execute(params: any, context: any): Promise<any> {
    if (context.dryRun) {
      return { action: 'Searching Database', query: params.party };
    }
    
    await new Promise(r => setTimeout(r, 1000));
    return { status: 'CLEAN', searchCount: 154, timestamp: new Date().toISOString() };
  }
};
