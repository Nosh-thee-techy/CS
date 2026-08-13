import { Router } from 'express';
import { param } from 'express-validator';
import validate from '../middlewares/requestValidator.js';
import CreditController from '../controllers/CreditController.js';

const router = Router();

/**
 * POST /api/credit/:farmerId/calculate
 * Recalculate credit score for a farmer.
 */
router.post(
  '/:farmerId/calculate',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => CreditController.calculateScore(req, res, next)
);

/**
 * GET /api/credit/:farmerId
 * Get the stored credit profile for a farmer.
 */
router.get(
  '/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => CreditController.getProfile(req, res, next)
);

export default router;
