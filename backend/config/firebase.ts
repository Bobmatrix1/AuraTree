/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK using the local service account JSON file
 */

import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
// @ts-ignore
import serviceAccount from '../serviceAccountKey.json';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = (): void => {
  if (admin.apps.length > 0) {
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'aura-tree.firebasestorage.app',
    });
    console.log('✅ Firebase initialized with service account JSON file');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Fallback to basic project ID if file fails
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'aura-tree',
      });
    }
  }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services
export const db: Firestore = getFirestore();
export const auth: Auth = getAuth();
export const storage: Storage = getStorage();
export const adminSDK = admin;

// Firestore collection references
export const collections = {
  users: db.collection('users'),
  auraTrees: db.collection('auraTrees'),
  links: (auraTreeId: string) => db.collection('auraTrees').doc(auraTreeId).collection('links'),
  subscriptions: db.collection('subscriptions'),
  payments: db.collection('payments'),
  adminLogs: db.collection('adminLogs'),
  analytics: db.collection('analytics'),
};

// Helper function to create timestamps
export const timestamp = {
  now: () => admin.firestore.Timestamp.now(),
  fromDate: (date: Date) => admin.firestore.Timestamp.fromDate(date),
};

// Helper function for field values
export const fieldValue = admin.firestore.FieldValue;

export default { db, auth, storage, collections, timestamp, fieldValue };
