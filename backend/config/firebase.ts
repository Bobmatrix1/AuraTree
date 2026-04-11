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
    // Check for environment variables (Production/Render)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      // 1. Get raw key and trim whitespace
      let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
      
      // 2. Remove all types of wrapping quotes (", ', or backticks)
      privateKey = privateKey.replace(/^['"`]+|['"`]+$/g, '');
      
      // 3. Handle escaped newlines (\n -> actual newline)
      // We do this twice to handle double-escaped strings common in some CI/CD environments
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\n/g, '\n');
      
      // 4. Ensure it has the correct PEM headers
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}`;
      }
      if (!privateKey.includes('-----END PRIVATE KEY-----')) {
        privateKey = `${privateKey}\n-----END PRIVATE KEY-----\n`;
      }

      // Safe Debug (Log only first/last few chars to avoid exposing key)
      console.log('Firebase Key Check:');
      console.log(`- Start: "${privateKey.substring(0, 25)}..."`);
      console.log(`- End: "...${privateKey.substring(privateKey.length - 25).replace(/\n/g, '\\n')}"`);
      console.log(`- Length: ${privateKey.length} chars`);

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
        // Try multiple paths for deployment flexibility
        const possiblePaths = [
          path.resolve(__dirname, '../serviceAccountKey.json'), // Local dev
          path.resolve(process.cwd(), 'serviceAccountKey.json'), // Render root
          path.resolve(process.cwd(), '../serviceAccountKey.json'), // Render sibling
        ];

        let serviceAccount = null;
        for (const p of possiblePaths) {
          try {
            if (require('fs').existsSync(p)) {
              serviceAccount = require(p);
              console.log(`✅ Firebase credentials found at: ${p}`);
              break;
            }
          } catch (e) {}
        }

        if (!serviceAccount) throw new Error('Key file not found in possible paths');

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
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
