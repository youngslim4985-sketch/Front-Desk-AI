import { google } from 'googleapis';
import { createLogger } from '../../observability/logger';

const log = createLogger('GoogleCalendarProvider');

export interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  description?: string;
}

export class GoogleCalendarProvider {
  private isMock: boolean;

  constructor() {
    this.isMock = !process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (this.isMock) {
      log.warn('GOOGLE_SERVICE_ACCOUNT_JSON not found. Running in MOCK mode.');
    }
  }

  async checkAvailability(start: string, end: string): Promise<boolean> {
    if (this.isMock) {
      log.info('Mock: Checking availability', { start, end });
      // Simulate availability - 80% chance it's free
      return Math.random() > 0.2;
    }

    // Real implementation would use googleapis freebusy
    return true;
  }

  async bookAppointment(event: CalendarEvent): Promise<{ success: boolean; eventId?: string }> {
    if (this.isMock) {
      log.info('Mock: Booking appointment', event);
      return { success: true, eventId: 'mock-event-' + Math.random().toString(36).substr(2, 9) };
    }

    // Real implementation
    return { success: false };
  }

  async listEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
    if (this.isMock) {
      log.info('Mock: Listing events');
      return [
        { summary: 'Discovery Call: John Smith', start: '2026-05-29T10:00:00Z', end: '2026-05-29T10:30:00Z' },
        { summary: 'Legal Review: Case #123', start: '2026-05-29T14:00:00Z', end: '2026-05-29T15:00:00Z' }
      ];
    }
    return [];
  }
}

export const calendarProvider = new GoogleCalendarProvider();
