import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type Intent = "PRICING_INQUIRY" | "BOOKING_REQUEST" | "ESCALATION_THREAT" | "GENERAL_INQUIRY";

export interface ConversationState {
  sessionId: string;
  businessId: string;
  status: "idle" | "awaiting_info" | "resolving" | "completed" | "escalated";
  context: any;
  lastUpdated: string;
}

export class WorkflowEngine {
  private sessionId: string;
  private state: ConversationState | undefined;
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.sessionId = Math.random().toString(36).substring(7);
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  private async decodeIntent(businessName: string, userMessage: string): Promise<{ intent: Intent; confidence: number; parameters: any }> {
    if (!this.ai) throw new Error("Gemini API key not configured");

    const systemPrompt = `You are the Intent Decoder for ${businessName}'s receptionist.
Your only job is to analyze the user's latest message and output a JSON object representing their intent.

Available Intents:
- PRICING_INQUIRY: User asking about costs, rates, or fees.
- BOOKING_REQUEST: User wanting to schedule, book, or visit.
- ESCALATION_THREAT: User expressing frustration, anger, or demanding a human/supervisor.
- GENERAL_INQUIRY: Normal questions or small talk.

Output Format:
{
  "intent": "INTENT_NAME",
  "confidence": 0.0 to 1.0,
  "parameters": {
    "userName": "extracted name if any",
    "userPhone": "extracted phone if any",
    "inquiryTopic": "summary of the inquiry"
  }
}`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Message: ${userMessage}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { intent: "GENERAL_INQUIRY", confidence: 0.5, parameters: {} };
    }
  }

  public async run(businessName: string, userMessage: string, history: ChatMessage[]): Promise<{ response: string; action: any; workflowId: string }> {
    try {
      if (!this.ai) throw new Error("AI not initialized");

      // 1. Decode intent in frontend
      const decoded = await this.decodeIntent(businessName, userMessage);

      // 2. Deterministic State Machine (Frontend)
      const timestamp = new Date().toISOString();
      if (!this.state) {
        this.state = {
          sessionId: this.sessionId,
          businessId: "tf-invest-123",
          status: "idle",
          context: {},
          lastUpdated: timestamp
        };
      }

      this.state.context = {
        ...this.state.context,
        ...decoded.parameters,
        lastIntent: decoded.intent
      };

      let botResponse = "";
      let status: ConversationState["status"] = "idle";

      if (decoded.intent === "ESCALATION_THREAT" || decoded.confidence < 0.4) {
        status = "escalated";
        botResponse = "I'm sorry I'm having trouble assisting. I've flagged this for a team member to review and contact you.";
      } 
      else if (decoded.intent === "BOOKING_REQUEST") {
        if (this.state.context.userPhone && this.state.context.userName) {
          status = "completed";
          botResponse = `Perfect, ${this.state.context.userName}! I've started your booking process. Our office will reach out to ${this.state.context.userPhone} to finalize the time.`;
        } else {
          status = "awaiting_info";
          botResponse = "I can definitely help with booking! Could you please provide your name and phone number so we can coordinate a time?";
        }
      } 
      else if (decoded.intent === "PRICING_INQUIRY") {
        botResponse = `For pricing details, it's best to have a team member provide a customized quote. Would you like me to have someone call you?`;
      }
      else {
        // Chat directly with Gemini for general queries
        const genResponse = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are a receptionist for ${businessName}. Answer this question briefly: "${userMessage}"`,
          config: { history: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })) }
        } as any); // History usage varies in SDK versions
        botResponse = genResponse.text || "I'm sorry, I'm not sure how to help with that.";
      }

      this.state.status = status;
      this.state.lastUpdated = new Date().toISOString();

      // 3. Sync events to backend for audit/persistence (fire and forget)
      fetch("/api/bot/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          userMessage,
          botResponse,
          intent: decoded.intent,
          workflowId: this.sessionId
        })
      }).catch(console.error);

      return {
        response: botResponse,
        action: this.mapStatusToAction(status),
        workflowId: this.sessionId
      };
    } catch (err) {
      console.error("Workflow Runtime Error:", err);
      return {
        response: "I'm having trouble connecting to my brain. Please try again in a moment.",
        action: null,
        workflowId: "error"
      };
    }
  }

  private mapStatusToAction(status: string) {
    if (status === "escalated") return "escalate";
    if (status === "awaiting_info" || status === "completed") return "capture_lead";
    return null;
  }
}

export const workflowEngine = new WorkflowEngine();
