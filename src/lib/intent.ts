import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

export interface Intent {
  version: string;
  id: string;
  action: string;
  params: any;
  environment: 'development' | 'staging' | 'production';
  timestamp: string;
}

export class IntentCompiler {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  async compile(userInput: string): Promise<Intent> {
    let action = 'unknown';
    let params: any = { raw: userInput };
    let environment: 'development' | 'staging' | 'production' = 'production';

    if (this.ai) {
      try {
        const systemPrompt = `
          You are a Legal Intake Intent Compiler. Your job is to parse natural language commands into a structured JSON intent.
          
          Supported Actions: 
          - open_legal_matter (requires client_name, practice_area)
          - run_conflict_check (requires party_name)
          - escalate_intake (requires reason, urgency_score)
          
          Environments: development, staging, production
          
          Output JSON format:
          {
            "action": string,
            "params": object,
            "environment": string
          }
        `;

        const response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Parse this command: "${userInput}"`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        });

        const text = response.text || "";
        const parsed = JSON.parse(text);
        action = parsed.action || action;
        params = parsed.params || params;
        environment = parsed.environment || environment;
      } catch (e) {
        console.error("AI Compilation failed, falling back to regex", e);
        const fallback = this.parseUserInputFallback(userInput);
        action = fallback.action;
        params = fallback.params;
        environment = fallback.environment;
      }
    } else {
      const fallback = this.parseUserInputFallback(userInput);
      action = fallback.action;
      params = fallback.params;
      environment = fallback.environment;
    }
    
    return {
      version: "1.0",
      id: uuidv4(),
      action,
      params,
      environment,
      timestamp: new Date().toISOString()
    };
  }
  
  private parseUserInputFallback(input: string): any {
    const lower = input.toLowerCase();
    if (lower.includes('matter') && lower.includes('open')) {
      return { action: 'open_legal_matter', params: { client: 'pending' }, environment: 'production' };
    }
    if (lower.includes('conflict') && lower.includes('check')) {
      return { action: 'run_conflict_check', params: { party: 'pending' }, environment: 'production' };
    }
    return { action: 'unknown', params: { raw: input }, environment: 'production' };
  }
}

export const intentCompiler = new IntentCompiler();
