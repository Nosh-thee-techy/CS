import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import env from './env.js';

/**
 * Initialize Firebase using the web client SDK.
 *
 * The backend intentionally uses the modular web client SDK so the
 * service layer can work with Firestore through the shared `db` instance.
 */
function initializeFirebase() {
  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID,
  };

  // Avoid re-initializing if already done.
  if (getApps().length > 0) {
    return getApp();
  }

  try {
    const app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized with the web client SDK.');
    return app;
  } catch (error) {
    throw new Error(
      'Failed to initialize Firebase web client SDK. ' +
        'Set FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, ' +
        'FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, and FIREBASE_MEASUREMENT_ID in backend/.env. ' +
        `Original error: ${error.message}`
    );
  }
}

const app = initializeFirebase();

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
export default app;
