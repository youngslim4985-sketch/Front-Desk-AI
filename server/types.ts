export type Intent = "PRICING_INQUIRY" | "BOOKING_REQUEST" | "ESCALATION_THREAT" | "GENERAL_INQUIRY";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationState {
  sessionId: string;
  businessId: string;
  status: "idle" | "awaiting_info" | "resolving" | "completed" | "escalated";
  context: {
    userName?: string;
    userPhone?: string;
    inquiryTopic?: string;
    appointmentDate?: string;
    lastIntent?: Intent;
    confidence?: number;
  };
  lastUpdated: string;
}

export interface ConversationEvent {
  id: string;
  sessionId: string;
  type: "user_message" | "intent_detected" | "state_transition" | "tool_execution" | "bot_response" | "escalation";
  payload: any;
  timestamp: string;
}

export interface ProcessResult {
  response: string;
  state: ConversationState;
  events: ConversationEvent[];
}
