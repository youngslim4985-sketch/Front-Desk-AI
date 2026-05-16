import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationContext = new AsyncLocalStorage<{ traceId: string }>();

export function getTraceId(): string {
  return correlationContext.getStore()?.traceId || 'unknown';
}

export function middlewareCorrelation(req: any, res: any, next: any) {
  const traceId = req.headers['x-trace-id'] || uuidv4();
  correlationContext.run({ traceId }, () => {
    res.setHeader('x-trace-id', traceId);
    next();
  });
}
