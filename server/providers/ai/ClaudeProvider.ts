import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIResponse } from "./AIProvider";
import { CallContext } from "../../types/infrastructure";
import { getCircuit } from "../../lib/safety/circuit-breaker";

export class ClaudeProvider implements AIProvider {
  private anthropic: Anthropic;
  private circuit = getCircuit("claude-ai");

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateResponse(prompt: string, context: CallContext, history: any[] = []): Promise<AIResponse> {
    return this.circuit.execute(async () => {
      const messages = history.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.parts[0].text
      }));

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [...messages, { role: "user", content: prompt }]
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return {
        text,
        confidence: 1.0,
        parameters: {},
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens
        }
      };
    });
  }

  async decodeIntent(input: string, context: CallContext): Promise<AIResponse> {
    return this.circuit.execute(async () => {
      const systemPrompt = `Analyze user input for ${context.tenantId} and output JSON with "intent", "confidence", and "parameters".
      Available intents: PRICING_INQUIRY, BOOKING_REQUEST, ESCALATION_THREAT, GENERAL_INQUIRY.`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: input }]
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      const parsed = JSON.parse(text);

      return {
        text,
        intent: parsed.intent,
        confidence: parsed.confidence || 1.0,
        parameters: parsed.parameters || {},
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens
        }
      };
    });
  }
}
