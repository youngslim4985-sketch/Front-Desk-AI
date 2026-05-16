import { CallContext } from "../../types/infrastructure";

export interface AIResponse {
  text: string;
  intent?: string;
  confidence: number;
  parameters: Record<string, any>;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIProvider {
  generateResponse(prompt: string, context: CallContext, history?: any[]): Promise<AIResponse>;
  decodeIntent(input: string, context: CallContext): Promise<AIResponse>;
}
