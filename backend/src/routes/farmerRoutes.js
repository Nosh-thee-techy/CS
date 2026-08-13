import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/requestValidator.js';
import FarmerController from '../controllers/FarmerController.js';

const router = Router();

/**
 * POST /api/farmers
 * Register a new farmer.
 */
router.post(
  '/',
  [
    body('fullName').notEmpty().withMessage('Full name is required.'),
    body('nationalId').notEmpty().withMessage('National ID is required.'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required.'),
    body('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'),
    validate,
  ],
  (req, res, next) => FarmerController.register(req, res, next)
);

/**
 * GET /api/farmers/:farmerId
 * Get farmer by ID.
 */
router.get(
  '/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => FarmerController.getById(req, res, next)
);

/**
 * GET /api/farmers/cooperative/:cooperativeId
 * List all farmers for a cooperative.
 */
router.get(
  '/cooperative/:cooperativeId',
  [param('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'), validate],
  (req, res, next) => FarmerController.listByCooperative(req, res, next)
);

/**
 * PATCH /api/farmers/:farmerId
 * Update farmer profile.
 */
router.patch(
  '/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => FarmerController.update(req, res, next)
);

/**
 * DELETE /api/farmers/:farmerId
 * Deactivate (soft delete) a farmer.
 */
router.delete(
  '/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => FarmerController.deactivate(req, res, next)
);

export default router;
