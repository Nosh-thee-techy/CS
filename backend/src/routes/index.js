import { Router } from 'express';
import farmerRoutes from './farmerRoutes.js';
import produceRoutes from './produceRoutes.js';
import creditRoutes from './creditRoutes.js';
import loanRoutes from './loanRoutes.js';
import payoutRoutes from './payoutRoutes.js';

const router = Router();

/**
 * API Route Map
 *
 * /api/farmers/*   → Farmer registration, profile management
 * /api/produce/*   → Produce delivery recording, history, stats
 * /api/credit/*    → Credit intelligence engine (score, profile)
 * /api/loans/*     → Loan lifecycle (request, approve, disburse)
 * /api/payouts/*   → Produce payouts with automated loan recovery
 */
router.use('/farmers', farmerRoutes);
router.use('/produce', produceRoutes);
router.use('/credit', creditRoutes);
router.use('/loans', loanRoutes);
router.use('/payouts', payoutRoutes);

export default router;
