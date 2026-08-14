import AfricasTalking from 'africastalking';
import env from '../config/env.js';

/**
 * Africa's Talking sandbox CPaaS client.
 *
 * Username "sandbox" makes the official SDK talk to
 * api.sandbox.africastalking.com — not live Safaricom.
 *
 * USSD and Voice inbound are HTTP callbacks (no SDK).
 * SMS outbound uses this SDK and only reaches numbers
 * registered in https://simulator.africastalking.com:1517/
 */

let client = null;

export function isSandbox() {
  return (env.AT_USERNAME || 'sandbox') === 'sandbox';
}

export function isAfricasTalkingReady() {
  return Boolean((env.AT_USERNAME || 'sandbox') && env.AT_API_KEY);
}

function sdk() {
  if (!isAfricasTalkingReady()) return null;
  if (!client) {
    const factory = AfricasTalking.default || AfricasTalking;
    client = factory({
      apiKey: env.AT_API_KEY,
      username: env.AT_USERNAME || 'sandbox',
    });
  }
  return client;
}

export function toMsisdn(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+254${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 9) return `+254${digits}`;
  if (String(phone || '').startsWith('+')) return String(phone);
  return phone;
}

export async function sendSms({ to, message }) {
  const at = sdk();
  if (!at) {
    return { skipped: true, reason: 'at_unconfigured' };
  }

  const recipients = (Array.isArray(to) ? to : [to]).map(toMsisdn).filter(Boolean);
  const payload = { to: recipients, message };
  // Sandbox rejects unregistered sender IDs. Leave `from` off unless live.
  if (env.AT_SMS_FROM && !isSandbox()) payload.from = env.AT_SMS_FROM;

  const result = await at.SMS.send(payload);
  return { skipped: false, sandbox: isSandbox(), result };
}

export function getAtStatus() {
  const publicBase = String(env.AT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return {
    sandbox: isSandbox(),
    username: env.AT_USERNAME || 'sandbox',
    smsOutbound: isAfricasTalkingReady(),
    ussdInbound: true,
    voiceInbound: true,
    shortCode: env.AT_SHORT_CODE || '',
    voiceNumber: env.AT_VOICE_NUMBER || '',
    publicBaseUrl: publicBase,
    callbacks: {
      ussd: `${publicBase || 'http://localhost:3000'}/api/ussd`,
      voice: `${publicBase || 'http://localhost:3000'}/api/voice`,
    },
    publicCallback: Boolean(publicBase && /^https:\/\//i.test(publicBase)),
    simulator: 'https://simulator.africastalking.com:1517/',
    dashboard: {
      ussdChannel: 'https://account.africastalking.com/apps/sandbox/ussd/launch',
      voiceNumbers: 'https://account.africastalking.com/apps/sandbox/voice/numbers',
    },
    channelHints: [
      'Do not use *384*100#. That code is taken. Let AT assign a unique *384*<digits>#.',
      'Callback must be public HTTPS to this API (ngrok or cloudflared → port 3000). localhost fails.',
      'Paste https://<tunnel-host>/api/ussd with no ?token= query. Leave AT_CALLBACK_SECRET empty.',
      'Register 0700434567 or 0712345678 in the AT simulator before dialing.',
    ],
  };
}
