import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/requestValidator.js';
import FarmerController from '../controllers/FarmerController.js';

const router = Router();

router.get('/', (req, res, next) => FarmerController.listAll(req, res, next));

router.get(
  '/cooperative/:cooperativeId',
  [param('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'), validate],
  (req, res, next) => FarmerController.listByCooperative(req, res, next)
);

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

router.get(
  '/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => FarmerController.getById(req, res, next)
);

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
