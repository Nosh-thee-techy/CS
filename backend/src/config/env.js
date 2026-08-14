import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Firebase Client SDK (web config — not a service account)
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || 'AIzaSyD6vrPxdU_VcJ_FlTA_O2QAQYPjbqPYO-0',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || 'limanaloop.firebaseapp.com',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || null,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'limanaloop.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '879163518586',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '1:879163518586:web:30be8ba48a68f2857d55c3',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || 'G-4B5B5CFX26',
  FIREBASE_AUTH_EMAIL: process.env.FIREBASE_AUTH_EMAIL || null,
  FIREBASE_AUTH_PASSWORD: process.env.FIREBASE_AUTH_PASSWORD || null,

  // Africa's Talking sandbox (USSD + SMS + Voice)
  AT_USERNAME: process.env.AT_USERNAME || 'sandbox',
  AT_API_KEY: process.env.AT_API_KEY || '',
  AT_SHORT_CODE: process.env.AT_SHORT_CODE || process.env.AT_SERVICE_CODE || '',
  AT_SMS_FROM: process.env.AT_SMS_FROM || process.env.AT_SMS_SHORTCODE || '',
  AT_CALLBACK_SECRET: process.env.AT_CALLBACK_SECRET || '',
  AT_VOICE_NUMBER: process.env.AT_VOICE_NUMBER || '',
  AT_PUBLIC_BASE_URL: process.env.AT_PUBLIC_BASE_URL || '',

  // LOOP / NCBA Sandbox API (Official DevPortal Configuration)
  LOOP_BASE_URL: process.env.LOOP_BASE_URL || 'https://sandbox.loop.co.ke',
  LOOP_TOKEN_URL: process.env.LOOP_TOKEN_URL || 'https://sandbox.loop.co.ke/gateway/auth/1.0/oauth2/token',
  LOOP_CONSUMER_KEY: process.env.LOOP_CONSUMER_KEY || '',
  LOOP_CONSUMER_SECRET: process.env.LOOP_CONSUMER_SECRET || '',
  LOOP_CALLBACK_URL: process.env.LOOP_CALLBACK_URL || 'https://cs-fork.onrender.com/api/payouts/loop-callback',
  LOOP_REPAYMENT_CALLBACK_URL:
    process.env.LOOP_REPAYMENT_CALLBACK_URL
    || process.env.LOOP_CALLBACK_URL
    || 'https://cs-fork.onrender.com/api/loans/loop-repayment-callback',
  LOOP_MERCHANT_TILL: process.env.LOOP_MERCHANT_TILL || '',
  LOOP_MERCHANT_TILL_SECRET: process.env.LOOP_MERCHANT_TILL_SECRET || '',

  // Loan Recovery
  MAX_LOAN_REPAYMENT_PERCENTAGE: parseFloat(process.env.MAX_LOAN_REPAYMENT_PERCENTAGE) || 100,
};

export default env;
