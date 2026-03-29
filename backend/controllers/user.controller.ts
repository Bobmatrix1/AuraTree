/**
 * User Controller
 * Handles user profile management
 */

import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { uploadImage, deleteImage, getAvatarUrl } from '../config/cloudinary';
import { isValidUsername, sanitizeString } from '../utils/helpers';
import { updateAuraScore } from '../utils/auraScore';

/**
 * Get current user profile
 * GET /user/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    throw Errors.NotFound('User not found');
  }

  const userData = userDoc.data();

  // Get user's Aura Tree
  const auraTreeSnapshot = await db
    .collection('auraTrees')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const auraTree = auraTreeSnapshot.empty
    ? null
    : {
        id: auraTreeSnapshot.docs[0].id,
        ...auraTreeSnapshot.docs[0].data(),
      };

  res.status(200).json({
    success: true,
    data: {
      ...userData,
      auraTree,
    },
  });
});

/**
 * Update user profile
 * PUT /user/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { displayName, bio, username } = req.body;

  // Validate username if provided
  if (username) {
    if (!isValidUsername(username)) {
      throw Errors.BadRequest(
        'Username must be 3-30 characters, alphanumeric with underscores only'
      );
    }

    // Check if username is already taken
    const existingUser = await db
      .collection('users')
      .where('username', '==', username.toLowerCase())
      .get();

    if (!existingUser.empty) {
      const existingUserId = existingUser.docs[0].id;
      if (existingUserId !== userId) {
        throw Errors.Conflict('Username is already taken');
      }
    }
  }

  // Build update object
  const updates: any = {
    updatedAt: new Date().toISOString(),
  };

  if (displayName !== undefined) {
    updates.displayName = sanitizeString(displayName).substring(0, 50);
  }

  if (bio !== undefined) {
    updates.bio = sanitizeString(bio).substring(0, 500);
  }

  if (username !== undefined) {
    updates.username = username.toLowerCase();
  }

  // Update Firestore document
  await db.collection('users').doc(userId).update(updates);

  // Update Firebase Auth display name if changed
  if (displayName) {
    await auth.updateUser(userId, {
      displayName: updates.displayName,
    });
  }

  // Update Aura Score
  const scoreTargetId = (req.body.auraTreeId || (await db.collection('users').doc(userId).get()).data()?.auraTreeId);
  if (scoreTargetId) {
    await updateAuraScore(scoreTargetId).catch(console.error);
  }

  // Get updated user data
  const userDoc = await db.collection('users').doc(userId).get();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: userDoc.data(),
  });
});

/**
 * Upload avatar
 * POST /user/avatar
 */
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { auraTreeId } = req.body;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  if (!req.file) {
    throw Errors.BadRequest('No image file provided');
  }

  // 1. Determine Public ID based on context
  // If auraTreeId is provided, it's a page-specific avatar
  const publicId = auraTreeId ? `avatar-${auraTreeId}` : `avatar-${userId}`;
  const folder = auraTreeId ? 'aura_tree/pages' : 'aura_tree/avatars';

  // Upload to Cloudinary
  const uploadResult = await uploadImage(req.file.buffer, {
    folder,
    publicId,
    transformation: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
    },
  });

  const avatarUrl = uploadResult.secure_url;
  const avatarPublicId = uploadResult.public_id;

  // 2. Update specific Aura Tree if ID provided
  if (auraTreeId) {
    const auraTreeRef = db.collection('auraTrees').doc(auraTreeId);
    const auraTreeDoc = await auraTreeRef.get();
    
    if (!auraTreeDoc.exists || auraTreeDoc.data()?.userId !== userId) {
      throw Errors.Forbidden('Invalid Aura Tree ID or access denied');
    }

    await auraTreeRef.update({
      avatarUrl,
      avatarPublicId,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Legacy/Account-level avatar
    await db.collection('users').doc(userId).update({
      avatarUrl,
      avatarPublicId,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth photo URL
    await auth.updateUser(userId, {
      photoURL: avatarUrl,
    });
  }

  // Update Aura Score
  const scoreTargetId = (req.body.auraTreeId || (await db.collection('users').doc(userId).get()).data()?.auraTreeId);
  if (scoreTargetId) {
    await updateAuraScore(scoreTargetId).catch(console.error);
  }

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatarUrl,
    },
  });
});

/**
 * Delete avatar
 * DELETE /user/avatar
 */
export const deleteAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { auraTreeId } = req.body;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  let avatarPublicId = '';

  if (auraTreeId) {
    const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();
    if (auraTreeDoc.exists && auraTreeDoc.data()?.userId === userId) {
      avatarPublicId = auraTreeDoc.data()?.avatarPublicId;
      
      // Update Aura Tree
      await db.collection('auraTrees').doc(auraTreeId).update({
        avatarUrl: '',
        avatarPublicId: '',
        updatedAt: new Date().toISOString(),
      });
    }
  } else {
    const userDoc = await db.collection('users').doc(userId).get();
    avatarPublicId = userDoc.data()?.avatarPublicId;

    // Update user document
    await db.collection('users').doc(userId).update({
      avatarUrl: '',
      avatarPublicId: '',
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth
    try {
      await auth.updateUser(userId, {
        photoURL: null as any,
      });
    } catch (err) {}
  }

  // Delete from Cloudinary if exists
  if (avatarPublicId) {
    try {
      await deleteImage(avatarPublicId);
    } catch (err) {
      console.error('Cloudinary deletion failed:', err);
    }
  }

  // Update Aura Score
  const scoreTargetId = (req.body.auraTreeId || (await db.collection('users').doc(userId).get()).data()?.auraTreeId);
  if (scoreTargetId) {
    await updateAuraScore(scoreTargetId).catch(console.error);
  }

  res.status(200).json({
    success: true,
    message: 'Avatar deleted successfully',
  });
});

/**
 * Change password
 * PUT /user/password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw Errors.BadRequest('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw Errors.BadRequest('New password must be at least 6 characters');
  }

  // Update password in Firebase Auth
  await auth.updateUser(userId, {
    password: newPassword,
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Change email
 * PUT /user/email
 */
export const changeEmail = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { newEmail } = req.body;

  if (!newEmail) {
    throw Errors.BadRequest('New email is required');
  }

  // Check if email is already in use
  try {
    const existingUser = await auth.getUserByEmail(newEmail);
    if (existingUser && existingUser.uid !== userId) {
      throw Errors.Conflict('Email is already in use');
    }
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  // Update email in Firebase Auth
  await auth.updateUser(userId, {
    email: newEmail,
    emailVerified: false,
  });

  // Update Firestore
  await db.collection('users').doc(userId).update({
    email: newEmail,
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Email changed successfully. Please verify your new email.',
  });
});

/**
 * Get user by username (public)
 * GET /user/:username
 */
export const getUserByUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  const userSnapshot = await db
    .collection('users')
    .where('username', '==', username.toLowerCase())
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    throw Errors.NotFound('User not found');
  }

  const userData = userSnapshot.docs[0].data();

  // Return public info only
  res.status(200).json({
    success: true,
    data: {
      username: userData.username,
      displayName: userData.displayName,
      bio: userData.bio,
      avatarUrl: userData.avatarUrl,
    },
  });
});

/**
 * Check username availability
 * GET /user/check-username/:username
 */
export const checkUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!isValidUsername(username)) {
    throw Errors.BadRequest('Invalid username format');
  }

  const userSnapshot = await db
    .collection('users')
    .where('username', '==', username.toLowerCase())
    .get();

  res.status(200).json({
    success: true,
    data: {
      available: userSnapshot.empty,
      username: username.toLowerCase(),
    },
  });
});

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  changeEmail,
  getUserByUsername,
  checkUsername,
};
