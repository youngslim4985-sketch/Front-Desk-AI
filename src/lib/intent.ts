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
  async compile(userInput: string): Promise<Intent> {
    try {
      const response = await fetch("/api/intent/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput })
      });
      if (!response.ok) throw new Error("Failed to compile intent");
      return await response.json();
    } catch (e) {
      console.error("AI Compilation failed, falling back to regex", e);
      const fallback = this.parseUserInputFallback(userInput);
      return {
        version: "1.0",
        id: uuidv4(),
        action: fallback.action,
        params: fallback.params,
        environment: fallback.environment,
        timestamp: new Date().toISOString()
      };
    }
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
