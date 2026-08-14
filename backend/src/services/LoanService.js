import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import CreditEngineService from './CreditEngineService.js';
import LoopAdapter from './LoopAdapter.js';
import FarmerService from './FarmerService.js';
import env from '../config/env.js';

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

    await setDoc(doc(db, LOANS_COLLECTION, loanId), loan);
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
    const docRef = doc(db, LOANS_COLLECTION, loanId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const err = new Error('Loan not found.');
      err.statusCode = 404;
      throw err;
    }

    const loan = docSnap.data();

    if (loan.status !== 'PENDING') {
      const err = new Error(`Loan is already ${loan.status}. Only PENDING loans can be processed.`);
      err.statusCode = 400;
      throw err;
    }

    if (action === 'REJECT') {
      await updateDoc(docRef, { status: 'REJECTED' });
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

      await updateDoc(docRef, updatedLoan);
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
    const docSnap = await getDoc(doc(db, LOANS_COLLECTION, loanId));
    if (!docSnap.exists()) {
      const err = new Error('Loan not found.');
      err.statusCode = 404;
      throw err;
    }
    return docSnap.data();
  }

  /**
   * Get all loans for a farmer.
   */
  async getLoansByFarmer(farmerId) {
    const snapshot = await getDocs(
      query(
        collection(db, LOANS_COLLECTION),
        where('farmerId', '==', farmerId),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get all loans for a cooperative.
   */
  async getLoansByCooperative(cooperativeId) {
    const snapshot = await getDocs(
      query(
        collection(db, LOANS_COLLECTION),
        where('cooperativeId', '==', cooperativeId),
        orderBy('createdAt', 'desc')
      )
    );
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
    const docRef = doc(db, LOANS_COLLECTION, loanId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const loan = docSnap.data();
    const newBalance = parseFloat(Math.max(0, loan.outstandingBalance - amount).toFixed(2));
    const updates = { outstandingBalance: newBalance };

    if (newBalance === 0) {
      updates.status = 'REPAID';
    }

    await updateDoc(docRef, updates);
    return { ...loan, ...updates };
  }

  /**
   * Get active (disbursed, non-repaid) loans for a farmer.
   */
  async _getActiveLoans(farmerId) {
    const snapshot = await getDocs(
      query(
        collection(db, LOANS_COLLECTION),
        where('farmerId', '==', farmerId),
        where('status', '==', 'DISBURSED')
      )
    );
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

  /**
   * Trigger a LOOP repayment prompt for a specific loan.
   * Defaults to the farmer's phone number, current outstanding balance,
   * configured merchant till, and repayment callback URL.
   */
  async promptRepaymentForLoan(
    loanId,
    {
      mobileNo = null,
      amount = null,
      reason = null,
      merchantTill = null,
      callBackUrl = null,
      txnReference = null,
    } = {}
  ) {
    const docRef = doc(db, LOANS_COLLECTION, loanId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const err = new Error('Loan not found.');
      err.statusCode = 404;
      throw err;
    }

    const loan = docSnap.data();
    const farmer = mobileNo ? { phoneNumber: mobileNo } : await FarmerService.getFarmerById(loan.farmerId);
    const promptAmount = Number(amount ?? loan.outstandingBalance ?? loan.requestedAmount ?? 0);

    if (!Number.isFinite(promptAmount) || promptAmount <= 0) {
      const err = new Error('Repayment prompt amount must be greater than zero.');
      err.statusCode = 400;
      throw err;
    }

    const promptReason =
      reason ||
      `Loan repayment for loan ${loan.loanId} at cooperative ${loan.cooperativeId}`;

    const result = await LoopAdapter.promptLoanRepayment({
      merchantTill: merchantTill || env.LOOP_MERCHANT_TILL,
      mobileNo: farmer.phoneNumber,
      amount: promptAmount,
      reason: promptReason,
      callBackUrl: callBackUrl || env.LOOP_REPAYMENT_CALLBACK_URL || env.LOOP_CALLBACK_URL,
      txnReference,
    });

    const promptRecord = {
      repaymentPromptTxnReference: result.txnReference,
      repaymentPromptMerchantTill: merchantTill || env.LOOP_MERCHANT_TILL,
      repaymentPromptMobileNo: farmer.phoneNumber,
      repaymentPromptAmount: promptAmount,
      repaymentPromptReason: promptReason,
      repaymentPromptStatus: result.success ? 'REQUESTED' : 'FAILED',
      repaymentPromptRequestedAt: new Date().toISOString(),
      repaymentPromptLastResponse: result.rawResponse,
    };

    await updateDoc(docRef, promptRecord);

    return {
      loanId,
      prompt: promptRecord,
      loopResult: result,
    };
  }

  /**
   * Handle the asynchronous LOOP callback for a repayment prompt.
   * Marks the prompt completed/failed and reduces the outstanding balance
   * when a successful payment confirmation is received.
   */
  async handleRepaymentPromptCallback(payload) {
    const parsed = LoopAdapter.parseRepaymentPromptCallback(payload);

    if (!parsed.txnReference) {
      const err = new Error('Missing transaction reference in LOOP repayment callback.');
      err.statusCode = 400;
      throw err;
    }

    const snapshot = await getDocs(
      query(
        collection(db, LOANS_COLLECTION),
        where('repaymentPromptTxnReference', '==', parsed.txnReference),
        limit(1)
      )
    );

    if (snapshot.empty) {
      return { acknowledged: true, found: false };
    }

    const loanDoc = snapshot.docs[0];
    const loan = loanDoc.data();
    const docRef = doc(db, LOANS_COLLECTION, loan.loanId);

    if (
      loan.repaymentPromptStatus === 'COMPLETED' &&
      loan.repaymentPromptCallbackTxnReference === parsed.txnReference
    ) {
      return {
        acknowledged: true,
        found: true,
        loanId: loan.loanId,
        alreadyProcessed: true,
      };
    }

    const completedAt = new Date().toISOString();
    const updates = {
      repaymentPromptStatus: parsed.isSuccess ? 'COMPLETED' : 'FAILED',
      repaymentPromptCallbackTxnReference: parsed.txnReference,
      repaymentPromptCallbackReceivedAt: completedAt,
      repaymentPromptCallbackPayload: parsed.rawPayload,
      repaymentPromptCallbackMessage: parsed.message,
    };

    await updateDoc(docRef, updates);

    if (parsed.isSuccess) {
      const repaymentAmount =
        parsed.amount > 0 ? parsed.amount : loan.repaymentPromptAmount || loan.outstandingBalance || 0;

      if (repaymentAmount > 0) {
        await this.reduceOutstandingBalance(loan.loanId, repaymentAmount);
      }
    }

    return {
      acknowledged: true,
      found: true,
      loanId: loan.loanId,
      repaymentStatus: updates.repaymentPromptStatus,
      transactionRef: parsed.txnReference,
    };
  }
}

export default new LoanService();
