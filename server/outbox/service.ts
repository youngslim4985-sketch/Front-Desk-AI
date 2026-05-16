import { v4 as uuidv4 } from 'uuid';
import { EventType } from '../types/infrastructure';

export interface OutboxMessage {
  id: string;
  tenantId: string;
  type: EventType;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  lastError?: string;
  timestamp: string;
}

export class OutboxService {
  private static messages: OutboxMessage[] = [];

  static async record(tenantId: string, type: EventType, payload: any): Promise<string> {
    const message: OutboxMessage = {
      id: uuidv4(),
      tenantId,
      type,
      payload,
      status: 'pending',
      attempts: 0,
      timestamp: new Date().toISOString()
    };
    
    // In production, save to Postgres 'outbox' table within a transaction
    this.messages.push(message);
    console.log(`[Outbox] Recorded ${type} for tenant ${tenantId}`);
    
    return message.id;
  }

  static async getPending(): Promise<OutboxMessage[]> {
    return this.messages.filter(m => m.status === 'pending');
  }

  static async complete(id: string) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) msg.status = 'completed';
  }
}
