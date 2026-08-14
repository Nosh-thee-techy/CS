import { Router } from 'express';
import VoiceService from '../services/VoiceService.js';

const router = Router();

function sendXml(res, xml) {
  res.status(200);
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  return res.send(xml || '');
}

router.get('/', (_req, res) => {
  return sendXml(
    res,
    '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Lima na Loop voice is live.</Say></Response>',
  );
});

/**
 * Africa's Talking Voice callback (sandbox simulator).
 * Dashboard → Voice numbers → callback:
 *   https://<ngrok>/api/voice
 */
router.post('/', async (req, res) => {
  try {
    const xml = await VoiceService.handle(req.body || {});
    return sendXml(res, xml);
  } catch (error) {
    console.warn('AT Voice handler error:', error.message);
    return sendXml(
      res,
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Service is busy. Try USSD.</Say></Response>',
    );
  }
});

router.post('/digits', async (req, res) => {
  try {
    const xml = await VoiceService.handle(req.body || {});
    return sendXml(res, xml);
  } catch (error) {
    console.warn('AT Voice digits error:', error.message);
    return sendXml(res, '');
  }
});

export default router;
