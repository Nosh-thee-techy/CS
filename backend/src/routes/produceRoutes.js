import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/requestValidator.js';
import ProduceController from '../controllers/ProduceController.js';

const router = Router();

/**
 * POST /api/produce
 * Record a new produce delivery.
 */
router.post(
  '/',
  [
    body('farmerId').notEmpty().withMessage('Farmer ID is required.'),
    body('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'),
    body('cropType').notEmpty().withMessage('Crop type is required.'),
    body('quantityKg').isFloat({ gt: 0 }).withMessage('Quantity (kg) must be a positive number.'),
    body('ratePerKg').isFloat({ gt: 0 }).withMessage('Rate per kg must be a positive number.'),
    validate,
  ],
  (req, res, next) => ProduceController.record(req, res, next)
);

/**
 * GET /api/produce/farmer/:farmerId
 * Get produce history for a farmer. Optional query: ?cooperativeId=xxx
 */
router.get(
  '/farmer/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => ProduceController.getHistory(req, res, next)
);

/**
 * GET /api/produce/farmer/:farmerId/unpaid
 * Get unpaid produce and gross total for a farmer.
 */
router.get(
  '/farmer/:farmerId/unpaid',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => ProduceController.getUnpaid(req, res, next)
);

/**
 * GET /api/produce/farmer/:farmerId/stats
 * Get aggregate produce statistics for a farmer (used by Credit Engine).
 */
router.get(
  '/farmer/:farmerId/stats',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => ProduceController.getStats(req, res, next)
);

export default router;
