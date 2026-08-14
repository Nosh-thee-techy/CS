import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import env from '../config/env.js';
import ProduceService from './ProduceService.js';
import LoanService from './LoanService.js';
import FarmerService from './FarmerService.js';
import LoopAdapter from './LoopAdapter.js';
import demo from '../data/demoStore.js';

const PAYOUTS_COLLECTION = 'payouts';

/**
 * PayoutService
 *
 * Core engine for produce payouts with automated loan recovery.
 *
 * When a cooperative initiates a payout:
 *   1. Sum all unpaid produce for the farmer → Gross Amount
 *   2. Check outstanding loan balance
 *   3. Calculate deduction (capped by MAX_LOAN_REPAYMENT_PERCENTAGE)
 *   4. Net Payout = Gross - Deduction
 *   5. Execute payout via LOOP to farmer's M-Pesa
 *   6. Atomically update produce records, loan balance, and payout audit log
 */
class PayoutService {
  /**
   * Initiate a payout for a single farmer's unpaid produce.
   *
   * @param {object} params
   * @param {string} params.farmerId
   * @param {string} params.cooperativeId
   * @returns {object} Payout record with breakdown
   */
  async initiateFarmerPayout({ farmerId, cooperativeId }) {
    // 1. Get farmer details (for phone number)
    const farmer = await FarmerService.getFarmerById(farmerId);

    // 2. Get unpaid produce
    const { records: unpaidRecords, grossTotal } = await ProduceService.getUnpaidProduce(farmerId);

    if (unpaidRecords.length === 0 || grossTotal === 0) {
      const err = new Error('No unpaid produce records found for this farmer.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Check outstanding loans
    const { activeLoans, totalOutstanding } = await LoanService.getOutstandingLoans(farmerId);

    // 4. Calculate deduction
    const maxRepaymentPct = env.MAX_LOAN_REPAYMENT_PERCENTAGE / 100;
    const maxDeductible = parseFloat((grossTotal * maxRepaymentPct).toFixed(2));
    const loanDeduction = parseFloat(Math.min(totalOutstanding, maxDeductible).toFixed(2));
    const netPayout = parseFloat((grossTotal - loanDeduction).toFixed(2));

    // 5. Create payout record
    const payoutId = uuidv4();
    const now = new Date().toISOString();

    const payout = {
      payoutId,
      cooperativeId,
      farmerId,
      produceRecordIds: unpaidRecords.map((r) => r.recordId),
      grossProduceAmount: grossTotal,
      loanDeductionAmount: loanDeduction,
      netPayoutAmount: netPayout,
      paymentMethod: 'MPESA',
      recipientPhone: farmer.phoneNumber,
      status: 'INITIATED',
      loopTransactionRef: null,
      createdAt: now,
    };

    // 6. Execute payout via LOOP (send net amount to farmer)
    let loopResult;
    if (netPayout > 0) {
      loopResult = await LoopAdapter.processPayout({
        farmerId,
        phone: farmer.phoneNumber,
        grossAmount: grossTotal,
        deductionAmount: loanDeduction,
        netAmount: netPayout,
        payoutId,
      });

      payout.loopTransactionRef = loopResult.transactionRef;
      payout.status = 'LOOP_PROCESSING';
    } else {
      // Entire produce value goes to loan repayment, no cash to farmer
      payout.status = 'COMPLETED';
    }

    // 7. Persist payout + settle produce + reduce loans
    if (isFirebaseReady()) {
      await setDoc(doc(db, PAYOUTS_COLLECTION, payoutId), payout);
    } else {
      demo.addPayout(payout);
    }
    await ProduceService.markProduceAsSettled(
      unpaidRecords.map((r) => r.recordId),
      payoutId
    );

    // Distribute deduction across active loans (oldest first)
    if (loanDeduction > 0 && activeLoans.length > 0) {
      let remainingDeduction = loanDeduction;
      // Sort by creation date (oldest first)
      const sortedLoans = activeLoans.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      for (const loan of sortedLoans) {
        if (remainingDeduction <= 0) break;
        const deductFromThisLoan = Math.min(loan.outstandingBalance, remainingDeduction);
        await LoanService.reduceOutstandingBalance(loan.loanId, deductFromThisLoan);
        remainingDeduction -= deductFromThisLoan;
      }
    }

    return {
      payout,
      breakdown: {
        grossProduceAmount: grossTotal,
        loanDeductionAmount: loanDeduction,
        netPayoutToFarmer: netPayout,
        produceRecordsSettled: unpaidRecords.length,
        activeLoansAffected: activeLoans.length,
      },
      loopResult: loopResult || null,
    };
  }

  /**
   * Initiate bulk payouts for all farmers in a cooperative.
   *
   * @param {string} cooperativeId
   * @returns {object} Summary of all payouts
   */
  async initiateBulkPayout(cooperativeId) {
    const farmers = await FarmerService.listFarmersByCooperative(cooperativeId);
    const results = [];
    const errors = [];

    for (const farmer of farmers) {
      if (farmer.status !== 'ACTIVE') continue;
      try {
        const result = await this.initiateFarmerPayout({
          farmerId: farmer.farmerId,
          cooperativeId,
        });
        results.push(result);
      } catch (err) {
        // Skip farmers with no unpaid produce (expected) or other individual errors
        errors.push({
          farmerId: farmer.farmerId,
          farmerName: farmer.fullName,
          error: err.message,
        });
      }
    }

    return {
      cooperativeId,
      totalFarmersProcessed: results.length,
      totalFarmersSkipped: errors.length,
      totalGrossAmount: results.reduce((s, r) => s + r.breakdown.grossProduceAmount, 0),
      totalLoanDeductions: results.reduce((s, r) => s + r.breakdown.loanDeductionAmount, 0),
      totalNetPayout: results.reduce((s, r) => s + r.breakdown.netPayoutToFarmer, 0),
      payouts: results.map((r) => r.payout),
      skipped: errors,
    };
  }

  /**
   * Get payout by ID.
   */
  async getPayoutById(payoutId) {
    if (!isFirebaseReady()) {
      const payout = demo.getPayout(payoutId);
      if (!payout) {
        const err = new Error('Payout not found.');
        err.statusCode = 404;
        throw err;
      }
      return payout;
    }
    const docSnap = await getDoc(doc(db, PAYOUTS_COLLECTION, payoutId));
    if (!docSnap.exists()) {
      const err = new Error('Payout not found.');
      err.statusCode = 404;
      throw err;
    }
    return docSnap.data();
  }

  /**
   * Get payouts for a farmer.
   */
  async getPayoutsByFarmer(farmerId) {
    if (!isFirebaseReady()) {
      return demo.listPayouts(farmerId);
    }
    const snapshot = await getDocs(
      query(
        collection(db, PAYOUTS_COLLECTION),
        where('farmerId', '==', farmerId),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Handle LOOP webhook callback — update payout status.
   *
   * @param {object} payload - Raw webhook payload from LOOP
   */
  async handleLoopCallback(payload) {
    const parsed = LoopAdapter.parseWebhookPayload(payload);

    if (!parsed.transactionRef) {
      const err = new Error('Missing transaction reference in webhook payload.');
      err.statusCode = 400;
      throw err;
    }

    if (!isFirebaseReady()) {
      const newStatus = parsed.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
      const payout = demo.updatePayoutByLoopRef(parsed.transactionRef, newStatus);
      if (!payout) {
        console.warn(`⚠️ No payout found for LOOP ref: ${parsed.transactionRef}`);
        return { acknowledged: true, found: false };
      }
      return {
        acknowledged: true,
        found: true,
        payoutId: payout.payoutId,
        newStatus,
      };
    }

    // Find payout by LOOP transaction ref
    const snapshot = await getDocs(
      query(
        collection(db, PAYOUTS_COLLECTION),
        where('loopTransactionRef', '==', parsed.transactionRef),
        limit(1)
      )
    );

    if (snapshot.empty) {
      console.warn(`⚠️ No payout found for LOOP ref: ${parsed.transactionRef}`);
      return { acknowledged: true, found: false };
    }

    const payoutDoc = snapshot.docs[0];
    const newStatus = parsed.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED';

    await updateDoc(doc(db, PAYOUTS_COLLECTION, payoutDoc.data().payoutId), { status: newStatus });

    return {
      acknowledged: true,
      found: true,
      payoutId: payoutDoc.data().payoutId,
      newStatus,
    };
  }
}

export default new PayoutService();
