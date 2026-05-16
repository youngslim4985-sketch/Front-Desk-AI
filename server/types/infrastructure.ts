export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  brandColor: string;
  logoUrl?: string;
  phoneNumbers: string[];
  aiProvider: 'gemini' | 'openai' | 'anthropic';
  voiceProvider: 'twilio';
  calendarProvider: 'google' | 'outlook';
  features: string[];
  metadata: Record<string, any>;
}

export interface CallContext {
  traceId: string;
  tenantId: string;
  sessionId: string;
  from: string;
  to: string;
}

export enum EventType {
  VOICE_INCOMING = 'voice.incoming',
  VOICE_INPUT = 'voice.input',
  AI_PROCESS_START = 'ai.process.start',
  AI_PROCESS_COMPLETE = 'ai.process.complete',
  BOOKING_REQUEST = 'booking.request',
  ESCALATION_TRIGGERED = 'escalation.triggered',
  CALENDAR_SYNC = 'calendar.sync'
}
