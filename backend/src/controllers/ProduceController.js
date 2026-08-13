import ProduceService from '../services/ProduceService.js';

/**
 * ProduceController
 * Handles HTTP request/response logic for produce endpoints.
 */
class ProduceController {
  async record(req, res, next) {
    try {
      const produce = await ProduceService.recordProduce(req.body);
      res.status(201).json({ success: true, data: produce });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { farmerId } = req.params;
      const { cooperativeId } = req.query;
      const records = await ProduceService.getProduceHistory(farmerId, cooperativeId);
      res.json({ success: true, data: records, count: records.length });
    } catch (err) {
      next(err);
    }
  }

  async getUnpaid(req, res, next) {
    try {
      const result = await ProduceService.getUnpaidProduce(req.params.farmerId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await ProduceService.getProduceStats(req.params.farmerId);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

export default new ProduceController();
