import { getTraceId } from "../correlation/trace";

export class Logger {
  private component: string;

  constructor(component: string) {
    this.component = component;
  }

  private format(level: string, message: string, data?: any) {
    return JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      component: this.component,
      traceId: getTraceId(),
      message,
      data
    });
  }

  info(message: string, data?: any) {
    console.log(this.format('INFO', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.format('WARN', message, data));
  }

  error(message: string, data?: any) {
    console.error(this.format('ERROR', message, data));
  }
}

export const createLogger = (component: string) => new Logger(component);
