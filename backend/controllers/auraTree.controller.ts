/**
 * Aura Tree Controller
 * Handles Aura Tree creation, management, and public viewing
 */

import { Request, Response } from 'express';
import { db, fieldValue } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { generateQRCode, getAuraTreeUrl } from '../utils/generateQRCode';
import { generateSlug, isValidSlug } from '../utils/helpers';
import { uploadImage } from '../config/cloudinary';

// Default themes
const DEFAULT_THEMES = {
  cosmic: {
    background: 'linear-gradient(135deg, #070913 0%, #0B1025 50%, #070913 100%)',
    accentColor: '#7B61FF',
    glassOpacity: 0.06,
    font: 'Inter',
  },
  frost: {
    background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0a1628 100%)',
    accentColor: '#00D9FF',
    glassOpacity: 0.08,
    font: 'Inter',
  },
  neon: {
    background: 'linear-gradient(135deg, #1a0a1a 0%, #2d0a2d 50%, #1a0a1a 100%)',
    accentColor: '#FF61DC',
    glassOpacity: 0.05,
    font: 'Outfit',
  },
  midnight: {
    background: 'linear-gradient(135deg, #050508 0%, #0a0a15 50%, #050508 100%)',
    accentColor: '#4F46E5',
    glassOpacity: 0.07,
    font: 'Inter',
  },
};

/**
 * Create a new Aura Tree
 * POST /auratree
 */
export const createAuraTree = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { slug, theme, displayName, bio } = req.body;

  // Check if user already has an Aura Tree
  const existingTree = await db
    .collection('auraTrees')
    .where('userId', '==', userId)
    .get();

  if (!existingTree.empty) {
    throw Errors.Conflict('You already have an Aura Tree. Use PUT to update it.');
  }

  // Get user info to check subscription
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const plan = userData?.subscription?.plan || 'free';

  // Generate or validate slug
  let finalSlug: string;
  
  if (plan === 'free') {
    // Free users get aura- prefix and random string
    const randomStr = Math.random().toString(36).substring(2, 8);
    finalSlug = `aura-${(userData?.username || 'user').substring(0, 10)}-${randomStr}`;
  } else if (slug) {
    if (!isValidSlug(slug)) {
      throw Errors.BadRequest(
        'Slug must be 3-50 characters, lowercase alphanumeric with hyphens only'
      );
    }

    let processedSlug = slug.toLowerCase();

    // TIERED RULE: Pro users MUST have aura- prefix
    if (plan === 'pro' && !processedSlug.startsWith('aura-')) {
      processedSlug = `aura-${processedSlug}`;
    }

    // Check if slug is taken
    const slugCheck = await db
      .collection('auraTrees')
      .where('slug', '==', processedSlug)
      .get();

    if (!slugCheck.empty) {
      throw Errors.Conflict('This slug is already taken');
    }

    finalSlug = processedSlug;
  } else {
    // Default generation for paid users
    const baseSlug = userData?.username || userData?.displayName || 'user';
    finalSlug = plan === 'pro' && !baseSlug.startsWith('aura-') ? `aura-${baseSlug}` : baseSlug;
  }

  // Ensure uniqueness (loop if needed)
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 5) {
    const slugCheck = await db
      .collection('auraTrees')
      .where('slug', '==', finalSlug)
      .get();

    if (slugCheck.empty) {
      isUnique = true;
    } else {
      const randomStr = Math.random().toString(36).substring(2, 5);
      finalSlug = `${finalSlug}-${randomStr}`;
      attempts++;
    }
  }

  // Generate QR Code
  const auraTreeUrl = getAuraTreeUrl(finalSlug);
  const qrCodeResult = await generateQRCode(auraTreeUrl, finalSlug);

  // Create Aura Tree document
  const auraTreeData = {
    userId,
    slug: finalSlug,
    displayName: displayName || '',
    bio: bio || '',
    theme: theme || DEFAULT_THEMES.cosmic,
    qrCodeUrl: qrCodeResult.url,
    qrCodePublicId: qrCodeResult.publicId,
    viewCount: 0,
    clickCount: 0,
    qrScanCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const auraTreeRef = await db.collection('auraTrees').add(auraTreeData);

  // Update user document with auraTreeId
  await db.collection('users').doc(userId).update({
    auraTreeId: auraTreeRef.id,
    auraTreeSlug: finalSlug,
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Aura Tree created successfully',
    data: {
      id: auraTreeRef.id,
      ...auraTreeData,
      publicUrl: auraTreeUrl,
    },
  });
});

/**
 * Get Aura Tree by slug (public)
 * GET /auratree/:slug
 */
export const getAuraTreeBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const auraTreeSnapshot = await db
    .collection('auraTrees')
    .where('slug', '==', slug.toLowerCase())
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (auraTreeSnapshot.empty) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeDoc = auraTreeSnapshot.docs[0];
  const auraTreeData = auraTreeDoc.data();

  // Get user info
  const userDoc = await db.collection('users').doc(auraTreeData.userId).get();
  const userData = userDoc.data();

  // Get links
  const linksSnapshot = await db
    .collection('auraTrees')
    .doc(auraTreeDoc.id)
    .collection('links')
    .where('isVisible', '==', true)
    .orderBy('order', 'asc')
    .get();

  const links = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Get query params for tracking
  const { src } = req.query;

  // Increment counts (async, don't wait)
  const updates: any = {
    viewCount: fieldValue.increment(1),
  };

  if (src === 'qr') {
    updates.qrScanCount = fieldValue.increment(1);
  }

  db.collection('auraTrees')
    .doc(auraTreeDoc.id)
    .update(updates)
    .catch(console.error);

  res.status(200).json({
    success: true,
    data: {
      id: auraTreeDoc.id,
      slug: auraTreeData.slug,
      displayName: auraTreeData.displayName || userData?.displayName,
      bio: auraTreeData.bio || userData?.bio,
      avatarUrl: userData?.avatarUrl,
      theme: auraTreeData.theme,
      qrCodeUrl: auraTreeData.qrCodeUrl,
      links,
      viewCount: auraTreeData.viewCount,
      qrScanCount: auraTreeData.qrScanCount || 0,
    },
  });
});

/**
 * Get user's Aura Tree (private)
 * GET /auratree/me
 */
export const getMyAuraTree = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const auraTreeSnapshot = await db
    .collection('auraTrees')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (auraTreeSnapshot.empty) {
    throw Errors.NotFound('You do not have an Aura Tree yet');
  }

  const auraTreeDoc = auraTreeSnapshot.docs[0];
  const auraTreeData = auraTreeDoc.data();

  // Get all links (including hidden ones)
  const linksSnapshot = await db
    .collection('auraTrees')
    .doc(auraTreeDoc.id)
    .collection('links')
    .orderBy('order', 'asc')
    .get();

  const links = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    success: true,
    data: {
      id: auraTreeDoc.id,
      ...auraTreeData,
      links,
      publicUrl: getAuraTreeUrl(auraTreeData.slug),
    },
  });
});

/**
 * Update Aura Tree
 * PUT /auratree/:id
 */
export const updateAuraTree = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id } = req.params;
  const { displayName, bio, theme, isActive } = req.body;

  // Get user info to check subscription
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const plan = userData?.subscription?.plan || 'free';

  // TIERED RULE: Only paid users can change themes
  if (theme !== undefined && plan === 'free') {
    throw Errors.Forbidden('Theme customization is only available on Pro or Teams plans');
  }

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Build updates
  const updates: any = {
    updatedAt: new Date().toISOString(),
  };

  if (displayName !== undefined) {
    updates.displayName = displayName.substring(0, 100);
  }

  if (bio !== undefined) {
    updates.bio = bio.substring(0, 500);
  }

  if (theme !== undefined) {
    updates.theme = { ...auraTreeData.theme, ...theme };
  }

  if (isActive !== undefined) {
    updates.isActive = isActive;
  }

  await db.collection('auraTrees').doc(id).update(updates);

  res.status(200).json({
    success: true,
    message: 'Aura Tree updated successfully',
    data: {
      id,
      ...auraTreeData,
      ...updates,
    },
  });
});

/**
 * Update Aura Tree slug
 * PUT /auratree/:id/slug
 */
export const updateSlug = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  // Get user info to check subscription
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const plan = userData?.subscription?.plan || 'free';

  if (plan === 'free') {
    throw Errors.Forbidden('Custom links are only available on Pro or Teams plans');
  }

  const { id } = req.params;
  let { slug } = req.body;

  if (!slug) {
    throw Errors.BadRequest('Slug is required');
  }

  let processedSlug = slug.toLowerCase();

  // TIERED RULE: Pro users MUST have aura- prefix
  if (plan === 'pro' && !processedSlug.startsWith('aura-')) {
    processedSlug = `aura-${processedSlug}`;
  }

  // Double check availability for processedSlug
  const slugCheck = await db
    .collection('auraTrees')
    .where('slug', '==', processedSlug)
    .get();

  if (!slugCheck.empty) {
    const existingDoc = slugCheck.docs[0];
    if (existingDoc.id !== id) {
      throw Errors.Conflict('This slug is already taken');
    }
  }

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Generate new QR Code
  const newUrl = getAuraTreeUrl(processedSlug);
  const qrCodeResult = await generateQRCode(newUrl, processedSlug);

  // Delete old QR Code
  if (auraTreeData?.qrCodePublicId) {
    const { deleteQRCode } = await import('../utils/generateQRCode');
    await deleteQRCode(auraTreeData.qrCodePublicId);
  }

  // Update Aura Tree
  await db.collection('auraTrees').doc(id).update({
    slug: processedSlug,
    qrCodeUrl: qrCodeResult.url,
    qrCodePublicId: qrCodeResult.publicId,
    updatedAt: new Date().toISOString(),
  });

  // Update user document
  await db.collection('users').doc(userId).update({
    auraTreeSlug: processedSlug,
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Slug updated successfully',
    data: {
      slug: processedSlug,
      publicUrl: newUrl,
      qrCodeUrl: qrCodeResult.url,
    },
  });
});

/**
 * Upload background image
 * POST /auratree/:id/background
 */
export const uploadBackground = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id } = req.params;

  // Get user info to check subscription
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const plan = userData?.subscription?.plan || 'free';

  if (plan === 'free') {
    throw Errors.Forbidden('Custom backgrounds are only available on Pro or Teams plans');
  }

  if (!req.file) {
    throw Errors.BadRequest('No image file provided');
  }

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Delete old background if exists
  if (auraTreeData?.backgroundPublicId) {
    const { deleteImage } = await import('../config/cloudinary');
    await deleteImage(auraTreeData.backgroundPublicId);
  }

  // Upload new background
  const uploadResult = await uploadImage(req.file.buffer, {
    folder: 'aura_tree/backgrounds',
    publicId: `background-${id}`,
  });

  // Update Aura Tree
  await db.collection('auraTrees').doc(id).update({
    'theme.background': uploadResult.secure_url,
    backgroundPublicId: uploadResult.public_id,
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Background uploaded successfully',
    data: {
      backgroundUrl: uploadResult.secure_url,
    },
  });
});

/**
 * Delete Aura Tree
 * DELETE /auratree/:id
 */
export const deleteAuraTree = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id } = req.params;

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Delete QR Code from Cloudinary
  if (auraTreeData?.qrCodePublicId) {
    const { deleteQRCode } = await import('../utils/generateQRCode');
    await deleteQRCode(auraTreeData.qrCodePublicId);
  }

  // Delete background from Cloudinary if exists
  if (auraTreeData?.backgroundPublicId) {
    const { deleteImage } = await import('../config/cloudinary');
    await deleteImage(auraTreeData.backgroundPublicId);
  }

  // Delete all links
  const linksSnapshot = await db
    .collection('auraTrees')
    .doc(id)
    .collection('links')
    .get();

  const batch = db.batch();
  linksSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Delete Aura Tree document
  await db.collection('auraTrees').doc(id).delete();

  // Update user document
  await db.collection('users').doc(userId).update({
    auraTreeId: '',
    auraTreeSlug: '',
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Aura Tree deleted successfully',
  });
});

/**
 * Get Aura Tree analytics
 * GET /auratree/:id/analytics
 */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id } = req.params;

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Get link click counts
  const linksSnapshot = await db
    .collection('auraTrees')
    .doc(id)
    .collection('links')
    .get();

  const linkStats = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    clickCount: doc.data().clickCount || 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      viewCount: auraTreeData?.viewCount || 0,
      clickCount: auraTreeData?.clickCount || 0,
      qrScanCount: auraTreeData?.qrScanCount || 0,
      links: linkStats,
    },
  });
});

/**
 * Track QR scan and redirect
 * GET /qr/:slug
 */
export const trackQRScan = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  // Find the Aura Tree with this slug
  const auraTreeSnapshot = await db
    .collection('auraTrees')
    .where('slug', '==', slug.toLowerCase())
    .limit(1)
    .get();

  if (auraTreeSnapshot.empty) {
    // If not found, just redirect to home
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }

  const auraTreeDoc = auraTreeSnapshot.docs[0];
  const auraTreeData = auraTreeDoc.data();

  // Increment QR scan count (async, don't wait for write to finish for speed)
  db.collection('auraTrees')
    .doc(auraTreeDoc.id)
    .update({
      qrScanCount: fieldValue.increment(1),
    })
    .catch(console.error);

  // Redirect to the public page
  const targetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${slug.toLowerCase()}`;
  res.redirect(targetUrl);
});

export default {
  createAuraTree,
  getAuraTreeBySlug,
  getMyAuraTree,
  updateAuraTree,
  updateSlug,
  uploadBackground,
  deleteAuraTree,
  getAnalytics,
  trackQRScan,
};
