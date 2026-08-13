import LoanService from '../services/LoanService.js';

/**
 * LoanController
 * Handles HTTP request/response logic for loan management endpoints.
 */
class LoanController {
  async requestLoan(req, res, next) {
    try {
      const result = await LoanService.requestLoan(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async processDecision(req, res, next) {
    try {
      const { loanId } = req.params;
      const { action, approvedAmount } = req.body;
      const result = await LoanService.processLoanDecision(loanId, action, approvedAmount);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const loan = await LoanService.getLoanById(req.params.loanId);
      res.json({ success: true, data: loan });
    } catch (err) {
      next(err);
    }
  }

  async getByFarmer(req, res, next) {
    try {
      const loans = await LoanService.getLoansByFarmer(req.params.farmerId);
      res.json({ success: true, data: loans, count: loans.length });
    } catch (err) {
      next(err);
    }
  }

  async getByCooperative(req, res, next) {
    try {
      const loans = await LoanService.getLoansByCooperative(req.params.cooperativeId);
      res.json({ success: true, data: loans, count: loans.length });
    } catch (err) {
      next(err);
    }
  }

  async getOutstanding(req, res, next) {
    try {
      const result = await LoanService.getOutstandingLoans(req.params.farmerId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new LoanController();
