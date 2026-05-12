import { AuditEntry } from '../../types';

export class AuditLogger {
  private log: AuditEntry[] = [];
  
  write(entry: AuditEntry) {
    this.log.push(entry);
    console.log(`[Audit] ${entry.intent.action} | Status: ${entry.execution.success ? 'OK' : 'FAIL'} | Env: ${entry.intent.environment}`);
  }
  
  getHistory() { return [...this.log]; }
}
