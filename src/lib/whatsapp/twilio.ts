/**
 * Twilio WhatsApp Business API client — REST via fetch (not the Node SDK),
 * per Student Build Guide 6.3. Only ever called from the BullMQ worker
 * (workers/whatsapp.worker.ts), never inline from an API route.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM!; // e.g. "whatsapp:+14155238886"

// Map of approved Twilio Content Template SIDs. Never send raw/ad-hoc text —
// every message must go through an approved template (Golden Rule).
const APPROVED_TEMPLATES: Record<string, string> = {
  CREDIT_HOLD_PLACED: process.env.TWILIO_TEMPLATE_CREDIT_HOLD_PLACED ?? "",
  CREDIT_HOLD_RELEASED: process.env.TWILIO_TEMPLATE_CREDIT_HOLD_RELEASED ?? "",
  OUTLET_APPROVED: process.env.TWILIO_TEMPLATE_OUTLET_APPROVED ?? "",
  OUTLET_REJECTED: process.env.TWILIO_TEMPLATE_OUTLET_REJECTED ?? "",
  MANAGER_BROADCAST: process.env.TWILIO_TEMPLATE_MANAGER_BROADCAST ?? "",
};

export interface SendWhatsAppParams {
  toPhone: string; // E.164, e.g. "+923004471882"
  templateName: keyof typeof APPROVED_TEMPLATES;
  variables: Record<string, string>;
}

export interface SendWhatsAppResult {
  ok: boolean;
  messageSid?: string;
  status?: string;
  errorMessage?: string;
}

export async function sendWhatsAppMessage({
  toPhone,
  templateName,
  variables,
}: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const contentSid = APPROVED_TEMPLATES[templateName];
  if (!contentSid) {
    return { ok: false, errorMessage: `No approved template configured for ${templateName}` };
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const body = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: `whatsapp:${toPhone}`,
    ContentSid: contentSid,
    ContentVariables: JSON.stringify(variables),
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const json = await res.json();

    if (!res.ok) {
      // Common cases: invalid number, unsubscribed recipient, template not approved
      return {
        ok: false,
        errorMessage: json?.message ?? `Twilio request failed (${res.status})`,
      };
    }

    return { ok: true, messageSid: json.sid, status: json.status };
  } catch (err) {
    return { ok: false, errorMessage: err instanceof Error ? err.message : "Unknown Twilio error" };
  }
}
