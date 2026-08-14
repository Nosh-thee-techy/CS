import { Router } from 'express';
import { getAtStatus } from '../clients/africasTalking.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({ success: true, data: getAtStatus() });
});

export default router;
