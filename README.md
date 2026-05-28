
# Front Desk AI™

**The intelligent platform for vertical AI solutions.**  
**First vertical:** [LexGuard AI™](https://github.com/yourusername/lexguard-ai) — AI-powered legal operations.

---

## Overview

**Front Desk AI™** is a scalable, secure, multi-tenant AI platform designed to power specialized vertical applications. It provides core infrastructure (authentication, orchestration, data handling, security, and billing) while allowing clean, independent vertical modules to be plugged in.

**Current Vertical:**
- **LexGuard AI™** — Legal document intelligence, contract analysis, client intake, compliance automation, and privileged information handling.

**Future Verticals (planned):**
- MedDesk — Healthcare operations
- ShopDesk — Retail & e-commerce intelligence
- And more...

---

## Key Features

- **Multi-Tenant Architecture** — Secure isolation between customers and verticals
- **AI Orchestration Layer** — Seamless integration between Spring Boot backend and Flask ML services
- **Enterprise-Grade Security** — Built with PPLGuard AI security framework
- **Vertical Extensibility** — Clean separation between core platform and domain-specific logic
- **Compliance Ready** — Designed with GDPR, CCPA, and industry-specific regulations in mind (especially legal)
- **Observability & Monitoring** — Full logging, anomaly detection, and audit trails

---

## Architecture

- **Backend**: Spring Boot (Java/Kotlin) — Core API, user management, business logic
- **AI/ML Layer**: Flask (Python) — Machine learning models, document intelligence, anomaly detection
- **Security Module**: PPLGuard AI — Dedicated threat detection, ML-based anomaly protection, and hardening
- **Database**: PostgreSQL (with potential vector extensions for RAG)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions with security scanning
- **Monitoring**: ELK Stack + custom dashboards
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
