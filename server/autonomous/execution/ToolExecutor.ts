import { calendarProvider } from '../../providers/calendar/GoogleCalendarProvider';
import { createLogger } from '../../observability/logger';
import { OutboxService } from '../../outbox/service';
import { EventType } from '../../types/infrastructure';

const log = createLogger('ToolExecutor');

export class ToolExecutor {
  async execute(toolName: string, args: any, tenantId: string): Promise<any> {
    log.info(`Executing tool: ${toolName}`, { args, tenantId });

    switch (toolName) {
      case 'check_availability':
        return await calendarProvider.checkAvailability(args.start, args.end);

      case 'book_appointment':
        const result = await calendarProvider.bookAppointment({
          summary: args.summary || 'AI Appointment',
          start: args.start,
          end: args.end,
          description: args.description
        });
        if (result.success) {
          await OutboxService.record(tenantId, EventType.BOOKING_REQUEST, { ...args, eventId: result.eventId });
        }
        return result;

      case 'capture_lead':
        log.info('Capturing lead', args);
        await OutboxService.record(tenantId, EventType.AI_PROCESS_COMPLETE, { type: 'LEAD', ...args });
        return { success: true, message: 'Lead captured and queued for follow-up.' };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

export const toolExecutor = new ToolExecutor();
