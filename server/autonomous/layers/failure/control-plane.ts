export enum CallState {
  RINGING = "RINGING",
  AI_ANSWERED = "AI_ANSWERED",
  PENDING_INTENT = "PENDING_INTENT",
  BOOKING = "BOOKING",
  WAITING_CONFIRMATION = "WAITING_CONFIRMATION",
  ESCALATING = "ESCALATING",
  DEAD_MAN_TRIGGERED = "DEAD_MAN_TRIGGERED",
  FAILED_CLOSED = "FAILED_CLOSED", // Direct to operator cell
  COMPLETED = "COMPLETED"
}

export const ALLOWED_TRANSITIONS: Record<CallState, CallState[]> = {
  [CallState.RINGING]: [CallState.AI_ANSWERED, CallState.DEAD_MAN_TRIGGERED, CallState.FAILED_CLOSED],
  [CallState.AI_ANSWERED]: [CallState.PENDING_INTENT, CallState.ESCALATING, CallState.DEAD_MAN_TRIGGERED, CallState.FAILED_CLOSED],
  [CallState.PENDING_INTENT]: [CallState.BOOKING, CallState.ESCALATING, CallState.COMPLETED, CallState.DEAD_MAN_TRIGGERED],
  [CallState.BOOKING]: [CallState.WAITING_CONFIRMATION, CallState.FAILED_CLOSED],
  [CallState.WAITING_CONFIRMATION]: [CallState.COMPLETED, CallState.ESCALATING, CallState.FAILED_CLOSED],
  [CallState.ESCALATING]: [CallState.FAILED_CLOSED, CallState.COMPLETED, CallState.DEAD_MAN_TRIGGERED],
  [CallState.DEAD_MAN_TRIGGERED]: [CallState.FAILED_CLOSED],
  [CallState.FAILED_CLOSED]: [],
  [CallState.COMPLETED]: []
};

export class DeadManSwitch {
  private lastHeartbeat: number = Date.now();
  private readonly PUSH_THRESHOLD = 10000; // 10s
  private readonly FORWARD_THRESHOLD = 15000; // 15s

  public push() {
    this.lastHeartbeat = Date.now();
  }

  public getStatus(): "HEALTHY" | "DEGRADED" | "CRITICAL" {
    const delta = Date.now() - this.lastHeartbeat;
    if (delta > this.FORWARD_THRESHOLD) return "CRITICAL";
    if (delta > this.PUSH_THRESHOLD) return "DEGRADED";
    return "HEALTHY";
  }

  public shouldFailClosed(): boolean {
    return this.getStatus() === "CRITICAL";
  }
}

export class IdempotencyManager {
  private cache = new Map<string, { response: any; expiry: number }>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24hr

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) return entry.response;
    this.cache.delete(key);
    return null;
  }

  public set(key: string, response: any) {
    this.cache.set(key, { response, expiry: Date.now() + this.TTL });
  }

  // Cleanup old records
  public purge() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) this.cache.delete(key);
    }
  }
}

export const globalDeadMan = new DeadManSwitch();
export const globalIdempotency = new IdempotencyManager();
