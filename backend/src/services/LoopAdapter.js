import env from '../config/env.js';
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
      transactionRef: payload.reference || payload.refNo || payload.transactionId || null,
      status: payload.status || (payload.code === '200' ? 'COMPLETED' : 'FAILED'),
      amount: payload.amount || 0,
      recipientPhone: payload.phoneNumber || payload.recipientNo || null,
      timestamp: payload.timestamp || new Date().toISOString(),
      rawPayload: payload,
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
