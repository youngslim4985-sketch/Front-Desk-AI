import { GoogleGenAI } from "@google/genai";
import twilio from "twilio";

export class VoiceReceptionist {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(transcript: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    const systemPrompt = `
      You are a professional AI receptionist for a business.
      Your goal is to handle incoming phone calls gracefully.
      
      Guidelines:
      1. Be concise but warm.
      2. Ask for the caller's name if not known.
      3. Handle appointment requests (say you'll check availability).
      4. Handle general inquiries about services.
      5. If they want to speak to a human, say you'll transfer them (though for now just take a message).
      
      Response Format: 
      Just output the text you want the AI to speak. Keep it under 2 sentences if possible for voice flow.
    `;

    // History is not directly supported in the new generateContent call in the same way as chats.create
    // We'll combine history and system prompt into the prompt for simplicity or use ai.chats.create
    const chat = this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemPrompt
      }
    });

    const result = await chat.sendMessage({ message: transcript });
    return result.text || "I'm sorry, I didn't quite catch that. Could you repeat?";
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
