import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import twilio from "twilio";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- PRIVATE CLIENT INITIALIZERS (Lazy load to keep keys hidden until used) ---

  const getSupabase = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  };

  const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key);
  };

  const getTwilio = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !auth) return null;
    return twilio(sid, auth);
  };

  const getGemini = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  };

  // --- API ROUTES ---

  app.get("/api/health", (req, res) => res.json({ status: "OK" }));

  // --- WORKFLOW ENGINE (The Bounded Decision System) ---
  
  interface ChatMessage {
    role: "user" | "assistant";
    content: string;
  }

  interface WorkflowResult {
    response: string;
    action?: "capture_lead" | "book_appointment" | "escalate" | null;
    workflowId?: string;
  }

  // Pure Deterministic Logic (The Guardrails)
  const resolveIntent = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    if (/price|cost|quote|how much/i.test(message)) return "PRICING_INQUIRY";
    if (/book|appointment|schedule|meeting|visit/i.test(message)) return "BOOKING_REQUEST";
    if (/complain|angry|error|wrong|issue|not working/i.test(message)) return "ESCALATION_THREAT";
    return "GENERAL_INQUIRY";
  };

  // The Structured Orchestrator
  const runWorkflow = async (businessName: string, userMessage: string, history: ChatMessage[]): Promise<WorkflowResult> => {
    const genAI = getGemini();
    if (!genAI) throw new Error("Gemini not configured");

    const intent = resolveIntent(userMessage);
    const supabase = getSupabase();

    // AI Generation Step (Probabilistic Helper)
    const model = genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        ...history.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
        { role: "user", parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are a professional AI receptionist for ${businessName}. 
        Intent detected by system: ${intent}.
        
        Rules:
        1. If PRICING_INQUIRY, provide a helpful general response but insist on a follow-up for a specific quote.
        2. If BOOKING_REQUEST, encourage them and say the office will confirm details.
        3. If ESCALATION_THREAT, be extremely apologetic and say a supervisor has been notified immediately.
        4. Conciseness is mandatory. Max 2 sentences.`,
      }
    });

    const aiResponse = (await model).text;

    // Side Effect: Auto-Escalate high-friction intents
    if (intent === "ESCALATION_THREAT" && supabase) {
      await supabase.from("clients").insert([{
        name: "Urgent Escalation",
        notes: `[ESCALATED] User issue: ${userMessage}`,
        business_id: 'tf-invest-123'
      }]);
    }

    return {
      response: aiResponse,
      action: intent === "ESCALATION_THREAT" ? "escalate" : (intent !== "GENERAL_INQUIRY" ? "capture_lead" : null),
      workflowId: Math.random().toString(36).substring(7)
    };
  };

  // SECURE CHAT ENDPOINT
  app.post("/api/chat", async (req, res) => {
    const { businessName, userMessage, history } = req.body;
    
    try {
      const result = await runWorkflow(businessName, userMessage, history);
      res.json(result);
    } catch (err: any) {
      console.error("Workflow Error:", err);
      res.status(500).json({ error: "System is re-calibrating. Please try again." });
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
