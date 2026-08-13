import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import CreditEngineService from './CreditEngineService.js';
import LoopAdapter from './LoopAdapter.js';
import FarmerService from './FarmerService.js';

const LOANS_COLLECTION = 'loans';

/**
 * LoanService
 * Manages the full loan lifecycle:
 *   Request → Credit check → Cooperative approval → LOOP disbursement → Repayment tracking
 */
class LoanService {
  /**
   * Farmer requests a loan.
   * Verifies credit eligibility before creating the loan application.
   *
   * @param {object} data - { farmerId, cooperativeId, requestedAmount }
   * @returns {object} Created loan record
   */
  async requestLoan({ farmerId, cooperativeId, requestedAmount }) {
    // 1. Get / calculate credit profile
    const creditProfile = await CreditEngineService.calculateCreditScore(farmerId);

    // 2. Check if requested amount is within credit limit
    if (requestedAmount > creditProfile.maxLoanLimit) {
      const err = new Error(
        `Requested amount KES ${requestedAmount} exceeds maximum credit limit of KES ${creditProfile.maxLoanLimit}. ` +
          `Credit Score: ${creditProfile.score}/850, Risk: ${creditProfile.riskTier}.`
      );
      err.statusCode = 400;
      throw err;
    }

    // 3. Check for existing active loans
    const activeLoans = await this._getActiveLoans(farmerId);
    if (activeLoans.length > 0) {
      const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
      const remainingLimit = creditProfile.maxLoanLimit - totalOutstanding;
      if (requestedAmount > remainingLimit) {
        const err = new Error(
          `Farmer has KES ${totalOutstanding} in outstanding loans. ` +
            `Remaining borrowable limit: KES ${Math.max(0, remainingLimit)}.`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    // 4. Create loan application
    const loanId = uuidv4();
    const now = new Date().toISOString();

    const loan = {
      loanId,
      farmerId,
      cooperativeId,
      requestedAmount,
      approvedAmount: 0,
      outstandingBalance: 0,
      status: 'PENDING',
      creditScoreAtRequest: creditProfile.score,
      loopTransactionRef: null,
      disbursedAt: null,
      createdAt: now,
    };

    await db.collection(LOANS_COLLECTION).doc(loanId).set(loan);
    return { loan, creditProfile };
  }

  /**
   * Cooperative approves (or rejects) a loan application.
   *
   * @param {string} loanId
   * @param {string} action - 'APPROVE' or 'REJECT'
   * @param {number} [approvedAmount] - Amount approved (defaults to requested amount)
   */
  async processLoanDecision(loanId, action, approvedAmount = null) {
    const docRef = db.collection(LOANS_COLLECTION).doc(loanId);
    const doc = await docRef.get();

    if (!doc.exists) {
      const err = new Error('Loan not found.');
      err.statusCode = 404;
      throw err;
    }

    const loan = doc.data();

    if (loan.status !== 'PENDING') {
      const err = new Error(`Loan is already ${loan.status}. Only PENDING loans can be processed.`);
      err.statusCode = 400;
      throw err;
    }

    if (action === 'REJECT') {
      await docRef.update({ status: 'REJECTED' });
      return { ...loan, status: 'REJECTED' };
    }

    if (action === 'APPROVE') {
      const finalAmount = approvedAmount || loan.requestedAmount;

      // Trigger LOOP disbursement
      const farmer = await FarmerService.getFarmerById(loan.farmerId);
      const loopResult = await LoopAdapter.disburseLoan({
        farmerId: loan.farmerId,
        phone: farmer.phoneNumber,
        amount: finalAmount,
        loanId,
      });

      const updatedLoan = {
        status: 'DISBURSED',
        approvedAmount: finalAmount,
        outstandingBalance: finalAmount,
        loopTransactionRef: loopResult.transactionRef,
        disbursedAt: new Date().toISOString(),
      };

      await docRef.update(updatedLoan);
      return { ...loan, ...updatedLoan, loopResult };
    }

    const err = new Error('Invalid action. Use APPROVE or REJECT.');
    err.statusCode = 400;
    throw err;
  }

  /**
   * Get a loan by ID.
   */
  async getLoanById(loanId) {
    const doc = await db.collection(LOANS_COLLECTION).doc(loanId).get();
    if (!doc.exists) {
      const err = new Error('Loan not found.');
      err.statusCode = 404;
      throw err;
    }
    return doc.data();
  }

  /**
   * Get all loans for a farmer.
   */
  async getLoansByFarmer(farmerId) {
    const snapshot = await db
      .collection(LOANS_COLLECTION)
      .where('farmerId', '==', farmerId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get all loans for a cooperative.
   */
  async getLoansByCooperative(cooperativeId) {
    const snapshot = await db
      .collection(LOANS_COLLECTION)
      .where('cooperativeId', '==', cooperativeId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Reduce outstanding balance on a loan (called during payout deduction).
   * If balance reaches 0, marks loan as REPAID.
   *
   * @param {string} loanId
   * @param {number} amount - Amount to deduct from outstanding balance
   */
  async reduceOutstandingBalance(loanId, amount) {
    const docRef = db.collection(LOANS_COLLECTION).doc(loanId);
    const doc = await docRef.get();
    if (!doc.exists) return;

    const loan = doc.data();
    const newBalance = parseFloat(Math.max(0, loan.outstandingBalance - amount).toFixed(2));
    const updates = { outstandingBalance: newBalance };

    if (newBalance === 0) {
      updates.status = 'REPAID';
    }

    await docRef.update(updates);
    return { ...loan, ...updates };
  }

  /**
   * Get active (disbursed, non-repaid) loans for a farmer.
   */
  async _getActiveLoans(farmerId) {
    const snapshot = await db
      .collection(LOANS_COLLECTION)
      .where('farmerId', '==', farmerId)
      .where('status', '==', 'DISBURSED')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get total outstanding loan balance for a farmer across all active loans.
   * Returns the total amount and the list of active loan objects.
   */
  async getOutstandingLoans(farmerId) {
    const activeLoans = await this._getActiveLoans(farmerId);
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    return {
      activeLoans,
      totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
    };
  }
}

export default new LoanService();
