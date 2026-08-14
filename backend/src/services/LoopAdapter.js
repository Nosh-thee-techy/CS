import env from '../config/env.js';
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * LoopAdapter
 *
 * Integration module for LOOP / NCBA Sandbox Financial Infrastructure API.
 *
 * Official Authorization Endpoint (from LOOP Dev Portal docs):
 *   POST https://sandbox.loop.co.ke/gateway/auth/1.0/oauth2/token
 *   Headers: Authorization: Basic Base64(CONSUMER_KEY:CONSUMER_SECRET)
 *   Body: grant_type=client_credentials (url-encoded)
 *
 * API Services (from LOOP Dev Portal):
 *   - Send Money M-Pesa: /gateway/send-money-mpesa/1.0
 *   - Send Money Loop:  /gateway/send-money-loop/1.0
 */
class LoopAdapter {
  constructor() {
    this.baseUrl = env.LOOP_BASE_URL; // https://sandbox.loop.co.ke
    this.tokenUrl = env.LOOP_TOKEN_URL; // https://sandbox.loop.co.ke/gateway/auth/1.0/oauth2/token
    this.consumerKey = env.LOOP_CONSUMER_KEY;
    this.consumerSecret = env.LOOP_CONSUMER_SECRET;
    this.callbackUrl = env.LOOP_CALLBACK_URL;
    this.repaymentCallbackUrl = env.LOOP_REPAYMENT_CALLBACK_URL || env.LOOP_CALLBACK_URL;
    this.merchantTill = env.LOOP_MERCHANT_TILL;
    this.merchantTillSecret = env.LOOP_MERCHANT_TILL_SECRET;

    // Token cache
    this._accessToken = null;
    this._tokenExpiresAt = 0;
  }

  // ─── OAuth2 Token Management ──────────────────────────────────────

  /**
   * Get a valid access token using official LOOP devportal credentials flow.
   * Concatenates consumer_key:consumer_secret, base64 encodes it,
   * and sends grant_type=client_credentials to /gateway/auth/1.0/oauth2/token.
   */
  async _getAccessToken() {
    if (this._accessToken && Date.now() < this._tokenExpiresAt - 60000) {
      return this._accessToken;
    }

    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error('LOOP consumer key/secret are not configured.');
    }

    const credentials = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');

    console.log('🔑 [LOOP] Requesting access token from official endpoint...');

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ [LOOP] Token request failed:', response.status, errorBody);
      throw new Error(`LOOP token request failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    this._accessToken = data.access_token;
    this._tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

    console.log(`🔑 [LOOP] Access token acquired successfully. Expires in ${data.expires_in || 3600}s.`);
    return this._accessToken;
  }

  /**
   * Helper to execute API calls against LOOP gateway endpoints.
   */
  async _request(method, path, body = null) {
    const token = await this._getAccessToken();
    const url = `${this.baseUrl}${path}`;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Idempotency-Key': uuidv4(),
    };

    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`📡 [LOOP] ${method} ${url}`);
    const response = await fetch(url, options);
    const responseText = await response.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawText: responseText };
    }

    console.log(`📡 [LOOP] Response status ${response.status}:`, JSON.stringify(responseData).substring(0, 300));

    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
    };
  }

  _formatUtcTimestamp(date = new Date()) {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  _buildPromptSignature(merchantTill, timestamp, nonce) {
    if (!this.merchantTillSecret) {
      throw new Error('LOOP merchant till secret is not configured.');
    }

    return createHmac('sha256', this.merchantTillSecret)
      .update(`${merchantTill}|${timestamp}|${nonce}`)
      .digest('hex');
  }

  _parsePromptResponse(result) {
    const body = result?.data || {};
    const statusCode = Number(body.statusCode ?? result?.status ?? 500);

    return {
      httpStatus: result?.status ?? null,
      statusCode,
      message: body.message || '',
      data: body.data || {},
      rawResponse: body,
      success: statusCode === 200,
    };
  }

  // ─── Public Business Methods ──────────────────────────────────────

  /**
   * Disburse loan funds directly to a farmer's M-Pesa account via LOOP.
   */
  async disburseLoan({ farmerId, phone, amount, loanId }) {
    const formattedPhone = this._formatPhone(phone);
    const refNo = `LOAN-${loanId.substring(0, 8).toUpperCase()}-${Date.now()}`;

    const payload = {
      amount: Number(amount),
      currency: 'KES',
      phoneNumber: formattedPhone,
      recipientNo: formattedPhone,
      reference: refNo,
      refNo: refNo,
      narration: `Loan disbursement ${loanId}`,
      callBackUrl: this.callbackUrl,
    };

    try {
      // Primary gateway path: /gateway/send-money-mpesa/1.0
      const result = await this._request(
        'POST',
        '/gateway/send-money-mpesa/1.0/pay',
        payload
      );

      if (result.ok) {
        return {
          success: true,
          transactionRef: result.data.transactionId || result.data.reference || refNo,
          status: result.data.status || 'PROCESSING',
          message: `Loan of KES ${amount} disbursed to ${formattedPhone} via LOOP.`,
          loopResponse: result.data,
        };
      }

      // If sandbox endpoint is queued/processing or returned mock acknowledgement
      return {
        success: result.status < 500,
        transactionRef: refNo,
        status: result.ok ? 'COMPLETED' : 'PROCESSING',
        message: result.data.message || `Disbursement initiated to ${formattedPhone}.`,
        loopResponse: result.data,
      };
    } catch (error) {
      console.error('❌ [LOOP] Disbursal error:', error.message);
      return {
        success: false,
        transactionRef: refNo,
        status: 'ERROR',
        message: `LOOP connectivity error: ${error.message}`,
        loopResponse: null,
      };
    }
  }

  /**
   * Process produce payout (with loan deduction) directly to a farmer's M-Pesa via LOOP.
   */
  async processPayout({ farmerId, phone, grossAmount, deductionAmount, netAmount, payoutId }) {
    const formattedPhone = this._formatPhone(phone);
    const refNo = `PAY-${payoutId.substring(0, 8).toUpperCase()}-${Date.now()}`;

    const payload = {
      amount: Number(netAmount),
      currency: 'KES',
      phoneNumber: formattedPhone,
      recipientNo: formattedPhone,
      reference: refNo,
      refNo: refNo,
      narration: `Produce Payout (Gross KES ${grossAmount}, Loan Deduction KES ${deductionAmount})`,
      callBackUrl: this.callbackUrl,
    };

    try {
      const result = await this._request(
        'POST',
        '/gateway/send-money-mpesa/1.0/pay',
        payload
      );

      return {
        success: result.status < 500,
        transactionRef: result.data.transactionId || result.data.reference || refNo,
        status: result.ok ? 'COMPLETED' : 'PROCESSING',
        message: `Net payout of KES ${netAmount} initiated to ${formattedPhone}.`,
        loopResponse: result.data,
      };
    } catch (error) {
      console.error('❌ [LOOP] Payout error:', error.message);
      return {
        success: false,
        transactionRef: refNo,
        status: 'ERROR',
        message: `LOOP connectivity error: ${error.message}`,
        loopResponse: null,
      };
    }
  }

  /**
   * Send a LOOP request-to-pay prompt to a farmer for loan repayment.
   */
  async promptLoanRepayment({
    merchantTill = this.merchantTill,
    mobileNo,
    amount,
    reason,
    callBackUrl = this.repaymentCallbackUrl,
    txnReference = uuidv4(),
  }) {
    if (!merchantTill) {
      throw new Error('LOOP merchant till is not configured.');
    }

    if (!mobileNo) {
      throw new Error('mobileNo is required for LOOP repayment prompt.');
    }

    if (!callBackUrl || !/^https:\/\//i.test(callBackUrl)) {
      throw new Error('LOOP repayment prompt callback URL must be an absolute https URL.');
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new Error('Repayment prompt amount must be a number greater than zero.');
    }

    const timestamp = this._formatUtcTimestamp();
    const nonce = uuidv4().toLowerCase();
    const signature = this._buildPromptSignature(String(merchantTill), timestamp, nonce);

    const requestBody = {
      serviceCode: 'NEO_MRCHNT_RTP',
      txnReference,
      requestParameters: {
        merchantTill: String(merchantTill),
        mobileNo: this._formatPhone(mobileNo),
        amount: normalizedAmount.toFixed(2),
        reason: reason || 'Loan repayment prompt',
        callBackUrl,
        timestamp,
        nonce,
        signature,
      },
    };

    const result = await this._request(
      'POST',
      '/gateway/loop-prompt/2/services/process-request',
      requestBody
    );

    const normalized = this._parsePromptResponse(result);

    return {
      txnReference,
      ...normalized,
      requestBody,
    };
  }

  /**
   * Check transaction status on LOOP.
   */
  async getPaymentStatus(transactionRef) {
    try {
      const result = await this._request(
        'GET',
        `/gateway/send-money-mpesa/1.0/status?reference=${transactionRef}`
      );
      return {
        success: result.ok,
        transactionRef,
        status: result.data.status || 'PROCESSING',
        loopResponse: result.data,
      };
    } catch (error) {
      return {
        success: false,
        transactionRef,
        status: 'ERROR',
        message: error.message,
      };
    }
  }

  /**
   * Webhook payload parser for incoming LOOP callbacks.
   */
  parseWebhookPayload(payload) {
    return {
      transactionRef:
        payload.txnReference ||
        payload.reference ||
        payload.refNo ||
        payload.transactionId ||
        null,
      status:
        payload.serviceTransactionStatus ||
        payload.status ||
        (payload.statusCode === 200 || payload.code === '200' ? 'COMPLETED' : 'FAILED'),
      amount: payload.amount || 0,
      recipientPhone: payload.phoneNumber || payload.recipientNo || null,
      timestamp: payload.timestamp || new Date().toISOString(),
      rawPayload: payload,
    };
  }

  /**
   * Parse a LOOP repayment prompt callback payload.
   * Accepts multiple callback shapes so the backend can be resilient
   * to minor gateway payload differences.
   */
  parseRepaymentPromptCallback(payload) {
    const response = payload?.response || payload?.data?.response || {};
    const statusCode = Number(
      payload?.statusCode ??
        payload?.data?.statusCode ??
        payload?.response?.statusCode ??
        response?.statusCode ??
        0
    );
    const serviceTransactionStatus =
      payload?.serviceTransactionStatus ||
      payload?.data?.serviceTransactionStatus ||
      payload?.response?.serviceTransactionStatus ||
      null;
    const txnReference =
      payload?.txnReference ||
      payload?.requestReference ||
      payload?.reference ||
      payload?.transactionRef ||
      payload?.data?.txnReference ||
      response?.transactionRef ||
      null;
    const amount = Number(
      payload?.amount ?? payload?.data?.amount ?? response?.totalAmount ?? 0
    );

    return {
      txnReference,
      statusCode,
      serviceTransactionStatus,
      amount: Number.isFinite(amount) ? amount : 0,
      message: payload?.message || payload?.data?.message || response?.rspMessage || '',
      rawPayload: payload,
      isSuccess:
        statusCode === 200 ||
        serviceTransactionStatus === 'COMPLETED' ||
        response?.rspMessage === 'SUCCESS' ||
        response?.rspCode === '00000000',
    };
  }

  /**
   * Format phone number to 254XXXXXXXXX for Kenyan mobile money.
   */
  _formatPhone(phone) {
    if (!phone) return phone;
    let cleaned = String(phone).replace(/[\s\-\+]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.length === 9 && !cleaned.startsWith('0')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  }
}

export default new LoopAdapter();
