import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase.js';
import ProduceService from './ProduceService.js';
import demo from '../data/demoStore.js';

const CREDIT_PROFILES_COLLECTION = 'credit_profiles';
const LOANS_COLLECTION = 'loans';

/**
 * CreditEngineService
 * Aggregates farmer data, calculates a credit score (300–850),
 * determines risk tier and maximum loan limit,
 * and generates an AI-readable credit explanation.
 */
class CreditEngineService {
  /**
   * Calculate / recalculate a farmer's credit score and store the credit profile.
   * @param {string} farmerId
   * @returns {object} Credit profile
   */
  async calculateCreditScore(farmerId) {
    if (!isFirebaseReady()) {
      const stored = demo.getCreditProfile(farmerId);
      if (!stored) {
        const err = new Error('Farmer not found.');
        err.statusCode = 404;
        throw err;
      }
      return stored;
    }
    // 1. Aggregate produce data
    const produceStats = await ProduceService.getProduceStats(farmerId);

    // 2. Aggregate loan repayment history
    const loanStats = await this._getLoanRepaymentStats(farmerId);

    // 3. Compute sub-scores
    const deliveryScore = this._scoreDeliveryConsistency(produceStats);
    const volumeScore = this._scoreProduceVolume(produceStats);
    const repaymentScore = this._scoreRepaymentHistory(loanStats);

    // 4. Weighted composite score (300 – 850)
    //    Delivery consistency: 30%, Volume: 30%, Repayment: 40%
    const rawScore = deliveryScore * 0.3 + volumeScore * 0.3 + repaymentScore * 0.4;
    const score = Math.round(Math.min(850, Math.max(300, 300 + rawScore * 5.5)));

    // 5. Risk tier & max loan limit
    const { riskTier, maxLoanLimit } = this._determineRiskAndLimit(score, produceStats);

    // 6. AI explanation
    const aiExplanation = this._generateExplanation(score, riskTier, produceStats, loanStats);

    const profile = {
      farmerId,
      score,
      riskTier,
      maxLoanLimit,
      totalProduceKgHistorical: produceStats.totalQuantityKg,
      deliveryConsistencyScore: deliveryScore,
      aiExplanation,
      lastCalculatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, CREDIT_PROFILES_COLLECTION, farmerId), profile, { merge: true });

    return profile;
  }

  /**
   * Retrieve a stored credit profile without recalculating.
   */
  async getCreditProfile(farmerId) {
    if (!isFirebaseReady()) {
      const stored = demo.getCreditProfile(farmerId);
      if (!stored) {
        const err = new Error('Farmer not found.');
        err.statusCode = 404;
        throw err;
      }
      return stored;
    }
    const docSnap = await getDoc(doc(db, CREDIT_PROFILES_COLLECTION, farmerId));
    if (!docSnap.exists()) {
      // Auto-calculate if none exists
      return this.calculateCreditScore(farmerId);
    }
    return docSnap.data();
  }

  // ─── Internal helpers ──────────────────────────────────────────────

  /**
   * Get loan repayment statistics for a farmer.
   */
  async _getLoanRepaymentStats(farmerId) {
    const snapshot = await getDocs(
      query(collection(db, LOANS_COLLECTION), where('farmerId', '==', farmerId))
    );

    const loans = snapshot.docs.map((doc) => doc.data());

    const totalLoans = loans.length;
    const repaidLoans = loans.filter((l) => l.status === 'REPAID').length;
    const defaultedLoans = loans.filter((l) => l.status === 'DEFAULTED').length;
    const activeLoans = loans.filter((l) => ['APPROVED', 'DISBURSED'].includes(l.status));
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);

    return {
      totalLoans,
      repaidLoans,
      defaultedLoans,
      activeLoansCount: activeLoans.length,
      totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
      repaymentRate: totalLoans > 0 ? repaidLoans / totalLoans : 1, // Default perfect if no history
    };
  }

  /**
   * Score delivery consistency (0 – 100).
   * More deliveries over a longer period = higher score.
   */
  _scoreDeliveryConsistency(stats) {
    if (stats.totalDeliveries === 0) return 20; // Minimum baseline for new farmers

    // Score based on number of deliveries (max 50 points for 20+ deliveries)
    const deliveryPoints = Math.min(50, (stats.totalDeliveries / 20) * 50);

    // Score based on consistency (having a long track record)
    let tenurePoints = 0;
    if (stats.earliestDelivery && stats.latestDelivery) {
      const months =
        (new Date(stats.latestDelivery) - new Date(stats.earliestDelivery)) /
        (1000 * 60 * 60 * 24 * 30);
      tenurePoints = Math.min(50, (months / 24) * 50); // Max 50 points for 2+ years
    }

    return Math.round(deliveryPoints + tenurePoints);
  }

  /**
   * Score produce volume (0 – 100).
   * Higher total kg = higher score.
   */
  _scoreProduceVolume(stats) {
    if (stats.totalQuantityKg === 0) return 10;

    // Benchmark: 5000 kg = 100 points
    return Math.round(Math.min(100, (stats.totalQuantityKg / 5000) * 100));
  }

  /**
   * Score repayment history (0 – 100).
   */
  _scoreRepaymentHistory(loanStats) {
    // New farmer with no loan history gets a neutral score
    if (loanStats.totalLoans === 0) return 50;

    let score = loanStats.repaymentRate * 80; // Up to 80 points for repayment rate

    // Penalty for defaults
    score -= loanStats.defaultedLoans * 15;

    // Bonus for multiple successfully repaid loans
    score += Math.min(20, loanStats.repaidLoans * 5);

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Determine risk tier and maximum loan limit from composite credit score.
   */
  _determineRiskAndLimit(score, produceStats) {
    let riskTier;
    let maxLoanMultiplier;

    if (score >= 750) {
      riskTier = 'LOW';
      maxLoanMultiplier = 0.8; // Can borrow up to 80% of historical earnings
    } else if (score >= 600) {
      riskTier = 'MEDIUM';
      maxLoanMultiplier = 0.5; // Up to 50%
    } else {
      riskTier = 'HIGH';
      maxLoanMultiplier = 0.2; // Up to 20%
    }

    const maxLoanLimit = parseFloat(
      (produceStats.totalEarnings * maxLoanMultiplier).toFixed(2)
    );

    return { riskTier, maxLoanLimit: Math.max(maxLoanLimit, 0) };
  }

  /**
   * Generate a human-readable credit explanation.
   */
  _generateExplanation(score, riskTier, produceStats, loanStats) {
    const parts = [];

    parts.push(`Credit Score: ${score}/850 (Risk: ${riskTier}).`);

    if (produceStats.totalDeliveries > 0) {
      parts.push(
        `Farmer has made ${produceStats.totalDeliveries} produce deliveries ` +
          `totaling ${produceStats.totalQuantityKg} kg across crops: ${produceStats.cropTypes.join(', ')}.`
      );
    } else {
      parts.push('No produce delivery history found. Score reflects minimal track record.');
    }

    if (loanStats.totalLoans > 0) {
      parts.push(
        `Loan history: ${loanStats.repaidLoans}/${loanStats.totalLoans} loans fully repaid.`
      );
      if (loanStats.defaultedLoans > 0) {
        parts.push(`⚠️ ${loanStats.defaultedLoans} loan(s) defaulted — this significantly impacts the score.`);
      }
      if (loanStats.totalOutstanding > 0) {
        parts.push(`Current outstanding loan balance: KES ${loanStats.totalOutstanding.toLocaleString()}.`);
      }
    } else {
      parts.push('No prior loan history — neutral assessment applied.');
    }

    return parts.join(' ');
  }
}

export default new CreditEngineService();
