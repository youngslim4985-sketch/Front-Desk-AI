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

  constructor() {
    this.sessionId = Math.random().toString(36).substring(7);
  }

  private async decodeIntent(businessName: string, userMessage: string): Promise<{ intent: Intent; confidence: number; parameters: any }> {
    const response = await fetch("/api/intent/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, userMessage })
    });
    if (!response.ok) throw new Error("Failed to decode intent");
    return await response.json();
  }

  public async run(businessName: string, userMessage: string, history: ChatMessage[]): Promise<{ response: string; action: any; workflowId: string }> {
    try {
      // 1. Decode intent via proxy
      const decoded = await this.decodeIntent(businessName, userMessage);
      
      // ... rest of the logic involves state updates and local decisions

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
        // Chat directly with server proxy for general queries
        const genResponse = await fetch("/api/chat/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessName, userMessage, history })
        });
        if (!genResponse.ok) throw new Error("Failed to generate chat response");
        const chatData = await genResponse.json();
        botResponse = chatData.response || "I'm sorry, I'm not sure how to help with that.";
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
