import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "crypto";
import { 
  ChatMessage, 
  ConversationState, 
  ConversationEvent, 
  ProcessResult,
  Intent
} from "./types";

export class ConversationEngine {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  // 1. Probabilistic Decoder (Gemini)
  // Maps natural language turn into a structured intent + parameters
  private async decodeIntent(
    businessName: string, 
    userMessage: string, 
    history: ChatMessage[]
  ): Promise<{ intent: Intent; confidence: number; parameters: any }> {
    const model = (this.ai as any).getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

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
    "name": "extracted name if any",
    "phone": "extracted phone if any",
    "topic": "summary of the inquiry"
  }
}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Message: ${userMessage}` }] }
      ],
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.1 
      }
    });

    try {
      const text = result.response.text();
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse intent JSON:", e);
      return { intent: "GENERAL_INQUIRY", confidence: 0.5, parameters: {} };
    }
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
    const decoded = await this.decodeIntent(businessName, userMessage, history);
    events.push({
      id: randomUUID(),
      sessionId,
      type: "intent_detected",
      payload: decoded,
      timestamp: new Date().toISOString()
    });

    // Merge parameters into state context
    state.context = {
      ...state.context,
      ...decoded.parameters,
      lastIntent: decoded.intent,
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
      const genModel = (this.ai as any).getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a receptionist for ${businessName}. Answer this question briefly: "${userMessage}"`;
      const genResult = await genModel.generateContent(prompt);
      botResponse = genResult.response.text();
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
