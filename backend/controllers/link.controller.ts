/**
 * Link Controller
 * Handles link creation, management, and reordering
 */

import { Request, Response } from 'express';
import { db, fieldValue } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { detectPlatform, extractTitleFromUrl, isValidUrl } from '../utils/detectPlatform';
import { getSystemSettings } from '../utils/systemConfig';

/**
 * Add a new link to Aura Tree
 * POST /auratree/:id/links
 */
export const addLink = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id: auraTreeId } = req.params;
  const { url, title, customTitle, platform, order } = req.body;

  // Validate URL
  if (!url) {
    throw Errors.BadRequest('URL is required');
  }

  if (!isValidUrl(url)) {
    throw Errors.BadRequest('Invalid URL format');
  }

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Get user info to check subscription
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const plan = userData?.subscription?.plan || 'free';

  // TIERED RULE: Free users limit (Now dynamic from System Settings)
  if (plan === 'free') {
    const settings = await getSystemSettings();
    const linksSnapshot = await db
      .collection('auraTrees')
      .doc(auraTreeId)
      .collection('links')
      .count()
      .get();
    
    if (linksSnapshot.data().count >= settings.maxLinksPerFreeUser) {
      throw Errors.Forbidden(`Free plan is limited to ${settings.maxLinksPerFreeUser} links. Upgrade to Pro for unlimited links!`);
    }
  }

  // Detect platform
  const detectedPlatform = platform
    ? { name: platform, icon: platform, label: platform, color: '#7B61FF', domain: '' }
    : detectPlatform(url);

  // Generate title
  const linkTitle = customTitle || title || extractTitleFromUrl(url, detectedPlatform.name);

  // Get current max order
  const linksSnapshot = await db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  const maxOrder = linksSnapshot.empty ? 0 : linksSnapshot.docs[0].data().order;

  // Create link document
  const linkData = {
    url: url.startsWith('http') ? url : `https://${url}`,
    title: linkTitle,
    platform: detectedPlatform.name,
    icon: detectedPlatform.icon,
    label: detectedPlatform.label,
    color: detectedPlatform.color,
    order: order !== undefined ? order : maxOrder + 1,
    isVisible: true,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const linkRef = await db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .add(linkData);

  // Update Aura Tree
  await db.collection('auraTrees').doc(auraTreeId).update({
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Link added successfully',
    data: {
      id: linkRef.id,
      ...linkData,
    },
  });
});

/**
 * Get all links for an Aura Tree
 * GET /auratree/:id/links
 */
export const getLinks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id: auraTreeId } = req.params;

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check if user owns this Aura Tree or if it's public
  const isOwner = userId === auraTreeData?.userId;

  // Build query
  let query = db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .orderBy('order', 'asc');

  // Only show visible links for non-owners
  if (!isOwner) {
    query = query.where('isVisible', '==', true);
  }

  const linksSnapshot = await query.get();

  const links = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    success: true,
    data: links,
  });
});

/**
 * Update a link
 * PUT /links/:id
 */
export const updateLink = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id: linkId } = req.params;
  const { auraTreeId } = req.body;
  const { url, title, isVisible, platform, color } = req.body;

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Get link
  const linkDoc = await db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .doc(linkId)
    .get();

  if (!linkDoc.exists) {
    throw Errors.NotFound('Link not found');
  }

  // Build updates
  const updates: any = {
    updatedAt: new Date().toISOString(),
  };

  if (url !== undefined) {
    if (!isValidUrl(url)) {
      throw Errors.BadRequest('Invalid URL format');
    }
    updates.url = url.startsWith('http') ? url : `https://${url}`;

    // Re-detect platform if URL changed
    const detectedPlatform = detectPlatform(url);
    updates.platform = detectedPlatform.name;
    updates.icon = detectedPlatform.icon;
    updates.label = detectedPlatform.label;
    updates.color = detectedPlatform.color;
  }

  if (title !== undefined) {
    updates.title = title.substring(0, 200);
  }

  if (isVisible !== undefined) {
    updates.isVisible = isVisible;
  }

  if (platform !== undefined) {
    updates.platform = platform;
  }

  if (color !== undefined) {
    updates.color = color;
  }

  await db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .doc(linkId)
    .update(updates);

  // Update Aura Tree
  await db.collection('auraTrees').doc(auraTreeId).update({
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Link updated successfully',
    data: {
      id: linkId,
      ...updates,
    },
  });
});

/**
 * Delete a link
 * DELETE /links/:id
 */
export const deleteLink = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { id: linkId } = req.params;
  const { auraTreeId } = req.body;

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Delete link
  await db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .doc(linkId)
    .delete();

  // Update Aura Tree
  await db.collection('auraTrees').doc(auraTreeId).update({
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Link deleted successfully',
  });
});

/**
 * Reorder links
 * PATCH /links/reorder
 */
export const reorderLinks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { auraTreeId, linkOrders } = req.body;

  if (!auraTreeId || !Array.isArray(linkOrders)) {
    throw Errors.BadRequest('Aura Tree ID and link orders array are required');
  }

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('You do not own this Aura Tree');
  }

  // Update each link's order
  const batch = db.batch();

  for (const { linkId, order } of linkOrders) {
    const linkRef = db
      .collection('auraTrees')
      .doc(auraTreeId)
      .collection('links')
      .doc(linkId);

    batch.update(linkRef, {
      order,
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();

  // Update Aura Tree
  await db.collection('auraTrees').doc(auraTreeId).update({
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Links reordered successfully',
  });
});

/**
 * Track link click (public)
 * POST /links/:id/click
 */
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const { id: linkId } = req.params;
  const { auraTreeId } = req.body;

  // Get link
  const linkDoc = await db
    .collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .doc(linkId)
    .get();

  if (!linkDoc.exists) {
    throw Errors.NotFound('Link not found');
  }

  const linkData = linkDoc.data();

  // Check if link is visible
  if (!linkData?.isVisible) {
    throw Errors.NotFound('Link not found');
  }

  // Increment click count (async, don't wait)
  db.collection('auraTrees')
    .doc(auraTreeId)
    .collection('links')
    .doc(linkId)
    .update({
      clickCount: fieldValue.increment(1),
    })
    .catch(console.error);

  // Increment Aura Tree click count
  db.collection('auraTrees')
    .doc(auraTreeId)
    .update({
      clickCount: fieldValue.increment(1),
    })
    .catch(console.error);

  res.status(200).json({
    success: true,
    data: {
      url: linkData.url,
    },
  });
});

/**
 * Detect platform from URL (utility endpoint)
 * POST /links/detect-platform
 */
export const detectPlatformEndpoint = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    throw Errors.BadRequest('URL is required');
  }

  const platformInfo = detectPlatform(url);
  const suggestedTitle = extractTitleFromUrl(url, platformInfo.name);

  res.status(200).json({
    success: true,
    data: {
      platform: platformInfo,
      suggestedTitle,
    },
  });
});

export default {
  addLink,
  getLinks,
  updateLink,
  deleteLink,
  reorderLinks,
  trackClick,
  detectPlatformEndpoint,
};
