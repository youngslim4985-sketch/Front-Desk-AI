import Anthropic from '@anthropic-ai/sdk';
import { CallContext } from '../../types/infrastructure';
import { getCircuit } from '../../lib/safety/circuit-breaker';
import { toolExecutor } from '../execution/ToolExecutor';
import { createLogger } from '../../observability/logger';

const log = createLogger('AIOrchestrator');

export interface OrchestrationResult {
  reply: string;
  toolCalls?: any[];
  status: 'active' | 'completed' | 'failed';
}

export class AIOrchestrator {
  private anthropic: Anthropic;
  private circuit = getCircuit("claude-orchestrator");

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  private getTools() {
    return [
      {
        name: "check_availability",
        description: "Checks if a time slot is available in the calendar.",
        input_schema: {
          type: "object",
          properties: {
            start: { type: "string", description: "ISO 8601 start time" },
            end: { type: "string", description: "ISO 8601 end time" }
          },
          required: ["start", "end"]
        }
      },
      {
        name: "book_appointment",
        description: "Books a specific appointment slot.",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            start: { type: "string" },
            end: { type: "string" },
            description: { type: "string" }
          },
          required: ["start", "end"]
        }
      },
      {
        name: "capture_lead",
        description: "Captures lead information for follow-up.",
        input_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            topic: { type: "string" }
          },
          required: ["name"]
        }
      }
    ];
  }

  async process(userMessage: string, context: CallContext, history: any[] = []): Promise<OrchestrationResult> {
    return this.circuit.execute(async () => {
      log.info('Orchestrating turn', { userMessage, sessionId: context.sessionId });

      const messages: any[] = history.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content || m.parts?.[0]?.text || ''
      }));

      // Claude Tool Use Loop
      let currentMessages = [...messages, { role: "user", content: userMessage }];
      
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: "You are the Front Desk AI for LexGuard. Use the provided tools to help users with bookings and inquiries. Be professional, concise, and helpful.",
        tools: this.getTools() as any,
        messages: currentMessages
      });

      let finalReply = "";
      let status: 'active' | 'completed' | 'failed' = 'active';

      if (response.stop_reason === 'tool_use') {
        const toolUse = response.content.find(c => c.type === 'tool_use') as any;
        if (toolUse) {
          const toolResult = await toolExecutor.execute(toolUse.name, toolUse.input, context.tenantId);
          
          // Second turn with tool results
          const secondResponse = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [
              ...currentMessages,
              { role: "assistant", content: response.content },
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content: JSON.stringify(toolResult)
                  }
                ]
              }
            ]
          });
          finalReply = secondResponse.content[0].type === 'text' ? secondResponse.content[0].text : '';
        }
      } else {
        finalReply = response.content[0].type === 'text' ? response.content[0].text : '';
      }

      return {
        reply: finalReply || "I'm sorry, I encountered an error processing that.",
        status: 'completed'
      };
    });
  }
}
