import { Intent } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from "@google/genai";

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
    let environment: 'development' | 'staging' | 'production' = 'development';

    if (this.ai) {
      try {
        const systemPrompt = `
          You are a DevOps Intent Compiler. Your job is to parse natural language commands into a structured JSON intent.
          
          Supported Actions: 
          - deploy_service (requires service name, tag)
          - run_tests (requires suite name)
          - delete_service (requires service name)
          
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
    if (lower.includes('deploy') && lower.includes('staging')) {
      return { action: 'deploy_service', params: { service: 'api', tag: 'latest' }, environment: 'staging' };
    }
    if (lower.includes('deploy') && lower.includes('production')) {
      return { action: 'deploy_service', params: { service: 'api', tag: 'latest' }, environment: 'production' };
    }
    return { action: 'unknown', params: { raw: input }, environment: 'development' };
  }
}
