import dotenv from 'dotenv';
dotenv.config();

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Firebase
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || 'AIzaSyD6vrPxdU_VcJ_FlTA_O2QAQYPjbqPYO-0',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || 'limanaloop.firebaseapp.com',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || null,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'limanaloop.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '879163518586',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '1:879163518586:web:30be8ba48a68f2857d55c3',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || 'G-4B5B5CFX26',

  // LOOP / NCBA Sandbox API (Official DevPortal Configuration)
  LOOP_BASE_URL: process.env.LOOP_BASE_URL || 'https://sandbox.loop.co.ke',
  LOOP_TOKEN_URL: process.env.LOOP_TOKEN_URL || 'https://sandbox.loop.co.ke/gateway/auth/1.0/oauth2/token',
  LOOP_CONSUMER_KEY: process.env.LOOP_CONSUMER_KEY || '',
  LOOP_CONSUMER_SECRET: process.env.LOOP_CONSUMER_SECRET || '',
  LOOP_CALLBACK_URL: process.env.LOOP_CALLBACK_URL || '',
  LOOP_REPAYMENT_CALLBACK_URL:
    process.env.LOOP_REPAYMENT_CALLBACK_URL || process.env.LOOP_CALLBACK_URL || '',
  LOOP_MERCHANT_TILL: process.env.LOOP_MERCHANT_TILL || '',
  LOOP_MERCHANT_TILL_SECRET: process.env.LOOP_MERCHANT_TILL_SECRET || '',

  // Loan Recovery
  MAX_LOAN_REPAYMENT_PERCENTAGE: parseFloat(process.env.MAX_LOAN_REPAYMENT_PERCENTAGE) || 100,
};

export default env;
