# Front-Desk-AI ™  
### After-Hours Litigation Intake Protection & Autonomous Workflow Assurance

![Status](https://img.shields.io/badge/T%26F-GOLD--STANDARD-D4AF37)
![Version](https://img.shields.io/badge/v-1.0.0--beta-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

> **"Architecture distributes. Focus compounds."**  
> *The T&F standard for high-stakes operational infrastructure.*

---

## ⚖️ The Mission
LexGuard AI™ is a specialized, mission-critical control plane designed for mid-size litigation firms and personal injury practices. It eliminates the "After-Hours Leakage" problem by providing a hardened, AI-driven intake engine that understands the difference between a general inquiry and a high-stakes statute-of-limitations emergency.

LexGuard isn't just a chatbot; it's a **Workflow Assurance Kernel** that monitors, escalates, and secures every potential new matter.

---

## 🛠 Features

| Feature | Description |
| :--- | :--- |
| **High-Fidelity Legal Voice** | Multi-turn Twilio-powered legal intake with emotive, professional personas (built on Gemini 1.5 Flash). |
| **Intake Assurance Kernel** | A "Dead-Man Switch" architectural pattern that ensures critical calls never experience silence, even during partial system degradation. |
| **Intent Decoupling** | Frontend-side intent compilation to reduce backend latency and improve operator visibility. |
| **Policy Engine** | Strict validation rules (e.g., Conflict Checks mandatory before matter creation). |
| **Probabilistic Routing** | Intelligent escalation based on urgency markers (e.g., "served with process", "hearing tomorrow"). |
| **Audit-Ready Logging** | Every decision trace is logged for compliance and malpractice protection. |
| **Idempotent Webhooks** | Hardened signature verification for Twilio endpoints to prevent double-billing or missed events. |
| **Unified Inbox** | Real-time dashboard for managing intakes, escalations, and appointments. |

---

## 🏗 Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4.0
- **Animations**: Framer Motion (LexGuard Signature Transitions)
- **Backend**: Node.js (TypeScript) + Express
- **AI Core**: Google Gemini 1.5 Flash (via `@google/generative-ai`)
- **Database**: Supabase (PostgreSQL) + Redis (Simulated for State Management)
- **Communications**: Twilio Voice + Gathering API
- **Safety Kernel**: Custom Circuit Breakers, Dead-Man Switches, and Rollback Registries

---

## 📂 Project Structure

```text
├── server/                 # The "Assurance Kernel" Backend
│   ├── autonomous/         # Autonomous Execution Layers
│   │   ├── layers/         # Intent, Policy, Simulation, Execution
│   │   └── orchestration/  # Workflow state machine
│   ├── engine.ts           # Probabilistic Intent Decoder
│   ├── voice-engine.ts     # Twilio TwiML Generation Logic
│   └── lib/                # Security (Twilio verification, etc.)
├── src/                    # The "Intake Center" Frontend
│   ├── components/         # Dashboard & Autonomous Monitors
│   ├── lib/                # Client-side workflow & Intent compilation
│   └── App.tsx             # Main entry & Router
├── server.ts               # Production-grade Express Server
└── metadata.json           # Application Identity & Permissions
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Twilio Account (for Voice production)
- Gemini API Key

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_phone
```

### 3. Installation & Launch
```bash
npm install
npm run dev
```

---

## 🛡 High-Stakes Architecture

LexGuard operates on a **Safety Kernel** architecture. Every critical action (like opening a new matter) passes through three distinct layers:

1.  **Compliance Policy Layer**: Checks if the action violates firm protocols (e.g., Conflict Search).
2.  **Simulation Layer**: Dry-runs the execution to predict failures.
3.  **Execution Runner**: Performs the atomic write with a registered rollback path in case of failure.

If the system detects >15s of core service heartbeat silence, the **Dead-Man Switch** triggers, immediately failing-closed to a senior operator's cell phone to ensure zero missed leads.

---

## 💰 LexGuard Licensing

| Tier | Focus | Price |
| :--- | :--- | :--- |
| **LexGuard Alpha** | Solo/Compact Firms | $250/mo + Vol |
| **LexGuard Shield** | Mid-Size Litigation | $1,200/mo + Vol |
| **LexGuard Enterprise** | National Injury Groups | Contact Sales |

---

## 🗺 Roadmap
- [x] High-Stakes Voice Intake (Twilio + Gemini)
- [x] Autonomous Safety Kernel (Dead-man switch)
- [x] Intent-based Policy Routing
- [ ] Google Calendar Integration (Beta)
- [ ] Court-Case Filing Automation (Drafting)
- [ ] HIPAA/SOC2 Hardening Suite

---

© 2026 T&F Investments. Propitiatory Software. All Rights Reserved.  
*Architecture is Destiny.*

 