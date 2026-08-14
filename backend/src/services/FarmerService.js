import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import demo from '../data/demoStore.js';

const FARMERS_COLLECTION = 'farmers';

function phoneVariants(raw) {
  const original = String(raw || '').trim();
  const digits = original.replace(/\D/g, '');
  const variants = new Set([original, digits]);
  if (digits.startsWith('0') && digits.length === 10) {
    variants.add(`254${digits.slice(1)}`);
    variants.add(`+254${digits.slice(1)}`);
  }
  if (digits.startsWith('254') && digits.length === 12) {
    variants.add(`0${digits.slice(3)}`);
    variants.add(`+${digits}`);
  }
  if (digits.startsWith('7') && digits.length === 9) {
    variants.add(`0${digits}`);
    variants.add(`254${digits}`);
    variants.add(`+254${digits}`);
  }
  return [...variants].filter(Boolean);
}

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
    if (!isFirebaseReady()) {
      return demo.registerFarmer({ fullName, nationalId, phoneNumber, cooperativeId });
    }

    const existing = await getDocs(
      query(
        collection(db, FARMERS_COLLECTION),
        where('nationalId', '==', nationalId),
        limit(1),
      ),
    );

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

    await setDoc(doc(db, FARMERS_COLLECTION, farmerId), farmer);
    return farmer;
  }

  /**
   * Public My Readiness / USSD lookup: national ID, phone, member number, or farmer id.
   */
  async findByLookup(rawLookup) {
    if (!isFirebaseReady()) {
      return demo.findFarmerByLookup(rawLookup);
    }
    const lookup = String(rawLookup || '').trim();
    if (!lookup) return null;

    const byId = await getDoc(doc(db, FARMERS_COLLECTION, lookup));
    if (byId.exists()) return byId.data();

    const variants = phoneVariants(lookup);
    const snapshots = await Promise.all([
      getDocs(query(collection(db, FARMERS_COLLECTION), where('nationalId', '==', lookup), limit(1))),
      getDocs(query(collection(db, FARMERS_COLLECTION), where('nationalId', '==', lookup.toUpperCase()), limit(1))),
      getDocs(query(collection(db, FARMERS_COLLECTION), where('memberNumber', '==', lookup), limit(1))),
      getDocs(query(collection(db, FARMERS_COLLECTION), where('memberNumber', '==', lookup.toUpperCase()), limit(1))),
      ...variants.map((phone) =>
        getDocs(query(collection(db, FARMERS_COLLECTION), where('phoneNumber', '==', phone), limit(1))),
      ),
    ]);

    for (const snapshot of snapshots) {
      if (!snapshot.empty) return snapshot.docs[0].data();
    }
    return null;
  }

  async getFarmerById(farmerId) {
    if (!isFirebaseReady()) {
      const farmer = demo.getFarmer(farmerId);
      if (!farmer) {
        const err = new Error('Farmer not found.');
        err.statusCode = 404;
        throw err;
      }
      return farmer;
    }
    const docSnap = await getDoc(doc(db, FARMERS_COLLECTION, farmerId));
    if (!docSnap.exists()) {
      const err = new Error('Farmer not found.');
      err.statusCode = 404;
      throw err;
    }
    return docSnap.data();
  }

  async listFarmersByCooperative(cooperativeId) {
    if (!isFirebaseReady()) {
      return demo.listFarmers(cooperativeId);
    }
    const snapshot = await getDocs(
      query(collection(db, FARMERS_COLLECTION), where('cooperativeId', '==', cooperativeId)),
    );
    return snapshot.docs.map((row) => row.data());
  }

  async listAll() {
    if (!isFirebaseReady()) {
      return demo.listFarmers();
    }
    const snapshot = await getDocs(collection(db, FARMERS_COLLECTION));
    return snapshot.docs.map((row) => row.data());
  }

  async updateFarmer(farmerId, updates) {
    if (!isFirebaseReady()) {
      const farmer = demo.updateFarmer(farmerId, updates);
      if (!farmer) {
        const err = new Error('Farmer not found.');
        err.statusCode = 404;
        throw err;
      }
      return farmer;
    }
    const docRef = doc(db, FARMERS_COLLECTION, farmerId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
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

    await updateDoc(docRef, sanitized);
    return { ...docSnap.data(), ...sanitized };
  }

  async deactivateFarmer(farmerId) {
    if (!isFirebaseReady()) {
      const farmer = demo.deactivateFarmer(farmerId);
      if (!farmer) {
        const err = new Error('Farmer not found.');
        err.statusCode = 404;
        throw err;
      }
      return farmer;
    }
    return this.updateFarmer(farmerId, { status: 'INACTIVE' });
  }
}

export default new FarmerService();
