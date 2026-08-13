import dotenv from 'dotenv';
dotenv.config();

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || null,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || null,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || null,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null,

  // LOOP / NCBA Sandbox API (Official DevPortal Configuration)
  LOOP_BASE_URL: process.env.LOOP_BASE_URL || 'https://sandbox.loop.co.ke',
  LOOP_TOKEN_URL: process.env.LOOP_TOKEN_URL || 'https://sandbox.loop.co.ke/gateway/auth/1.0/oauth2/token',
  LOOP_CONSUMER_KEY: process.env.LOOP_CONSUMER_KEY || '',
  LOOP_CONSUMER_SECRET: process.env.LOOP_CONSUMER_SECRET || '',
  LOOP_CALLBACK_URL: process.env.LOOP_CALLBACK_URL || '',

  // Loan Recovery
  MAX_LOAN_REPAYMENT_PERCENTAGE: parseFloat(process.env.MAX_LOAN_REPAYMENT_PERCENTAGE) || 100,
};

export default env;
