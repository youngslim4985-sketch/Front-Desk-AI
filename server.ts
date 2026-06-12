import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import twilio from "twilio";
import { randomUUID } from "crypto";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ConversationEngine } from "./server/engine";
import { orchestrator } from "./server/autonomous/orchestration/workflow";
import { VoiceReceptionist } from "./server/voice-engine";
import { globalDeadMan, globalIdempotency, CallState, ALLOWED_TRANSITIONS } from "./server/autonomous/layers/failure/control-plane";
import { verifyTwilioSignature } from "./server/lib/twilio-security";
import { middlewareCorrelation } from "./server/correlation/trace";
import { middlewareTenantResolution } from "./server/tenants/service";
import { OutboxService } from "./server/outbox/service";
import { EventType } from "./server/types/infrastructure";
import { ClaudeProvider } from "./server/providers/ai/ClaudeProvider";

import { AIOrchestrator } from "./server/autonomous/orchestration/AIOrchestrator";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(middlewareCorrelation);
  app.use(middlewareTenantResolution);

  // Simulate Worker Heartbeat (In production, workers push this periodically)
  setInterval(() => {
    globalDeadMan.push();
  }, 5000);

  // --- PRIVATE CLIENT INITIALIZERS ---
  
  const getSupabase = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  };

  const getTwilio = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !auth) return null;
    return twilio(sid, auth);
  };

  // Initialize Providers
  const aiProvider = process.env.ANTHROPIC_API_KEY ? new ClaudeProvider(process.env.ANTHROPIC_API_KEY) : null;
  const aiOrchestrator = process.env.ANTHROPIC_API_KEY ? new AIOrchestrator(process.env.ANTHROPIC_API_KEY) : null;
  const engine = aiProvider ? new ConversationEngine(aiProvider) : null;
  const voiceReceptionist = process.env.ANTHROPIC_API_KEY ? new VoiceReceptionist(process.env.ANTHROPIC_API_KEY) : null;

  // Store recent logs for mobile console
  const globalLogBuffer: any[] = [];
  const logToBuffer = (message: string, severity: string = "INFO") => {
    globalLogBuffer.unshift({ 
      timestamp: new Date().toISOString(), 
      message, 
      severity 
    });
    if (globalLogBuffer.length > 50) globalLogBuffer.pop();
  };

  // --- API ROUTES ---

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "OK", 
      timestamp: new Date(),
      system: globalDeadMan.getStatus(),
      ai_engine: "Claude (Anthropic)"
    });
  });

  app.get("/api/orchestrate/logs", (req, res) => {
    res.json(globalLogBuffer);
  });

  // NEW: Advanced Orchestration Endpoint (Claude Tool Use)
  app.post("/api/orchestrate/v2", async (req: any, res) => {
    const { message, history } = req.body;
    const tenantId = req.tenant.id;
    
    try {
      if (!aiOrchestrator) throw new Error("Orchestrator not initialized. Check ANTHROPIC_API_KEY.");
      
      logToBuffer(`Chat message: "${message}"`, "USER");
      
      const context = { 
        traceId: randomUUID(), 
        tenantId, 
        sessionId: randomUUID(), 
        from: "frontend", 
        to: "ai" 
      };

      const result = await aiOrchestrator.process(message, context, history);
      logToBuffer(`Reply: "${result.reply.substring(0, 50)}..."`, "AI");
      res.json(result);
    } catch (err: any) {
      console.error("Orchestration Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- TWILIO VOICE WEBHOOKS ---
  app.post("/api/twilio/voice/incoming", verifyTwilioSignature, async (req: any, res) => {
    const { CallSid, From, To, SequenceNumber = "0" } = req.body;
    const tenantId = req.tenant.id;
    const idempotencyKey = `${tenantId}_${CallSid}_${SequenceNumber}_start`;

    logToBuffer(`Incoming call from ${From} to ${To}`, "VOICE");

    // Record event in Outbox for replayability
    await OutboxService.record(tenantId, EventType.VOICE_INCOMING, { CallSid, From, To });

    // 1. Dead-Man Switch Guard
    if (globalDeadMan.shouldFailClosed()) {
      console.error(`[Safety] DEAD-MAN TRIGGERED for call ${CallSid}. Failing closed.`);
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say({ voice: 'Polly.Amy', language: 'en-GB' }, "We are experiencing a system update. Connecting you to a senior intake officer immediately.");
      twiml.dial("+15550000000"); // Standard operator cell
      return res.type("text/xml").send(twiml.toString());
    }

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy', language: 'en-GB' }, "Thank you for calling LexGuard. Are you calling regarding a new legal matter?");
    twiml.gather({
      input: ['speech'],
      action: "/api/twilio/voice/handle-input",
      timeout: 3,
      speechTimeout: 'auto'
    });
    
    const xml = twiml.toString();
    globalIdempotency.set(idempotencyKey, xml);
    res.type("text/xml").send(xml);
  });

  app.post("/api/twilio/voice/handle-input", verifyTwilioSignature, async (req: any, res) => {
    const { SpeechResult, CallSid, SequenceNumber = "0" } = req.body;
    const transcript = SpeechResult;
    const tenantId = req.tenant.id;
    const idempotencyKey = `${tenantId}_${CallSid}_${SequenceNumber}_input`;

    await OutboxService.record(tenantId, EventType.VOICE_INPUT, { CallSid, transcript });

    // Idempotency check
    const cached = globalIdempotency.get(idempotencyKey);
    if (cached) return res.type("text/xml").send(cached);

    if (!voiceReceptionist) {
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say("System error. Voice engine not configured.");
      return res.type("text/xml").send(twiml.toString());
    }

    try {
      const responseText = await voiceReceptionist.generateResponse(transcript || "Hello?");
      const twimlString = voiceReceptionist.generateTwiML(responseText, "/api/twilio/voice/handle-input");
      
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("call_transcripts").insert([{
          call_sid: CallSid,
          transcript: transcript || "[No Speech Detected]",
          response: responseText,
          timestamp: new Date().toISOString()
        }]);
      }

      res.type("text/xml").send(twimlString);
    } catch (err) {
      console.error("Voice Engine Error:", err);
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say("I'm sorry, I'm having trouble processing that call right now.");
      res.type("text/xml").send(twiml.toString());
    }
  });

  // Proxy endpoints for frontend AI requests (Safety/Security)
  app.post("/api/intent/compile", async (req, res) => {
    const { input } = req.body;
    try {
      if (!orchestrator) throw new Error("Orchestrator not initialized");
      const intent = await (orchestrator as any).compiler.compile(input);
      res.json(intent);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/intent/decode", async (req: any, res) => {
    const { businessName, userMessage } = req.body;
    const tenantId = req.tenant.id;
    try {
      if (!aiProvider) throw new Error("AI Provider not initialized");
      const context = { traceId: randomUUID(), tenantId, sessionId: randomUUID(), from: "frontend", to: "ai" };
      const decoded = await aiProvider.decodeIntent(userMessage, context);
      res.json({
        intent: decoded.intent,
        confidence: decoded.confidence,
        parameters: decoded.parameters
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/chat/generate", async (req: any, res) => {
    const { businessName, userMessage, history } = req.body;
    const tenantId = req.tenant.id;
    try {
      if (!aiProvider) throw new Error("AI Provider not initialized");
      const context = { traceId: randomUUID(), tenantId, sessionId: randomUUID(), from: "frontend", to: "ai" };
      const response = await aiProvider.generateResponse(`You are a receptionist for ${businessName}. Answer this question briefly: "${userMessage}"`, context, history);
      res.json({ response: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Twilio Phone Number Management
  app.get("/api/twilio/numbers/search", async (req, res) => {
    const twilioClient = getTwilio();
    if (!twilioClient) return res.status(500).json({ error: "Twilio not configured" });

    try {
      const numbers = await twilioClient.availablePhoneNumbers('US').local.list({ limit: 5 });
      res.json(numbers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/twilio/numbers/buy", async (req, res) => {
    const { phoneNumber } = req.body;
    const twilioClient = getTwilio();
    if (!twilioClient) return res.status(500).json({ error: "Twilio not configured" });

    try {
      const purchased = await twilioClient.incomingPhoneNumbers.create({
        phoneNumber,
        voiceUrl: `${req.protocol}://${req.get('host')}/api/twilio/voice/incoming`
      });
      res.json({ success: true, purchased });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // NEW: Autonomous Orchestration Endpoint
  app.post("/api/orchestrate", async (req, res) => {
    const { input, intent, approved } = req.body;
    try {
      const result = await orchestrator.execute(input, approved, intent);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // THE BOUNDED DECISION KERNEL
  app.post("/api/conversation/process", async (req, res) => {
    const { sessionId, businessId, businessName, userMessage, history, currentState } = req.body;
    const supabase = getSupabase();

    if (!engine) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }

    try {
      // Execute the decision engine
      const result = await engine.processTurn(
        sessionId || randomUUID(),
        businessId || "default",
        businessName || "Our Business",
        userMessage,
        history || [],
        currentState
      );

      // Persist Events to Supabase (Event Store)
      if (supabase) {
        const { error } = await supabase.from("bot_events").insert(
          result.events.map(ev => ({
            session_id: ev.sessionId,
            event_type: ev.type,
            payload: ev.payload,
            timestamp: ev.timestamp,
            business_id: businessId
          }))
        );
        if (error) console.error("Event Store Error:", error.message);

        // Update Client/Lead record if escalated or completed
        if (result.state.status === "escalated" || result.state.status === "completed") {
          await supabase.from("clients").upsert([{
            phone: result.state.context.userPhone || "Unknown",
            name: result.state.context.userName || "Anonymous",
            notes: `[SYSTEM] Status: ${result.state.status} | Session: ${sessionId}`,
            business_id: businessId
          }], { onConflict: 'phone' });
        }
      }

      res.json(result);
    } catch (err: any) {
      console.error("Kernel Panic:", err);
      res.status(500).json({ error: "Autonomous systems failure", details: err.message });
    }
  });

  // Audit Logging (The Tracing Layer)
  app.post("/api/bot/log", async (req, res) => {
    const { businessName, userMessage, botResponse, intent, workflowId } = req.body;
    const supabase = getSupabase();
    
    if (supabase) {
      try {
        await supabase.from("bot_logs").insert([{
          business_name: businessName,
          user_message: userMessage,
          bot_response: botResponse,
          intent: intent,
          workflow_id: workflowId
        }]);

        if (intent === "ESCALATION_THREAT") {
          await supabase.from("clients").insert([{
            name: "Urgent Escalation",
            notes: `[ESCALATED] Workflow ID: ${workflowId} | Message: ${userMessage}`,
            business_id: 'tf-invest-123'
          }]);
        }
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to log event" });
      }
    } else {
      res.json({ success: true, warning: "Supabase not connected" });
    }
  });

  // VAPI AVAILABILITY
  app.post("/api/vapi/availability", async (req, res) => {
    const { date, business_id } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const slots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"];

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("date_time")
        .eq("business_id", business_id)
        .like("date_time", `${date}%`);

      if (error) throw error;

      const booked = data?.map(x => x.date_time.split(" ")[1]) || [];
      const available = slots.filter(t => !booked.includes(t));

      res.json({ available });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // VAPI BOOK
  app.post("/api/vapi/book", async (req, res) => {
    const { name, phone, email, date_time, reason, business_id } = req.body;
    const supabase = getSupabase();
    const twilioClient = getTwilio();

    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { error } = await supabase.from("appointments").insert([
        { name, phone, email, date_time, reason, business_id }
      ]);

      if (error) throw error;

      // SMS CONFIRMATION
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await twilioClient.messages.create({
          body: `You're booked for ${date_time}. - Front Desk AI`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // MISSED CALL AUTO TEXT
  app.post("/api/missed-call", async (req, res) => {
    const { phone } = req.body;
    const twilioClient = getTwilio();

    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(500).json({ error: "Twilio not configured" });
    }

    try {
      await twilioClient.messages.create({
        body: "Sorry we missed your call. Reply to book instantly.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      res.json({ sent: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // STRIPE WEBHOOK
  app.post("/api/webhook", async (req, res) => {
    const event = req.body;
    const supabase = getSupabase();

    if (supabase && event.type === "checkout.session.completed") {
      const email = event.data.object.customer_email;
      try {
        await supabase.from("businesses").insert([
          {
            id: Math.random().toString(36).substring(2, 15),
            name: "New Client",
            email
          }
        ]);
      } catch (err) {
        console.error("Webhook error:", err);
      }
    }

    res.sendStatus(200);
  });

  // ANALYTICS
  app.get("/api/analytics/:business_id", async (req, res) => {
    const { business_id } = req.params;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("business_id", business_id);

      if (error) throw error;

      const revenue = appointments?.reduce((sum: number, a: any) => sum + (a.value || 0), 0) || 0;

      res.json({
        totalAppointments: appointments?.length || 0,
        revenue
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CLIENTS
  app.get("/api/clients/:business_id", async (req, res) => {
    const { business_id } = req.params;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { data: clients, error } = await supabase
        .from("clients")
        .select("*")
        .eq("business_id", business_id);

      if (error) throw error;
      res.json({ clients });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // LEADS CAPTURE
  app.post("/api/leads", async (req, res) => {
    const { name, phone, email, business_id, inquiry } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      // Store leads in 'clients' table for now with a special note or separate table
      // Let's assume a 'leads' table exists or use 'clients'
      const { data, error } = await supabase.from("clients").insert([
        { 
          name, 
          phone, 
          email, 
          business_id, 
          notes: `[LEAD FROM CHAT] Inquiry: ${inquiry}`
        }
      ]).select();

      if (error) throw error;
      res.json({ success: true, lead: data?.[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    const { name, phone, email, business_id } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { data, error } = await supabase.from("clients").insert([
        { name, phone, email, business_id }
      ]).select();

      if (error) throw error;
      res.json({ success: true, client: data?.[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // VITE MIDDLEWARE
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Front Desk AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
