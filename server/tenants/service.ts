import { TenantConfig } from "../types/infrastructure";

// In production, this would fetch from DB/Cache
const TENANTS: Record<string, TenantConfig> = {
  "tf-investments": {
    id: "tenant_1",
    slug: "tf-investments",
    name: "T & F Investments",
    brandColor: "#D4AF37",
    phoneNumbers: ["+15550000000"],
    aiProvider: "gemini",
    voiceProvider: "twilio",
    calendarProvider: "google",
    features: ["high_stakes_intake", "automated_escalation"],
    metadata: {}
  }
};

export class TenantService {
  static async getTenantBySlug(slug: string): Promise<TenantConfig | null> {
    return TENANTS[slug] || null;
  }

  static async getTenantByPhoneNumber(phone: string): Promise<TenantConfig | null> {
    return Object.values(TENANTS).find(t => t.phoneNumbers.includes(phone)) || null;
  }
}

export async function middlewareTenantResolution(req: any, res: any, next: any) {
  const host = req.headers.host;
  const slug = host.split('.')[0]; // Simple slug resolution
  
  // Or resolution by phone number from body for webhooks
  const toPhone = req.body?.To;
  
  let tenant = null;
  if (toPhone) {
    tenant = await TenantService.getTenantByPhoneNumber(toPhone);
  } else {
    tenant = await TenantService.getTenantBySlug(slug);
  }

  // Fallback to default for AI Studio preview if needed
  if (!tenant) tenant = TENANTS["tf-investments"];

  req.tenant = tenant;
  next();
}
