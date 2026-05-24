import Anthropic from '@anthropic-ai/sdk';
import twilio from "twilio";

export class VoiceReceptionist {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateResponse(transcript: string, history: any[] = []) {
    const systemPrompt = `
      You are a high-stakes Legal Receptionist for a litigation law firm for T & F Investments.
      Your goal is to handle incoming calls with extreme care and professional empathy.
      
      CRITICAL INSTRUCTIONS:
      1. Identify if this is a "Potential New Matter" or an "Existing Case".
      2. If it's a new matter, determine the practice area (Personal Injury, Employment, Criminal, etc.).
      3. Look for "Statute of Limitations" triggers (deadlines, hearing dates, service of process).
      4. Be concise but warm. Never give legal advice.
      
      Response Format: 
      Just output the text you want the AI to speak. Keep it under 2 sentences for natural flow.
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: transcript }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (err) {
      console.error("Claude Backend Error:", err);
      return "I'm sorry, I'm having trouble processing your request. One moment while I connect you.";
    }
  }

  generateTwiML(message: string, nextActionUrl: string): string {
    const response = new twilio.twiml.VoiceResponse();
    response.say({ voice: 'Polly.Amy', language: 'en-GB' }, message);
    response.gather({
      input: ['speech'],
      action: nextActionUrl,
      timeout: 3,
      speechTimeout: 'auto'
    });
    // In case they don't say anything
    response.say("I didn't catch that. Please say something or hang up.");
    response.redirect(nextActionUrl);
    
    return response.toString();
  }
}
