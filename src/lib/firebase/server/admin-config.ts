// src/lib/firebaseAdmin.ts
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
const initializeFirebaseAdmin = (): void => {
  if (admin.apps.length) {
    return; // Firebase Admin is already initialized
  }

  // Skip initialization if credentials are not available (e.g., during build)
  if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
    console.warn('Firebase Admin credentials not found. Skipping initialization.');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
    });
  } catch (error) {
    // In production, you might want to crash or alert if this fails.
    console.error('Firebase Admin initialization error:', error);
  }
};

initializeFirebaseAdmin();

const firebaseAdminAuth = admin.apps.length > 0 ? admin.auth() : (null as any);
const firebaseAdminDB = admin.apps.length > 0 ? admin.firestore() : (null as any);

export { firebaseAdminAuth, firebaseAdminDB };
