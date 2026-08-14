import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/requestValidator.js';
import PayoutController from '../controllers/PayoutController.js';

const router = Router();

/**
 * POST /api/payouts/initiate
 * Initiate payout for a single farmer (with automatic loan deduction).
 * Body: { farmerId, cooperativeId }
 */
router.post(
  '/initiate',
  [
    body('farmerId').notEmpty().withMessage('Farmer ID is required.'),
    body('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'),
    validate,
  ],
  (req, res, next) => PayoutController.initiateFarmerPayout(req, res, next)
);

/**
 * POST /api/payouts/bulk
 * Initiate bulk payout for all active farmers in a cooperative.
 * Body: { cooperativeId }
 */
router.post(
  '/bulk',
  [
    body('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'),
    validate,
  ],
  (req, res, next) => PayoutController.initiateBulkPayout(req, res, next)
);

/**
 * POST /api/payouts/loop-callback
 * Webhook endpoint for LOOP payment status updates.
 */
router.post('/loop-callback', (req, res, next) =>
  PayoutController.handleLoopCallback(req, res, next)
);

/**
 * GET /api/payouts/farmer/:farmerId
 * Get all payouts for a farmer.
 */
router.get(
  '/farmer/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => PayoutController.getByFarmer(req, res, next)
);

/**
 * GET /api/payouts/:payoutId
 * Get payout by ID.
 */
router.get(
  '/:payoutId',
  [param('payoutId').notEmpty().withMessage('Payout ID is required.'), validate],
  (req, res, next) => PayoutController.getById(req, res, next)
);

export default router;
