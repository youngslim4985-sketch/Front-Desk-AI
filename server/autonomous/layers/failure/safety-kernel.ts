export class CircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private lastFailure: number = 0;
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > 60000) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit Breaker is OPEN. Cooling down.');
      }
    }
    
    try {
      const res = await fn();
      if (this.state === 'HALF_OPEN') this.state = 'CLOSED';
      this.failures = 0;
      return res;
    } catch (e) {
      this.failures++;
      this.lastFailure = Date.now();
      if (this.failures >= 3) this.state = 'OPEN';
      throw e;
    }
  }
}

export class BudgetGuard {
  constructor(private max: number) {}
  check(cost: number) {
    if (cost > this.max) throw new Error(`Budget limit exceeded: ${cost} > ${this.max}`);
  }
}

export class RollbackRegistry {
  private stack: Array<() => Promise<void>> = [];
  register(fn: () => Promise<void>) { this.stack.push(fn); }
  async rollbackAll() {
    console.log(`[Safety] Executing rollback stack (${this.stack.length} actions)`);
    while (this.stack.length > 0) {
      const rb = this.stack.pop();
      if (rb) await rb().catch(err => console.error("Rollback failed", err));
    }
  }
}

export class Timebox {
  private start: number = 0;
  constructor(private limitSec: number) {}
  begin() { this.start = Date.now(); }
  check() {
    if ((Date.now() - this.start) / 1000 > this.limitSec) throw new Error("Execution timebox exceeded");
  }
}
