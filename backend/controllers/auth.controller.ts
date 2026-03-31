/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { isValidEmail, generateUsername } from '../utils/helpers';
import { updateAuraScore } from '../utils/auraScore';
import jwt from 'jsonwebtoken';
import { getSystemSettings } from '../utils/systemConfig';

/**
 * Register a new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, displayName, referredBy } = req.body;

  // 1. Check if registration is globally enabled
  const settings = await getSystemSettings();
  if (!settings.registrationEnabled) {
    throw Errors.Forbidden('User registration is currently disabled by the administrator.');
  }

  // Validation
  if (!email || !password) {
    throw Errors.BadRequest('Email and password are required');
  }

  if (!isValidEmail(email)) {
    throw Errors.BadRequest('Invalid email format');
  }

  if (password.length < 6) {
    throw Errors.BadRequest('Password must be at least 6 characters');
  }

  // Check if user already exists
  try {
    const existingUser = await auth.getUserByEmail(email);
    if (existingUser) {
      throw Errors.Conflict('User with this email already exists');
    }
  } catch (error: any) {
    // User not found is expected, continue
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  // Create user in Firebase Auth
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: displayName || email.split('@')[0],
  });

  // Generate unique username
  const username = generateUsername(displayName || email.split('@')[0]);

  // Create user document in Firestore
  const userData = {
    uid: userRecord.uid,
    email: userRecord.email,
    username,
    displayName: displayName || email.split('@')[0],
    bio: '',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    isAdmin: false,
    subscription: {
      plan: 'free',
      status: 'active',
      expiresAt: null,
    },
    referredBy: referredBy || null,
  };

  await db.collection('users').doc(userRecord.uid).set(userData);

  // 4. Automatically add to newsletter subscribers
  try {
    const emailLower = email.toLowerCase();
    const subQuery = await db.collection('subscribers').where('email', '==', emailLower).get();
    
    if (subQuery.empty) {
      await db.collection('subscribers').add({
        email: emailLower,
        subscribedAt: new Date().toISOString(),
        isActive: true,
        source: 'user_registration'
      });
    }
  } catch (error) {
    console.error('Error auto-subscribing user:', error);
    // Don't fail registration if auto-subscription fails
  }

  // If referredBy exists, record the referral
  if (referredBy) {
    // Find affiliate by referral code
    try {
      const affiliateSnapshot = await db.collection('affiliates')
        .where('referralCode', '==', referredBy)
        .limit(1)
        .get();

      if (!affiliateSnapshot.empty) {
        const affiliateDoc = affiliateSnapshot.docs[0];
        const affiliateId = affiliateDoc.id;

        // Check for self-referral
        if (affiliateId !== userRecord.uid) {
          await db.collection('affiliateReferrals').add({
            affiliateId,
            referredUserId: userRecord.uid,
            createdAt: new Date().toISOString(),
          });

          // Update affiliate signups count
          const currentStats = affiliateDoc.data().stats || {};
          await affiliateDoc.ref.update({
            'stats.signups': (currentStats.signups || 0) + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error tracking referral:', error);
      // Don't fail registration if referral tracking fails
    }
  }

  // Generate JWT token
  const token = jwt.sign(
    { uid: userRecord.uid, email: userRecord.email },
    process.env.JWT_SECRET || 'aura-tree-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      uid: userRecord.uid,
      email: userRecord.email,
      username,
      displayName: userData.displayName,
      token,
    },
  });
});

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw Errors.BadRequest('Email and password are required');
  }

  // Get user by email
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw Errors.Unauthorized('Invalid email or password');
    }
    throw error;
  }

  // Get user data from Firestore
  const userDoc = await db.collection('users').doc(userRecord.uid).get();
  const userData = userDoc.data();

  // Generate JWT token
  const token = jwt.sign(
    { uid: userRecord.uid, email: userRecord.email, isAdmin: userData?.isAdmin || false },
    process.env.JWT_SECRET || 'aura-tree-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      uid: userRecord.uid,
      email: userRecord.email,
      username: userData?.username,
      displayName: userData?.displayName,
      avatarUrl: userData?.avatarUrl,
      isAdmin: userData?.isAdmin || false,
      token,
    },
  });
});

/**
 * Get current user
 * GET /auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  // Update score before returning user data
  await updateAuraScore(userId).catch(console.error);

  // Get user from Firestore
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    throw Errors.NotFound('User not found');
  }

  const userData = userDoc.data();

  res.status(200).json({
    success: true,
    data: {
      uid: userId,
      ...userData,
    },
  });
});

/**
 * Refresh token
 * POST /auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  // Generate new custom token
  const customToken = await auth.createCustomToken(userId);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: customToken,
    },
  });
});

/**
 * Forgot password
 * POST /auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw Errors.BadRequest('Email is required');
  }

  // Generate password reset link
  const resetLink = await auth.generatePasswordResetLink(email);

  // In production, send this link via email
  // For now, just return success

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
  });
});

/**
 * Verify email
 * POST /auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw Errors.BadRequest('Email is required');
  }

  // Generate email verification link
  const verificationLink = await auth.generateEmailVerificationLink(email);

  // In production, send this link via email
  // For now, just return success

  res.status(200).json({
    success: true,
    message: 'Verification email sent',
  });
});

/**
 * Logout user (client-side token deletion)
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (userId) {
    // Revoke refresh tokens
    await auth.revokeRefreshTokens(userId);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Delete user account
 * DELETE /auth/account
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  // Delete user's Aura Trees
  const auraTreesSnapshot = await db
    .collection('auraTrees')
    .where('userId', '==', userId)
    .get();

  const batch = db.batch();
  auraTreesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Delete user document
  await db.collection('users').doc(userId).delete();

  // Delete Firebase Auth user
  await auth.deleteUser(userId);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

export default {
  register,
  login,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  verifyEmail,
  logout,
  deleteAccount,
};
