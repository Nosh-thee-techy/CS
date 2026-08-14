import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  inMemoryPersistence,
  setPersistence,
} from 'firebase/auth';
import env from './env.js';

/**
 * Firebase web Client SDK (not Admin / not a service account).
 *
 * Services import the modular `db` from here (`collection(db, …)`).
 * Security rules apply. Optional email/password Auth signs this process in
 * so rules can be `allow read, write: if request.auth != null`.
 */

let app = null;
let db = null;
let auth = null;

function clientConfig() {
  if (!env.FIREBASE_API_KEY || !env.FIREBASE_PROJECT_ID) return null;
  return {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID || undefined,
  };
}

export async function initializeFirebase() {
  if (db) return app;

  const config = clientConfig();
  if (!config) {
    console.warn(
      '🔥 Firebase client SDK not configured (need FIREBASE_API_KEY + FIREBASE_PROJECT_ID). Demo store still answers.',
    );
    return null;
  }

  try {
    app = getApps().length ? getApp() : initializeApp(config);
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      });
    } catch {
      db = getFirestore(app);
    }
    auth = getAuth(app);
    await setPersistence(auth, inMemoryPersistence);

    if (env.FIREBASE_AUTH_EMAIL && env.FIREBASE_AUTH_PASSWORD) {
      await signInWithEmailAndPassword(auth, env.FIREBASE_AUTH_EMAIL, env.FIREBASE_AUTH_PASSWORD);
      console.log(`🔥 Firebase client SDK signed in as ${env.FIREBASE_AUTH_EMAIL}`);
    } else {
      console.warn(
        '🔥 Firebase client SDK is unauthenticated. Rules must allow these reads/writes, or set FIREBASE_AUTH_EMAIL / FIREBASE_AUTH_PASSWORD.',
      );
    }

    console.log(`🔥 Firebase client SDK ready (project ${config.projectId}).`);
    return app;
  } catch (error) {
    console.warn(`🔥 Firebase client SDK init skipped: ${error.message}`);
    app = null;
    db = null;
    auth = null;
    return null;
  }
}

export function isFirebaseReady() {
  return Boolean(db);
}

export { app, db, auth };
export default app;
