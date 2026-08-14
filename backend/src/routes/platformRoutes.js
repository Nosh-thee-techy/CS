import { Router } from 'express';
import demo from '../data/demoStore.js';

const router = Router();

router.get('/snapshot', (_req, res) => {
  res.json({ success: true, data: demo.snapshot() });
});

export default router;
