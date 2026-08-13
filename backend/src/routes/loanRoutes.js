import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/requestValidator.js';
import LoanController from '../controllers/LoanController.js';

const router = Router();

/**
 * POST /api/loans
 * Farmer requests a loan.
 */
router.post(
  '/',
  [
    body('farmerId').notEmpty().withMessage('Farmer ID is required.'),
    body('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'),
    body('requestedAmount')
      .isFloat({ gt: 0 })
      .withMessage('Requested amount must be a positive number.'),
    validate,
  ],
  (req, res, next) => LoanController.requestLoan(req, res, next)
);

/**
 * POST /api/loans/:loanId/decision
 * Cooperative approves or rejects a loan.
 * Body: { action: "APPROVE" | "REJECT", approvedAmount?: number }
 */
router.post(
  '/:loanId/decision',
  [
    param('loanId').notEmpty().withMessage('Loan ID is required.'),
    body('action')
      .isIn(['APPROVE', 'REJECT'])
      .withMessage('Action must be APPROVE or REJECT.'),
    validate,
  ],
  (req, res, next) => LoanController.processDecision(req, res, next)
);

/**
 * GET /api/loans/:loanId
 * Get loan by ID.
 */
router.get(
  '/:loanId',
  [param('loanId').notEmpty().withMessage('Loan ID is required.'), validate],
  (req, res, next) => LoanController.getById(req, res, next)
);

/**
 * GET /api/loans/farmer/:farmerId
 * Get all loans for a farmer.
 */
router.get(
  '/farmer/:farmerId',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => LoanController.getByFarmer(req, res, next)
);

/**
 * GET /api/loans/cooperative/:cooperativeId
 * Get all loans for a cooperative.
 */
router.get(
  '/cooperative/:cooperativeId',
  [param('cooperativeId').notEmpty().withMessage('Cooperative ID is required.'), validate],
  (req, res, next) => LoanController.getByCooperative(req, res, next)
);

/**
 * GET /api/loans/farmer/:farmerId/outstanding
 * Get outstanding loan balance for a farmer.
 */
router.get(
  '/farmer/:farmerId/outstanding',
  [param('farmerId').notEmpty().withMessage('Farmer ID is required.'), validate],
  (req, res, next) => LoanController.getOutstanding(req, res, next)
);

export default router;
