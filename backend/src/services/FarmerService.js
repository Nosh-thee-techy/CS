import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const FARMERS_COLLECTION = 'farmers';

/**
 * FarmerService
 * Handles farmer registration, profile management, and M-Pesa verification.
 */
class FarmerService {
  /**
   * Register a new farmer.
   * @param {object} data - { fullName, nationalId, phoneNumber, cooperativeId }
   * @returns {object} Created farmer document
   */
  async registerFarmer({ fullName, nationalId, phoneNumber, cooperativeId }) {
    // Check for duplicate national ID
    const existing = await db
      .collection(FARMERS_COLLECTION)
      .where('nationalId', '==', nationalId)
      .limit(1)
      .get();

    if (!existing.empty) {
      const err = new Error('A farmer with this National ID is already registered.');
      err.statusCode = 409;
      throw err;
    }

    const farmerId = uuidv4();
    const now = new Date().toISOString();

    const farmer = {
      farmerId,
      fullName,
      nationalId,
      phoneNumber,
      cooperativeId,
      status: 'ACTIVE',
      mpesaVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(FARMERS_COLLECTION).doc(farmerId).set(farmer);
    return farmer;
  }

  /**
   * Get a farmer by ID.
   */
  async getFarmerById(farmerId) {
    const doc = await db.collection(FARMERS_COLLECTION).doc(farmerId).get();
    if (!doc.exists) {
      const err = new Error('Farmer not found.');
      err.statusCode = 404;
      throw err;
    }
    return doc.data();
  }

  /**
   * List all farmers belonging to a cooperative.
   */
  async listFarmersByCooperative(cooperativeId) {
    const snapshot = await db
      .collection(FARMERS_COLLECTION)
      .where('cooperativeId', '==', cooperativeId)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Update farmer profile (phone, status, M-Pesa verification, etc.).
   */
  async updateFarmer(farmerId, updates) {
    const docRef = db.collection(FARMERS_COLLECTION).doc(farmerId);
    const doc = await docRef.get();
    if (!doc.exists) {
      const err = new Error('Farmer not found.');
      err.statusCode = 404;
      throw err;
    }

    const allowedFields = ['fullName', 'phoneNumber', 'status', 'mpesaVerified'];
    const sanitized = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key];
      }
    }
    sanitized.updatedAt = new Date().toISOString();

    await docRef.update(sanitized);
    return { ...doc.data(), ...sanitized };
  }

  /**
   * Deactivate a farmer (soft delete).
   */
  async deactivateFarmer(farmerId) {
    return this.updateFarmer(farmerId, { status: 'INACTIVE' });
  }
}

export default new FarmerService();
