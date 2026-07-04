# Front Desk AI™ — User Customization & Multilingual Receptionist

**Branch:** `user-customization-multilingual`

## Overview

This patch adds per-business customization and multilingual support to the
Front Desk AI virtual receptionist. Business owners can configure their
receptionist's tone, hours, escalation rules, and supported languages through
a guided onboarding wizard and a persistent dashboard settings area.

## What's Included

### Types
- `src/types/business-settings.ts` — Shared TypeScript interfaces for
  business profile, receptionist personality, language configuration, and
  integration settings. Single source of truth consumed by onboarding and
  dashboard components.

### Lib
- `src/lib/language-map.ts` — Canonical list of supported languages (ISO
  codes, display names, locale-specific greeting defaults) plus helpers for
  resolving a caller's preferred language.
- `src/lib/receptionist-prompt.ts` — Builds the system prompt sent to the
  underlying LLM/voice pipeline from a `BusinessSettings` object, injecting
  tone, business hours, escalation policy, and active languages.

### Hooks
- `src/hooks/useBusinessSettings.ts` — Core fetch/save hook for a business's
  `BusinessSettings`. All other hooks and components sit on top of this one.
- `src/hooks/useLanguages.ts` — Owns a local language draft (toggle/set
  default) and persists via `useBusinessSettings.save()`.
- `src/hooks/useIntegrations.ts` — Wraps calendar/CRM OAuth connect flows and
  persists the resulting connection state.

### Onboarding
- `src/components/onboarding/OnboardingWizard.tsx` — Multi-step wizard walking
  a new business through: business profile → receptionist personality →
  language selection → integrations → review & activate. Loads any
  in-progress settings via `useBusinessSettings` and persists on "Activate".

### Dashboard
Components now take only a `businessId` prop and pull their data/mutations
from the hooks above — no more `settings`/`onSave` prop drilling.
- `src/components/dashboard/AISettings.tsx` — Edit receptionist tone, greeting
  script, sign-off, and escalation rules. Uses `useBusinessSettings` directly.
- `src/components/dashboard/Languages.tsx` — Add/remove supported languages,
  set a default, and preview localized greetings. Uses `useLanguages`.
- `src/components/dashboard/Integrations.tsx` — Manage connected calendar,
  CRM, and phone provisioning integrations. Uses `useIntegrations`.

## GitHub Integration Status

Repo push automation is **not currently connected** — there's no GitHub MCP
connector available in this workspace yet, so commits/pushes shown above must
be run manually from your local checkout. This section will be updated if/when
a GitHub connector becomes available.

## Local Setup

```bash
git checkout -b user-customization-multilingual
mkdir -p src/types src/lib src/hooks src/components/onboarding src/components/dashboard
# copy the files from this patch into place
git add README.md src/
git commit -m "feat: add user customization and multilingual receptionist settings"
git commit -m "feat: add business settings React hooks"
git push -u origin user-customization-multilingual
```

## Next Steps

- [ ] Replace the `TODO`-marked `fetch`/`persistBusinessSettings` calls in
      `useBusinessSettings.ts` with real API endpoints.
- [ ] Replace `startOAuthFlow()` in `useIntegrations.ts` with a real OAuth
      kickoff for Google/Outlook/HubSpot/QuickBooks.
- [ ] Replace placeholder language list in `language-map.ts` with the final
      set approved for the plumbing/home-services vertical launch.
- [ ] Add unit tests for `buildReceptionistPrompt()` and the hooks (mock
      fetch/persist functions).
- [ ] Connect `Integrations.tsx` to Twilio provisioning status.
