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

export interface ProcessResult {
  response: string;
  state: ConversationState;
  events: any[];
}

export class WorkflowEngine {
  private sessionId: string;
  private state: ConversationState | undefined;

  constructor() {
    this.sessionId = Math.random().toString(36).substring(7);
  }

  public async run(businessName: string, userMessage: string, history: ChatMessage[]): Promise<{ response: string; action: any; workflowId: string }> {
    try {
      const response = await fetch("/api/conversation/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.sessionId,
          businessId: "tf-invest-123",
          businessName,
          userMessage,
          history,
          currentState: this.state
        })
      });

      if (!response.ok) throw new Error("Failed to process conversation");

      const result: ProcessResult = await response.json();
      this.state = result.state;

      return {
        response: result.response,
        action: this.mapStatusToAction(result.state.status),
        workflowId: result.state.sessionId
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
