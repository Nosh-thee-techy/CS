import { collection, doc, getDocs, query, setDoc, where, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const PRODUCE_COLLECTION = 'produce_records';

/**
 * ProduceService
 * Records produce deliveries and queries unpaid produce totals for payout calculation.
 */
class ProduceService {
  /**
   * Record a new produce delivery.
   * @param {object} data - { farmerId, cooperativeId, cropType, quantityKg, ratePerKg, produceDate }
   */
  async recordProduce({ farmerId, cooperativeId, cropType, quantityKg, ratePerKg, produceDate }) {
    const recordId = uuidv4();
    const totalAmount = parseFloat((quantityKg * ratePerKg).toFixed(2));
    const now = new Date().toISOString();

    const record = {
      recordId,
      farmerId,
      cooperativeId,
      cropType,
      quantityKg,
      ratePerKg,
      totalAmount,
      produceDate: produceDate || now,
      payoutStatus: 'UNPAID',
      payoutId: null,
      createdAt: now,
    };

    await setDoc(doc(db, PRODUCE_COLLECTION, recordId), record);
    return record;
  }

  /**
   * Get produce history for a farmer (optionally filtered by cooperative).
   */
  async getProduceHistory(farmerId, cooperativeId = null) {
    let firestoreQuery = query(collection(db, PRODUCE_COLLECTION), where('farmerId', '==', farmerId));
    if (cooperativeId) {
      firestoreQuery = query(firestoreQuery, where('cooperativeId', '==', cooperativeId));
    }
    const snapshot = await getDocs(query(firestoreQuery, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get all UNPAID produce records for a farmer (used for payout calculation).
   * Returns the list and computed gross total.
   */
  async getUnpaidProduce(farmerId) {
    const snapshot = await getDocs(
      query(
        collection(db, PRODUCE_COLLECTION),
        where('farmerId', '==', farmerId),
        where('payoutStatus', '==', 'UNPAID')
      )
    );

    const records = snapshot.docs.map((doc) => doc.data());
    const grossTotal = records.reduce((sum, r) => sum + r.totalAmount, 0);

    return { records, grossTotal: parseFloat(grossTotal.toFixed(2)) };
  }

  /**
   * Mark produce records as settled (called after successful payout).
   * @param {string[]} recordIds - Array of produce record IDs to mark as settled
   * @param {string} payoutId - The payout that settled these records
   */
  async markProduceAsSettled(recordIds, payoutId) {
    const batch = writeBatch(db);

    for (const recordId of recordIds) {
      const ref = doc(db, PRODUCE_COLLECTION, recordId);
      batch.update(ref, {
        payoutStatus: 'SETTLED',
        payoutId,
      });
    }

    await batch.commit();
  }

  /**
   * Get aggregate produce statistics for a farmer (used by Credit Engine).
   */
  async getProduceStats(farmerId) {
    const snapshot = await getDocs(
      query(collection(db, PRODUCE_COLLECTION), where('farmerId', '==', farmerId))
    );

    const records = snapshot.docs.map((doc) => doc.data());

    if (records.length === 0) {
      return {
        totalDeliveries: 0,
        totalQuantityKg: 0,
        totalEarnings: 0,
        averageQuantityPerDelivery: 0,
        cropTypes: [],
        earliestDelivery: null,
        latestDelivery: null,
      };
    }

    const totalQuantityKg = records.reduce((sum, r) => sum + r.quantityKg, 0);
    const totalEarnings = records.reduce((sum, r) => sum + r.totalAmount, 0);
    const cropTypes = [...new Set(records.map((r) => r.cropType))];
    const dates = records.map((r) => r.produceDate).sort();

    return {
      totalDeliveries: records.length,
      totalQuantityKg: parseFloat(totalQuantityKg.toFixed(2)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      averageQuantityPerDelivery: parseFloat((totalQuantityKg / records.length).toFixed(2)),
      cropTypes,
      earliestDelivery: dates[0],
      latestDelivery: dates[dates.length - 1],
    };
  }
}

export default new ProduceService();
