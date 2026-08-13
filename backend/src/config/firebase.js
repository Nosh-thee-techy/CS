import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import env from './env.js';

/**
 * Initialize Firebase Admin SDK.
 *
 * Supports two modes:
 *   1. Service account JSON key file (FIREBASE_SERVICE_ACCOUNT_PATH)
 *   2. Inline credentials via environment variables
 */
function initializeFirebase() {
  // Avoid re-initializing if already done
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  let credential;

  // Option A: Service account key file
  if (env.FIREBASE_SERVICE_ACCOUNT_PATH && existsSync(env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = JSON.parse(
      readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
    credential = admin.credential.cert(serviceAccount);
    console.log('🔥 Firebase initialized with service account key file.');
  }
  // Option B: Inline environment variables
  else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    });
    console.log('🔥 Firebase initialized with inline credentials.');
  }
  // Fallback: Application Default Credentials (e.g. running on GCP)
  else {
    credential = admin.credential.applicationDefault();
    console.log('🔥 Firebase initialized with application default credentials.');
  }

  admin.initializeApp({ credential });
  return admin.app();
}

initializeFirebase();

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
