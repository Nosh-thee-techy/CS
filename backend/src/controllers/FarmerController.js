import FarmerService from '../services/FarmerService.js';

/**
 * FarmerController
 * Handles HTTP request/response logic for farmer endpoints.
 */
class FarmerController {
  async register(req, res, next) {
    try {
      const farmer = await FarmerService.registerFarmer(req.body);
      res.status(201).json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }

  async listAll(req, res, next) {
    try {
      const farmers = await FarmerService.listAll();
      res.json({ success: true, data: farmers, count: farmers.length });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const farmer = await FarmerService.getFarmerById(req.params.farmerId);
      res.json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }

  async listByCooperative(req, res, next) {
    try {
      const farmers = await FarmerService.listFarmersByCooperative(req.params.cooperativeId);
      res.json({ success: true, data: farmers, count: farmers.length });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const farmer = await FarmerService.updateFarmer(req.params.farmerId, req.body);
      res.json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req, res, next) {
    try {
      const farmer = await FarmerService.deactivateFarmer(req.params.farmerId);
      res.json({ success: true, data: farmer, message: 'Farmer deactivated.' });
    } catch (err) {
      next(err);
    }
  }
}

export default new FarmerController();
