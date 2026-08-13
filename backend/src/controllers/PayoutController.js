import PayoutService from '../services/PayoutService.js';

/**
 * PayoutController
 * Handles HTTP request/response logic for payout endpoints.
 */
class PayoutController {
  async initiateFarmerPayout(req, res, next) {
    try {
      const result = await PayoutService.initiateFarmerPayout(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async initiateBulkPayout(req, res, next) {
    try {
      const { cooperativeId } = req.body;
      const result = await PayoutService.initiateBulkPayout(cooperativeId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const payout = await PayoutService.getPayoutById(req.params.payoutId);
      res.json({ success: true, data: payout });
    } catch (err) {
      next(err);
    }
  }

  async getByFarmer(req, res, next) {
    try {
      const payouts = await PayoutService.getPayoutsByFarmer(req.params.farmerId);
      res.json({ success: true, data: payouts, count: payouts.length });
    } catch (err) {
      next(err);
    }
  }

  async handleLoopCallback(req, res, next) {
    try {
      const result = await PayoutService.handleLoopCallback(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new PayoutController();
