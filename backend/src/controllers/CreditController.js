import CreditEngineService from '../services/CreditEngineService.js';

/**
 * CreditController
 * Handles HTTP request/response logic for credit intelligence endpoints.
 */
class CreditController {
  async calculateScore(req, res, next) {
    try {
      const profile = await CreditEngineService.calculateCreditScore(req.params.farmerId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await CreditEngineService.getCreditProfile(req.params.farmerId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
}

export default new CreditController();
