/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK using the local service account JSON file
 */

import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = (): void => {
  if (admin.apps.length > 0) {
    return;
  }

  try {
    // 1. ALWAYS try local file first (Best for local dev)
    const localKeyPath = path.resolve(__dirname, '../serviceAccountKey.json');
    const rootKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    
    let serviceAccount = null;
    if (require('fs').existsSync(localKeyPath)) {
      serviceAccount = require(localKeyPath);
    } else if (require('fs').existsSync(rootKeyPath)) {
      serviceAccount = require(rootKeyPath);
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
      });
      console.log('✅ Firebase initialized with local service account file');
      return;
    }

    // 2. Fallback to Environment Variables (Best for Render/Production)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
      
      // Clean wrapping quotes
      privateKey = privateKey.replace(/^['"`]|['"`]$/g, '');
      
      // Fix double-escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Final fallback for literal escaped newlines
      if (!privateKey.includes('\n')) {
        privateKey = privateKey.split('\\n').join('\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
      console.log('✅ Firebase initialized with environment variables');
    } else {
      throw new Error('No Firebase credentials found (env or file)');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
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
