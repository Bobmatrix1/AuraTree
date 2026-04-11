/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK using the local service account JSON file
 */

import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = (): void => {
  if (admin.apps.length > 0) {
    return;
  }

  try {
    // Check for environment variables (Production/Render)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      // Robust PEM formatting fix
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Remove extra quotes if they exist at start/end
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      
      // Fix newline characters
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
      console.log('✅ Firebase initialized with environment variables');
    } 
    else {
      // Fallback to local JSON file
      try {
        const serviceAccount = require('../serviceAccountKey.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'aura-tree.firebasestorage.app',
        });
        console.log('✅ Firebase initialized with service account JSON file');
      } catch (fileError) {
        throw new Error('No Firebase credentials found (env or file)');
      }
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Absolute final fallback
    if (admin.apps.length === 0) {
      admin.initializeApp();
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
