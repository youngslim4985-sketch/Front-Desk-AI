import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type Intent = "PRICING_INQUIRY" | "BOOKING_REQUEST" | "ESCALATION_THREAT" | "GENERAL_INQUIRY";

export interface WorkflowResult {
  response: string;
  action?: "capture_lead" | "book_appointment" | "escalate" | null;
  workflowId: string;
  intent: Intent;
}

// Bounded Decision System (Client-Side Implementation)
// Adheres to gemini-api skill: "Always call Gemini API from the frontend"
export class WorkflowEngine {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  private resolveIntent(userMessage: string): Intent {
    const message = userMessage.toLowerCase();
    
    if (/complain|angry|error|wrong|issue|not working|terrible|hate|sucks/i.test(message)) {
      return "ESCALATION_THREAT";
    }
    
    if (/price|cost|quote|how much|rate|fee|payment/i.test(message)) {
      return "PRICING_INQUIRY";
    }
    
    if (/book|appointment|schedule|meeting|visit|reservation/i.test(message)) {
      return "BOOKING_REQUEST";
    }
    
    return "GENERAL_INQUIRY";
  }

  public async run(businessName: string, userMessage: string, history: ChatMessage[]): Promise<WorkflowResult> {
    const intent = this.resolveIntent(userMessage);

    // AI Generation Step (Probabilistic Helper)
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview", // Correct model from skill
      contents: [
        ...history.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
        { role: "user", parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are a professional AI receptionist for ${businessName}.
        
        Intent detected: ${intent}.
        
        Rules:
        1. If PRICING_INQUIRY, be helpful but say a human will provide a precise quote.
        2. If BOOKING_REQUEST, encourage them and say we'll confirm the slot.
        3. If ESCALATION_THREAT, be extremely apologetic and say a supervisor is notified.
        4. Be concise (max 2 sentences). No fluff.`,
        temperature: 0.7,
      }
    });

    const result = {
      response: response.text || "I'm sorry, I'm having trouble processing that.",
      intent,
      action: this.mapIntentToAction(intent),
      workflowId: Math.random().toString(36).substring(7)
    };

    // Deterministic Side Effect: Remote Audit Logging (Async)
    this.logWorkflow(businessName, userMessage, result);

    return result;
  }

  private mapIntentToAction(intent: Intent): WorkflowResult["action"] {
    switch (intent) {
      case "ESCALATION_THREAT": return "escalate";
      case "PRICING_INQUIRY":
      case "BOOKING_REQUEST": return "capture_lead";
      default: return null;
    }
  }

  private async logWorkflow(businessName: string, userMessage: string, result: WorkflowResult) {
    try {
      await fetch("/api/bot/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          userMessage,
          botResponse: result.response,
          intent: result.intent,
          workflowId: result.workflowId
        })
      });
    } catch (err) {
      console.warn("Audit Log Failed:", err);
    }
  }
}

export const workflowEngine = new WorkflowEngine();
