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
import { updateAuraScore } from '../utils/auraScore';

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
  console.log('Creating Aura Tree for user:', userId, 'Body:', req.body);

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { slug, theme, displayName, bio } = req.body;

  // Check limits
  const existingTrees = await db
    .collection('auraTrees')
    .where('userId', '==', userId)
    .get();

  const treeCount = existingTrees.size;

  // Get user info to check subscription
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const plan = userData?.subscription?.plan || 'free';

  if (plan === 'free' && treeCount >= 1) {
    throw Errors.Forbidden('Free users are limited to 1 Aura Tree page. Upgrade to Pro for more!');
  }
  if (plan === 'pro' && treeCount >= 2) {
    throw Errors.Forbidden('Pro users are limited to 2 Aura Tree pages. Upgrade to Teams for unlimited pages!');
  }

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
    avatarUrl: '', // Explicitly empty for new pages
    avatarPublicId: '',
    viewCount: 0,
    clickCount: 0,
    qrScanCount: 0,
    isActive: true,
    teamMembers: [], // Initialize empty team members array
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

  // Update Aura Score
  await updateAuraScore(auraTreeRef.id).catch(console.error);

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
    .get();

  let links = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Sort in memory by order asc
  links.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // 3. Unique Visit Tracking (IP-based)
  const visitorIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipString = Array.isArray(visitorIp) ? visitorIp[0] : (visitorIp || 'unknown');
  const sanitizedIp = ipString.replace(/[^a-zA-Z0-9]/g, '_');
  const visitId = `${auraTreeDoc.id}_${sanitizedIp}`;

  const visitRef = db.collection('unique_visits').doc(visitId);
  const visitDoc = await visitRef.get();

  const updates: any = {};

  if (!visitDoc.exists) {
    // Record the unique visit
    await visitRef.set({
      auraTreeId: auraTreeDoc.id,
      ip: ipString,
      createdAt: new Date().toISOString()
    });

    // Mark for increment
    updates.viewCount = fieldValue.increment(1);
  }

  // Get query params for tracking
  const { src } = req.query;

  if (src === 'qr') {
    const qrVisitId = `qr_${auraTreeDoc.id}_${sanitizedIp}`;
    const qrVisitRef = db.collection('unique_qr_scans').doc(qrVisitId);
    const qrVisitDoc = await qrVisitRef.get();

    if (!qrVisitDoc.exists) {
      await qrVisitRef.set({
        auraTreeId: auraTreeDoc.id,
        ip: ipString,
        createdAt: new Date().toISOString()
      });
      updates.qrScanCount = fieldValue.increment(1);
    }
  }

  // Apply updates if any new unique interaction occurred
  if (Object.keys(updates).length > 0) {
    db.collection('auraTrees')
      .doc(auraTreeDoc.id)
      .update(updates)
      .catch(console.error);

    // Update Aura Score in background
    setTimeout(() => {
      updateAuraScore(auraTreeDoc.id).catch(console.error);
    }, 1000);
  }

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
 * List all user's Aura Trees (including those where user is a team member)
 * GET /auratree/list
 */
export const listMyAuraTrees = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  // Find trees where user is owner
  const ownedSnapshot = await db.collection('auraTrees')
    .where('userId', '==', userId)
    .get();

  // Find trees where user is a team member
  const teamSnapshot = await db.collection('auraTrees')
    .where('teamMembers', 'array-contains', userId)
    .get();

  const ownedTrees = ownedSnapshot.docs.map(doc => ({
    id: doc.id,
    role: 'owner',
    ...doc.data()
  }));

  const teamTrees = teamSnapshot.docs.map(doc => ({
    id: doc.id,
    role: 'member',
    ...doc.data()
  }));

  let trees = [...ownedTrees, ...teamTrees];

  // Sort in memory
  trees.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(200).json({
    success: true,
    data: trees
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

  // First check if user has a primary tree assigned
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const primaryTreeId = userData?.auraTreeId;

  let auraTreeDoc;
  if (primaryTreeId) {
    auraTreeDoc = await db.collection('auraTrees').doc(primaryTreeId).get();
  }

  // If no primary tree or primary tree doesn't exist, fallback to first owned or team tree
  if (!auraTreeDoc || !auraTreeDoc.exists) {
    const auraTreeSnapshot = await db
      .collection('auraTrees')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (auraTreeSnapshot.empty) {
      // Check for team trees
      const teamSnapshot = await db.collection('auraTrees')
        .where('teamMembers', 'array-contains', userId)
        .limit(1)
        .get();
      
      if (teamSnapshot.empty) {
        throw Errors.NotFound('You do not have an Aura Tree yet');
      }
      auraTreeDoc = teamSnapshot.docs[0];
    } else {
      auraTreeDoc = auraTreeSnapshot.docs[0];
    }
  }

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
      publicUrl: getAuraTreeUrl(auraTreeData!.slug),
      role: auraTreeData!.userId === userId ? 'owner' : 'member'
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

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership or team membership
  const isOwner = auraTreeData?.userId === userId;
  const isMember = auraTreeData?.teamMembers?.includes(userId);

  if (!isOwner && !isMember) {
    throw Errors.Forbidden('You do not have access to this Aura Tree');
  }

  // Get owner's plan info
  const ownerDoc = await db.collection('users').doc(auraTreeData!.userId).get();
  const ownerData = ownerDoc.data();
  const plan = ownerData?.subscription?.plan || 'free';

  // TIERED RULE: Only paid users can change themes
  if (theme !== undefined && plan === 'free') {
    throw Errors.Forbidden('Theme customization is only available on Pro or Teams plans');
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
    updates.theme = { ...auraTreeData!.theme, ...theme };
  }

  if (isActive !== undefined) {
    updates.isActive = isActive;
  }

  await db.collection('auraTrees').doc(id).update(updates);

  // Update Aura Score
  await updateAuraScore(id).catch(console.error);

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

  const { id } = req.params;
  let { slug } = req.body;

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership or team membership
  const isOwner = auraTreeData?.userId === userId;
  const isMember = auraTreeData?.teamMembers?.includes(userId);

  if (!isOwner && !isMember) {
    throw Errors.Forbidden('You do not have access to this Aura Tree');
  }

  // Get owner info to check subscription
  const ownerDoc = await db.collection('users').doc(auraTreeData!.userId).get();
  const ownerData = ownerDoc.data();
  const plan = ownerData?.subscription?.plan || 'free';

  if (plan === 'free') {
    throw Errors.Forbidden('Custom links are only available on Pro or Teams plans');
  }

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

  // Update owner's document if this was their primary tree
  if (ownerData?.auraTreeId === id) {
    await db.collection('users').doc(auraTreeData!.userId).update({
      auraTreeSlug: processedSlug,
      updatedAt: new Date().toISOString(),
    });
  }

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

  // Get Aura Tree
  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const auraTreeData = auraTreeDoc.data();

  // Check ownership or team membership
  const isOwner = auraTreeData?.userId === userId;
  const isMember = auraTreeData?.teamMembers?.includes(userId);

  if (!isOwner && !isMember) {
    throw Errors.Forbidden('You do not have access to this Aura Tree');
  }

  // Get owner info to check subscription
  const ownerDoc = await db.collection('users').doc(auraTreeData!.userId).get();
  const ownerData = ownerDoc.data();
  const plan = ownerData?.subscription?.plan || 'free';

  if (plan === 'free') {
    throw Errors.Forbidden('Custom backgrounds are only available on Pro or Teams plans');
  }

  if (!req.file) {
    throw Errors.BadRequest('No image file provided');
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

  // ONLY Owner can delete
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('Only the owner can delete this Aura Tree');
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

  // Update user document if this was their active tree
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (userData?.auraTreeId === id) {
    // Find another tree to set as default if any exist
    const otherTrees = await db.collection('auraTrees')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!otherTrees.empty) {
      const nextTree = otherTrees.docs[0];
      await db.collection('users').doc(userId).update({
        auraTreeId: nextTree.id,
        auraTreeSlug: nextTree.data().slug,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.collection('users').doc(userId).update({
        auraTreeId: '',
        auraTreeSlug: '',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Update Aura Score
  await updateAuraScore(id).catch(console.error);

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

  // Check ownership or team membership
  const isOwner = auraTreeData?.userId === userId;
  const isMember = auraTreeData?.teamMembers?.includes(userId);

  if (!isOwner && !isMember) {
    throw Errors.Forbidden('You do not have access to this Aura Tree');
  }

  // 1. Get link click counts
  const linksSnapshot = await db.collection('auraTrees').doc(id).collection('links').get();
  const linkStats = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    clickCount: doc.data().clickCount || 0,
    platform: doc.data().platform
  }));

  // 2. Get Time-series data & Growth (Last 60 days for comparison)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const sixtyDayStart = sixtyDaysAgo.toISOString();

  const analyticsFourteenDaysAgo = new Date();
  analyticsFourteenDaysAgo.setDate(analyticsFourteenDaysAgo.getDate() - 14);
  const fourteenDayStart = analyticsFourteenDaysAgo.toISOString();

  // Fetch unique interactions (filter in memory to avoid composite index)
  const [visitsSnapshot, clicksSnapshot, qrSnapshot] = await Promise.all([
    db.collection('unique_visits').where('auraTreeId', '==', id).get(),
    db.collection('unique_clicks').where('auraTreeId', '==', id).get(),
    db.collection('unique_qr_scans').where('auraTreeId', '==', id).get()
  ]);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Growth accumulators
  let statsAccumulator = {
    visits: { currentWeek: 0, prevWeek: 0, currentMonth: 0, prevMonth: 0 },
    clicks: { currentWeek: 0, prevWeek: 0, currentMonth: 0, prevMonth: 0 }
  };

  // Aggregate by day for chart (last 14 days)
  const dailyData: { [key: string]: { date: string, visits: number, clicks: number, qrScans: number } } = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyData[dateStr] = { date: dateStr, visits: 0, clicks: 0, qrScans: 0 };
  }

  // Process Visits
  visitsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const created = new Date(data.createdAt);
    
    if (data.createdAt >= fourteenDayStart) {
      const date = data.createdAt.split('T')[0];
      if (dailyData[date]) dailyData[date].visits++;
    }

    if (created > oneWeekAgo) statsAccumulator.visits.currentWeek++;
    else if (created > twoWeeksAgo) statsAccumulator.visits.prevWeek++;

    if (created > oneMonthAgo) statsAccumulator.visits.currentMonth++;
    else if (created > twoMonthsAgo) statsAccumulator.visits.prevMonth++;
  });

  // Process Clicks
  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const created = new Date(data.createdAt);
    
    if (data.createdAt >= fourteenDayStart) {
      const date = data.createdAt.split('T')[0];
      if (dailyData[date]) dailyData[date].clicks++;
    }

    if (created > oneWeekAgo) statsAccumulator.clicks.currentWeek++;
    else if (created > twoWeeksAgo) statsAccumulator.clicks.prevWeek++;

    if (created > oneMonthAgo) statsAccumulator.clicks.currentMonth++;
    else if (created > twoMonthsAgo) statsAccumulator.clicks.prevMonth++;
  });

  // Process QR
  qrSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.createdAt >= fourteenDayStart) {
      const date = data.createdAt.split('T')[0];
      if (dailyData[date]) dailyData[date].qrScans++;
    }
  });

  // Calculate percentage helper
  const calcGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const growth = {
    visits: {
      weekly: calcGrowth(statsAccumulator.visits.currentWeek, statsAccumulator.visits.prevWeek),
      monthly: calcGrowth(statsAccumulator.visits.currentMonth, statsAccumulator.visits.prevMonth)
    },
    clicks: {
      weekly: calcGrowth(statsAccumulator.clicks.currentWeek, statsAccumulator.clicks.prevWeek),
      monthly: calcGrowth(statsAccumulator.clicks.currentMonth, statsAccumulator.clicks.prevMonth)
    }
  };

  // Convert to sorted array
  const timeSeries = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  res.status(200).json({
    success: true,
    data: {
      totalVisits: auraTreeData?.viewCount || 0,
      totalClicks: auraTreeData?.clickCount || 0,
      totalQrScans: auraTreeData?.qrScanCount || 0,
      growth,
      links: linkStats,
      timeSeries
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

/**
 * Get Aura Tree by ID
 * GET /auratree/:id
 */
export const getAuraTreeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();

  if (!auraTreeDoc.exists) {
    throw Errors.NotFound('Aura Tree not found');
  }

  const data = auraTreeDoc.data();

  // Check ownership or team membership
  const isOwner = data?.userId === userId;
  const isMember = data?.teamMembers?.includes(userId);

  if (!isOwner && !isMember) {
    throw Errors.Forbidden('You do not have permission to view this page');
  }

  // Get links for this specific tree
  const linksSnapshot = await db
    .collection('auraTrees')
    .doc(id)
    .collection('links')
    .get();

  let links = linksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Sort in memory
  links.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  res.status(200).json({
    success: true,
    data: {
      id: auraTreeDoc.id,
      ...data,
      links,
      role: isOwner ? 'owner' : 'member'
    },
  });
});

/**
 * Add a team member
 * POST /auratree/:id/members
 */
export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { email } = req.body;

  if (!email) throw Errors.BadRequest('Member email is required');

  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();
  if (!auraTreeDoc.exists) throw Errors.NotFound('Aura Tree not found');

  const auraTreeData = auraTreeDoc.data();
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('Only the owner can add team members');
  }

  // Check plan
  const userDoc = await db.collection('users').doc(userId).get();
  const plan = userDoc.data()?.subscription?.plan || 'free';
  if (plan !== 'teams') {
    throw Errors.Forbidden('Team members are only available on the Teams plan');
  }

  // Check limit
  const currentMembers = auraTreeData?.teamMembers || [];
  if (currentMembers.length >= 5) {
    throw Errors.Forbidden('Maximum of 5 team members reached');
  }

  // Find user by email
  const memberUserSnapshot = await db.collection('users')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (memberUserSnapshot.empty) {
    throw Errors.NotFound('User with this email not found on Aura Tree');
  }

  const memberUserId = memberUserSnapshot.docs[0].id;

  if (memberUserId === userId) {
    throw Errors.BadRequest('You cannot add yourself as a team member');
  }

  if (currentMembers.includes(memberUserId)) {
    throw Errors.Conflict('User is already a team member');
  }

  await db.collection('auraTrees').doc(id).update({
    teamMembers: fieldValue.arrayUnion(memberUserId),
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: 'Team member added successfully'
  });
});

/**
 * Remove a team member
 * DELETE /auratree/:id/members/:memberId
 */
export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id, memberId } = req.params;

  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();
  if (!auraTreeDoc.exists) throw Errors.NotFound('Aura Tree not found');

  const auraTreeData = auraTreeDoc.data();
  if (auraTreeData?.userId !== userId) {
    throw Errors.Forbidden('Only the owner can remove team members');
  }

  await db.collection('auraTrees').doc(id).update({
    teamMembers: fieldValue.arrayRemove(memberId),
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: 'Team member removed successfully'
  });
});

/**
 * Get team members for an Aura Tree
 * GET /auratree/:id/members
 */
export const getTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  const auraTreeDoc = await db.collection('auraTrees').doc(id).get();
  if (!auraTreeDoc.exists) throw Errors.NotFound('Aura Tree not found');

  const auraTreeData = auraTreeDoc.data();
  
  // Only owner or member can see the team list
  const isOwner = auraTreeData?.userId === userId;
  const isMember = auraTreeData?.teamMembers?.includes(userId);

  if (!isOwner && !isMember) {
    throw Errors.Forbidden('Access denied');
  }

  const memberIds = auraTreeData?.teamMembers || [];
  const members = [];

  for (const mId of memberIds) {
    const userDoc = await db.collection('users').doc(mId).get();
    if (userDoc.exists) {
      const uData = userDoc.data();
      members.push({
        id: mId,
        displayName: uData?.displayName,
        email: uData?.email,
        avatarUrl: uData?.avatarUrl,
        username: uData?.username
      });
    }
  }

  res.status(200).json({
    success: true,
    data: members
  });
});

export default {
  createAuraTree,
  listMyAuraTrees,
  getAuraTreeById,
  getAuraTreeBySlug,
  getMyAuraTree,
  updateAuraTree,
  updateSlug,
  uploadBackground,
  deleteAuraTree,
  getAnalytics,
  trackQRScan,
  addTeamMember,
  removeTeamMember,
  getTeamMembers
};
