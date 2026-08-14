import { Router } from 'express';
import UssdService from '../services/UssdService.js';

const router = Router();

function atFields(req) {
  const src = { ...(req.query || {}), ...(req.body || {}) };
  return {
    sessionId: String(src.sessionId || src.sessionid || ''),
    serviceCode: String(src.serviceCode || src.servicecode || ''),
    phoneNumber: String(src.phoneNumber || src.phonenumber || ''),
    text: src.text == null ? '' : String(src.text),
  };
}

function sendAt(res, reply) {
  const raw = String(reply || '').replace(/^\uFEFF/, '').trim();
  const body = /^(CON|END)\s/i.test(raw) ? raw : `END ${raw || 'Lima na Loop'}`;
  res.status(200);
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  return res.send(body);
}

/**
 * Africa's Talking sandbox USSD callback.
 *
 * Dashboard → Sandbox → USSD → Create channel
 *   Callback URL: https://<public-host>/api/ussd
 *   (also mounted at /ussd)
 *
 * AT pings this URL when you save the channel. The body MUST start with
 * CON or END and the status MUST be 200. JSON, 403, or HTML fails create.
 */
async function handleUssd(req, res) {
  try {
    const fields = atFields(req);
    console.log(
      `[AT USSD] ${req.method} session=${fields.sessionId || '-'} phone=${fields.phoneNumber || '-'} text=${JSON.stringify(fields.text)}`,
    );

    const probe = req.method === 'GET' || (!fields.phoneNumber && !fields.sessionId && !fields.text);
    if (probe) {
      return sendAt(res, 'END Lima na Loop USSD is live.');
    }

    const reply = await UssdService.handle(fields);
    return sendAt(res, reply);
  } catch (error) {
    console.warn('[AT USSD] handler error:', error.message);
    return sendAt(res, 'END Service is busy. Try again shortly.');
  }
}

router.all('/', handleUssd);

export default router;
