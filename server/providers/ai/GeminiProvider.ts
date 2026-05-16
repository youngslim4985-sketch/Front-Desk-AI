import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIResponse } from "./AIProvider";
import { CallContext } from "../../types/infrastructure";
import { getCircuit } from "../../lib/safety/circuit-breaker";

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private circuit = getCircuit("gemini-ai");

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(prompt: string, context: CallContext, history: any[] = []): Promise<AIResponse> {
    return this.circuit.execute(async () => {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      return {
        text,
        confidence: 1.0,
        parameters: {},
        usage: { promptTokens: 0, completionTokens: 0 } // Flash SDK doesn't always expose this easily
      };
    });
  }

  async decodeIntent(input: string, context: CallContext): Promise<AIResponse> {
    return this.circuit.execute(async () => {
      const systemPrompt = `Analyze user input and output JSON with intent and parameters.`;
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });

      const response = await model.generateContent(input);
      const text = response.response.text();
      const parsed = JSON.parse(text);

      return {
        text,
        intent: parsed.intent,
        confidence: parsed.confidence || 1.0,
        parameters: parsed.parameters || {},
        usage: { promptTokens: 0, completionTokens: 0 }
      };
    });
  }
}
