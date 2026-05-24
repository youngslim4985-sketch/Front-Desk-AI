import { Intent } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

export class IntentCompiler {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async compile(userInput: string): Promise<Intent> {
    let action = 'unknown';
    let params: any = { raw: userInput };
    let environment: 'development' | 'staging' | 'production' = 'development';

    if (this.anthropic) {
      try {
        const systemPrompt = `
          You are a DevOps Intent Compiler. Your job is to parse natural language commands into a structured JSON intent.
          
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

        const response = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: `Parse this command: "${userInput}"` }]
        });

        const text = response.content[0].type === 'text' ? response.content[0].text : "";
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
