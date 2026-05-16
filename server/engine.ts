import { AIProvider } from "./providers/ai/AIProvider";
import { randomUUID } from "crypto";
import { 
  ChatMessage, 
  ConversationState, 
  ConversationEvent, 
  ProcessResult
} from "./types";
import { createLogger } from "./observability/logger";
import { CallContext } from "./types/infrastructure";

const log = createLogger("ConversationEngine");

export class ConversationEngine {
  constructor(private ai: AIProvider) {}

  // 1. Probabilistic Decoder (AI Provider)
  private async decodeIntent(
    businessName: string, 
    userMessage: string, 
    context: CallContext
  ) {
    log.info("Decoding intent", { userMessage, tenantId: context.tenantId });
    return this.ai.decodeIntent(userMessage, context);
  }

  // 2. Deterministic State Machine (The Kernel)
  public async processTurn(
    sessionId: string,
    businessId: string,
    businessName: string,
    userMessage: string,
    history: ChatMessage[],
    currentState?: ConversationState
  ): Promise<ProcessResult> {
    const timestamp = new Date().toISOString();
    const events: ConversationEvent[] = [];

    // Initialize state if first turn
    let state: ConversationState = currentState || {
      sessionId,
      businessId,
      status: "idle",
      context: {},
      lastUpdated: timestamp
    };

    // Log the user message
    events.push({
      id: randomUUID(),
      sessionId,
      type: "user_message",
      payload: { message: userMessage },
      timestamp
    });

    // 1. Deterministic Guardrails (Immediate action for critical signals)
    const normalizedMsg = userMessage.toLowerCase();
    if (normalizedMsg.includes("human") || normalizedMsg.includes("supervisor") || normalizedMsg.includes("manager")) {
      state.status = "escalated";
      return this.finalizeTurn(state, "I understand. I'm notifying a supervisor to step in immediately.", events);
    }

    // 2. Decoder Turn
    const context: CallContext = { 
      traceId: randomUUID(), // This should ideally come from correlation context
      tenantId: businessId, 
      sessionId, 
      from: "unknown", 
      to: "unknown" 
    };
    
    const decoded = await this.decodeIntent(businessName, userMessage, context);
    events.push({
      id: randomUUID(),
      sessionId,
      type: "intent_detected",
      payload: { 
        intent: decoded.intent, 
        confidence: decoded.confidence, 
        parameters: decoded.parameters 
      },
      timestamp: new Date().toISOString()
    });

    // Merge parameters into state context
    state.context = {
      ...state.context,
      ...decoded.parameters,
      lastIntent: decoded.intent as any,
      confidence: decoded.confidence
    };

    // 3. Orchestration Logic (The "Switch Statement" pattern)
    let botResponse = "";

    if (decoded.intent === "ESCALATION_THREAT" || decoded.confidence < 0.4) {
      state.status = "escalated";
      botResponse = "I'm sorry I'm having trouble assisting. I've flagged this for a team member to review and contact you.";
      events.push({ id: randomUUID(), sessionId, type: "escalation", payload: { reason: "Low confidence or threat" }, timestamp: new Date().toISOString() });
    } 
    else if (decoded.intent === "BOOKING_REQUEST") {
      if (state.context.userPhone && state.context.userName) {
        state.status = "completed";
        botResponse = `Perfect, ${state.context.userName}! I've started your booking process for ${state.context.inquiryTopic || 'the service'}. Our office will reach out to ${state.context.userPhone} to finalize the time.`;
        events.push({ id: randomUUID(), sessionId, type: "tool_execution", payload: { tool: "book_provisional" }, timestamp: new Date().toISOString() });
      } else {
        state.status = "awaiting_info";
        botResponse = "I can definitely help with booking! Could you please provide your name and phone number so we can coordinate a time?";
      }
    } 
    else if (decoded.intent === "PRICING_INQUIRY") {
      botResponse = `For pricing on ${state.context.inquiryTopic || 'our services'}, it's best to have a team member provide a customized quote. Would you like me to have someone call you?`;
    }
    else {
      // Default generative response for general queries
      try {
        const context: CallContext = { traceId: randomUUID(), tenantId: businessId, sessionId, from: "unknown", to: "unknown" };
        const response = await this.ai.generateResponse(`You are a receptionist for ${businessName}. Answer this question briefly: "${userMessage}"`, context);
        botResponse = response.text || "I'm sorry, I'm not sure how to help with that.";
      } catch (err) {
        botResponse = "I'm sorry, I'm having trouble connecting right now.";
      }
    }

    state.lastUpdated = new Date().toISOString();
    return this.finalizeTurn(state, botResponse, events);
  }

  private finalizeTurn(state: ConversationState, response: string, events: ConversationEvent[]): ProcessResult {
    events.push({
      id: randomUUID(),
      sessionId: state.sessionId,
      type: "bot_response",
      payload: { response },
      timestamp: new Date().toISOString()
    });

    return {
      response,
      state,
      events
    };
  }
}
