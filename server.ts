import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import twilio from "twilio";
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "crypto";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ConversationEngine } from "./server/engine";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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

  // Initialize Engine
  const engine = process.env.GEMINI_API_KEY ? new ConversationEngine(process.env.GEMINI_API_KEY) : null;

  // --- API ROUTES ---

  app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

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
