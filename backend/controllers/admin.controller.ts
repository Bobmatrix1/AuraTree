/**
 * Admin Controller
 * Handles admin dashboard operations and analytics
 */

import { Request, Response } from 'express';
import { db, auth } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { resend } from '../config/resend';

// Production-ready in-memory cache
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get dashboard statistics
 * GET /admin/stats
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const now = Date.now();
  
  // 1. Return cached data if valid (Near-instant response)
  if (statsCache && (now - statsCache.timestamp < CACHE_DURATION)) {
    return res.status(200).json({ success: true, data: statsCache.data, fromCache: true });
  }

  const stats: any = {
    users: { total: 0, growth: 0, online: 0 },
    auraTrees: { total: 0, growth: 0 },
    links: { total: 0, growth: 0 },
    subscriptions: { free: 0, pro: 0, teams: 0 },
    revenue: { total: 0, growth: 0, currency: 'NGN' },
    analytics: {
      countries: [],
      regions: [],
      devices: { mobile: 0, tablet: 0, desktop: 0 },
      peakHours: new Array(24).fill(0)
    }
  };

  const dateNow = new Date();
  const fiveMinsAgo = new Date(dateNow.getTime() - 5 * 60 * 1000);
  const sevenDaysAgo = new Date(dateNow.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(dateNow.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(dateNow.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // 2. Parallelized Scalable Queries
    const [
      totalUsers,
      onlineUsers,
      totalTrees,
      totalLinks,
      proCount,
      teamsCount,
      uRecent, uPrev,
      tRecent, tPrev,
      allPayments,
      recentVisits
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('lastActiveAt', '>=', fiveMinsAgo.toISOString()).count().get(),
      db.collection('auraTrees').count().get(),
      db.collectionGroup('links').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      db.collection('users').where('subscription.plan', '==', 'pro').count().get(),
      db.collection('users').where('subscription.plan', '==', 'teams').count().get(),
      db.collection('users').where('createdAt', '>=', sevenDaysAgo.toISOString()).count().get().catch(() => null),
      db.collection('users').where('createdAt', '>=', fourteenDaysAgo.toISOString()).where('createdAt', '<', sevenDaysAgo.toISOString()).count().get().catch(() => null),
      db.collection('auraTrees').where('createdAt', '>=', sevenDaysAgo.toISOString()).count().get().catch(() => null),
      db.collection('auraTrees').where('createdAt', '>=', fourteenDaysAgo.toISOString()).where('createdAt', '<', sevenDaysAgo.toISOString()).count().get().catch(() => null),
      db.collection('payments').where('status', '==', 'success').get(),
      db.collection('unique_visits').where('createdAt', '>=', thirtyDaysAgo.toISOString()).get()
    ]);

    stats.users.total = totalUsers.data().count;
    stats.users.online = onlineUsers.data().count;
    stats.auraTrees.total = totalTrees.data().count;
    stats.links.total = totalLinks.data().count;
    
    stats.subscriptions.pro = proCount.data().count;
    stats.subscriptions.teams = teamsCount.data().count;
    stats.subscriptions.free = stats.users.total - stats.subscriptions.pro - stats.subscriptions.teams;

    if (uRecent && uPrev) stats.users.growth = calculateGrowth(uRecent.data().count, uPrev.data().count);
    if (tRecent && tPrev) stats.auraTrees.growth = calculateGrowth(tRecent.data().count, tPrev.data().count);

    const payments = allPayments.docs.map(d => d.data());
    stats.revenue.total = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const recentRev = payments.filter(p => p.createdAt >= sevenDaysAgo.toISOString()).reduce((acc, p) => acc + (p.amount || 0), 0);
    const prevRev = payments.filter(p => p.createdAt >= fourteenDaysAgo.toISOString() && p.createdAt < sevenDaysAgo.toISOString()).reduce((acc, p) => acc + (p.amount || 0), 0);
    stats.revenue.growth = calculateGrowth(recentRev, prevRev);

    // 3. Process Advanced Analytics
    const countryMap: { [key: string]: number } = {};
    const regionMap: { [key: string]: number } = {};
    
    recentVisits.docs.forEach(doc => {
      const data = doc.data();
      
      // Country
      const country = data.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;
      
      // Region/State
      if (data.region && data.region !== 'Unknown') {
        regionMap[data.region] = (regionMap[data.region] || 0) + 1;
      }
      
      // Device
      if (data.device) {
        stats.analytics.devices[data.device as keyof typeof stats.analytics.devices]++;
      }
      
      // Peak Hours
      if (data.createdAt) {
        const hour = new Date(data.createdAt).getUTCHours();
        stats.analytics.peakHours[hour]++;
      }
    });

    // Convert maps to sorted arrays
    stats.analytics.countries = Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats.analytics.regions = Object.entries(regionMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Update Global Cache
    statsCache = { data: stats, timestamp: now };

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Stats Sync Error:', error.message);
    res.status(200).json({ success: true, data: stats, partial: true });
  }
});

// Production Growth Formula
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Get advanced analytics (countries, devices, peak hours)
 * GET /admin/analytics
 */
export const getAdvancedAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [visitsSnapshot, signupsSnapshot, revenueSnapshot] = await Promise.all([
    db.collection('unique_visits').where('createdAt', '>=', startDate).get(),
    db.collection('users').where('createdAt', '>=', startDate).get(),
    db.collection('payments').where('status', '==', 'success').where('createdAt', '>=', startDate).get()
  ]);

  const stats = {
    analytics: {
      countries: [] as any[],
      regions: [] as any[],
      devices: { mobile: 0, tablet: 0, desktop: 0 },
      peakHours: new Array(24).fill(0)
    },
    signups: {} as any,
    revenue: {} as any
  };

  const countryMap: any = {};
  const regionMap: any = {};

  visitsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const c = data.country || 'Unknown';
    const r = data.region || 'Unknown';
    countryMap[c] = (countryMap[c] || 0) + 1;
    if (r !== 'Unknown') regionMap[r] = (regionMap[r] || 0) + 1;
    if (data.device) (stats.analytics.devices as any)[data.device]++;
    if (data.createdAt) {
      // African Time (WAT - UTC+1)
      const date = new Date(data.createdAt);
      const hour = (date.getUTCHours() + 1) % 24;
      stats.analytics.peakHours[hour]++;
    }
  });

  stats.analytics.countries = Object.entries(countryMap).map(([name, count]) => ({ name, count })).sort((a: any, b: any) => b.count - a.count).slice(0, 10);
  stats.analytics.regions = Object.entries(regionMap).map(([name, count]) => ({ name, count })).sort((a: any, b: any) => b.count - a.count).slice(0, 10);

  // Group signups by date
  signupsSnapshot.docs.forEach(doc => {
    const date = doc.data().createdAt.split('T')[0];
    stats.signups[date] = (stats.signups[date] || 0) + 1;
  });

  // Group revenue by date
  revenueSnapshot.docs.forEach(doc => {
    const date = doc.data().createdAt.split('T')[0];
    stats.revenue[date] = (stats.revenue[date] || 0) + (doc.data().amount || 0);
  });

  res.status(200).json({ success: true, data: stats });
});

/**
 * Get all users
 * GET /admin/users
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, plan, status } = req.query;
  try {
    let query: any = db.collection('users');
    if (plan && plan !== 'all') query = query.where('subscription.plan', '==', plan);
    if (status && status !== 'all') query = query.where('isActive', '==', status === 'active');

    query = query.orderBy('createdAt', 'desc');
    const snapshot = await query.limit(100).get(); 
    let users = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const s = (search as string).toLowerCase();
      users = users.filter((u: any) => u.username?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.displayName?.toLowerCase().includes(s));
    }

    const total = users.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = users.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({ success: true, data: { users: paginated, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } } });
  } catch (error: any) {
    throw error;
  }
});

/**
 * Get user details
 */
export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userDoc = await db.collection('users').doc(id).get();
  if (!userDoc.exists) throw Errors.NotFound('User not found');
  const userData = userDoc.data();

  const auraTreeSnapshot = await db.collection('auraTrees').where('userId', '==', id).get();
  const auraTree = auraTreeSnapshot.empty ? null : { id: auraTreeSnapshot.docs[0].id, ...auraTreeSnapshot.docs[0].data() };

  let links: any[] = [];
  if (auraTree) {
    const linksSnapshot = await db.collection('auraTrees').doc(auraTree.id).collection('links').get();
    links = linksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  const paymentsSnapshot = await db.collection('payments').where('userId', '==', id).orderBy('createdAt', 'desc').get();
  const payments = paymentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  res.status(200).json({ success: true, data: { user: { id, ...userData }, auraTree, links, payments } });
});

/**
 * Update user
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id || id === 'undefined') {
    throw Errors.BadRequest('Invalid user ID');
  }

  const userRef = db.collection('users').doc(id);
  
  // Build updates with Dot Notation for absolute precision in Firestore
  const updates: any = { 
    updatedAt: new Date().toISOString() 
  };

  // Map nested subscription fields
  if (req.body.subscription) {
    const sub = req.body.subscription;
    const plan = sub.plan ? sub.plan.toLowerCase() : null;
    
    if (plan) {
      updates['subscription.plan'] = plan;
      // If upgrading to paid, set a 30-day expiry automatically if not provided
      if (plan !== 'free' && !sub.expiresAt) {
        updates['subscription.expiresAt'] = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }
    
    if (sub.status) updates['subscription.status'] = sub.status.toLowerCase();
    updates['subscription.updatedAt'] = new Date().toISOString();
  }

  // Map all other top-level fields
  for (const key in req.body) {
    if (key !== 'subscription' && key !== 'id') {
      updates[key] = req.body[key];
    }
  }

  // Force the update using Admin SDK (bypasses all rules)
  await userRef.update(updates);
  
  // Sync with Firebase Auth
  try {
    if (req.body.displayName) await auth.updateUser(id, { displayName: req.body.displayName });
    if (req.body.isActive !== undefined) await auth.updateUser(id, { disabled: !req.body.isActive });
  } catch (err) {
    // Auth sync error is logged but doesn't stop the DB update success
    console.error('Auth sync failed:', err);
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'User record updated successfully in Firestore',
    id: id,
    appliedUpdates: updates 
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const auraTreesSnapshot = await db.collection('auraTrees').where('userId', '==', id).get();
  for (const auraTree of auraTreesSnapshot.docs) {
    const linksSnapshot = await auraTree.ref.collection('links').get();
    const batch = db.batch();
    linksSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    await auraTree.ref.delete();
  }
  await db.collection('users').doc(id).delete();
  await auth.deleteUser(id);
  res.status(200).json({ success: true, message: 'Deleted' });
});

/**
 * Cancel user subscription (Admin)
 */
export const cancelUserSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userDoc = await db.collection('users').doc(id).get();
  
  if (!userDoc.exists) {
    throw Errors.NotFound('User not found');
  }

  const userData = userDoc.data();
  const subscription = userData?.subscription;

  if (!subscription || subscription.plan === 'free') {
    throw Errors.BadRequest('User is on a free plan');
  }

  // If there's a Paystack subscription code, disable it
  if (subscription.paystackSubscriptionCode && subscription.paystackEmailToken) {
    const { disableSubscription } = await import('../config/paystack');
    await disableSubscription(subscription.paystackSubscriptionCode, subscription.paystackEmailToken);
  }

  // Update user record to reflect cancellation
  await db.collection('users').doc(id).update({
    'subscription.status': 'cancelled',
    updatedAt: new Date().toISOString()
  });

  // Log the admin action
  await db.collection('adminLogs').add({
    adminId: req.userId,
    action: 'CANCEL_USER_SUBSCRIPTION',
    details: { userId: id, previousPlan: subscription.plan },
    createdAt: new Date().toISOString()
  });

  res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
});

/**
 * Aura Trees
 */
export const getAuraTrees = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, isActive } = req.query;
  try {
    let query: any = db.collection('auraTrees');
    if (isActive !== undefined && isActive !== 'all') query = query.where('isActive', '==', isActive === 'true');
    query = query.orderBy('createdAt', 'desc');
    const snapshot = await query.limit(100).get();
    let trees = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    if (search) {
      const s = (search as string).toLowerCase();
      trees = trees.filter((t: any) => t.slug?.toLowerCase().includes(s) || t.displayName?.toLowerCase().includes(s));
    }
    const total = trees.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    res.status(200).json({ success: true, data: { auraTrees: trees.slice(startIndex, startIndex + Number(limit)), pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } } });
  } catch (error: any) {
    if (error.message.includes('FAILED_PRECONDITION')) throw Errors.Internal('Index Error.');
    throw error;
  }
});

/**
 * Links
 */
export const getLinks = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, platform } = req.query;
  let baseQuery: any = db.collectionGroup('links');
  if (platform && platform !== 'all') baseQuery = baseQuery.where('platform', '==', platform);
  const countSnapshot = await baseQuery.count().get();
  const totalCount = countSnapshot.data().count;
  const snapshot = await baseQuery.orderBy('createdAt', 'desc').limit(Number(limit)).offset((Number(page) - 1) * Number(limit)).get();
  const links = snapshot.docs.map((doc: any) => ({ id: doc.id, parentId: doc.ref.parent.parent?.id, ...doc.data() }));
  res.status(200).json({ success: true, data: { links, pagination: { total: totalCount, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalCount / Number(limit)) } } });
});

export const deleteLink = asyncHandler(async (req: Request, res: Response) => {
  const { treeId, linkId } = req.params;
  await db.collection('auraTrees').doc(treeId).collection('links').doc(linkId).delete();
  res.status(200).json({ success: true, message: 'Deleted' });
});

/**
 * Finance & Payments
 */
export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status } = req.query;
  const limitNum = Number(limit);
  const pageNum = Number(page);

  let query: any = db.collection('payments').orderBy('createdAt', 'desc');
  if (status && status !== 'all') query = query.where('status', '==', status);

  const snapshot = await query.get();
  const rawPayments = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  const total = rawPayments.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedPayments = rawPayments.slice(startIndex, startIndex + limitNum);

  const paymentsWithUsers = await Promise.all(paginatedPayments.map(async (p: any) => {
    try {
      const userDoc = await db.collection('users').doc(p.userId).get();
      const userData = userDoc.data();
      return { ...p, userName: userData?.displayName || 'N/A', userEmail: userData?.email || p.userEmail || 'N/A' };
    } catch (e) {
      return { ...p, userName: 'N/A', userEmail: p.userEmail || 'N/A' };
    }
  }));

  res.status(200).json({ success: true, data: { payments: paymentsWithUsers, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } } });
});

/**
 * Analytics
 */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [uSnap, pSnap, allUsersSnap, allLinksSnap] = await Promise.all([
    db.collection('users').where('createdAt', '>=', startDate.toISOString()).get(),
    db.collection('payments').where('status', '==', 'success').where('createdAt', '>=', startDate.toISOString()).get(),
    db.collection('users').get(),
    db.collectionGroup('links').get()
  ]);

  const signups: any = {};
  uSnap.docs.forEach(d => { const date = d.data().createdAt.split('T')[0]; signups[date] = (signups[date] || 0) + 1; });

  const revenue: any = {};
  pSnap.docs.forEach(d => { const date = d.data().createdAt.split('T')[0]; revenue[date] = (revenue[date] || 0) + (d.data().amount || 0); });

  const plans: any = { free: 0, pro: 0, teams: 0 };
  allUsersSnap.docs.forEach(d => { const p = d.data().subscription?.plan || 'free'; plans[p] = (plans[p] || 0) + 1; });

  const platforms: any = {};
  allLinksSnap.docs.forEach(d => { const p = d.data().platform || 'website'; platforms[p] = (platforms[p] || 0) + 1; });

  res.status(200).json({ success: true, data: { period, signups, revenue, distributions: { plans, platforms } } });
});

/**
 * Logs & Settings
 */
export const createLog = asyncHandler(async (req: Request, res: Response) => {
  await db.collection('adminLogs').add({ adminId: req.userId, action: req.body.action, details: req.body.details, targetUserId: req.body.targetUserId, createdAt: new Date().toISOString() });
  res.status(201).json({ success: true });
});

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const countSnap = await db.collection('adminLogs').count().get();
  const total = countSnap.data().count;
  const snapshot = await db.collection('adminLogs').orderBy('createdAt', 'desc').limit(limitNum).offset((pageNum - 1) * limitNum).get();
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, data: { logs, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } } });
});

/**
 * Get System Settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settingsDoc = await db.collection('config').doc('system').get();
  
  // Default settings if not exists
  const defaultSettings = {
    platformName: 'Aura Tree',
    supportEmail: 'support@auratree.com',
    maintenanceMode: false,
    registrationEnabled: true,
    minPasswordLength: 6,
    maxLinksPerFreeUser: 5,
    proPrice: 1000,
    teamsPrice: 10000
  };

  if (!settingsDoc.exists) {
    return res.status(200).json({ success: true, data: defaultSettings });
  }
  
  res.status(200).json({ success: true, data: { ...defaultSettings, ...settingsDoc.data() } });
});

/**
 * Update System Settings
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const newSettings = req.body;
  
  await db.collection('config').doc('system').set({
    ...newSettings,
    updatedAt: new Date().toISOString(),
    updatedBy: req.userId
  }, { merge: true });

  // Log the action
  await db.collection('adminLogs').add({
    adminId: req.userId,
    action: 'UPDATE_SYSTEM_SETTINGS',
    details: newSettings,
    createdAt: new Date().toISOString()
  });

  res.status(200).json({ success: true, message: 'Settings updated successfully' });
});

/**
 * Testimonials
 */
export const getAdminTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const countSnap = await db.collection('testimonials').count().get();
  const total = countSnap.data().count;

  const snapshot = await db.collection('testimonials')
    .orderBy('createdAt', 'desc')
    .limit(limitNum)
    .offset((pageNum - 1) * limitNum)
    .get();

  const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  res.status(200).json({
    success: true,
    data: {
      testimonials,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
});

export const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Get testimonial to potentially delete image from Cloudinary
  const doc = await db.collection('testimonials').doc(id).get();
  if (doc.exists) {
    const data = doc.data();
    if (data?.avatar && data.avatar.includes('cloudinary')) {
      // Could implement Cloudinary deletion here if publicId was stored
    }
    await db.collection('testimonials').doc(id).delete();
  }

  res.status(200).json({ success: true, message: 'Testimonial deleted' });
});

/**
 * Newsletter Subscribers
 */
export const getSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const countSnap = await db.collection('subscribers').count().get();
  const total = countSnap.data().count;

  const snapshot = await db.collection('subscribers')
    .orderBy('subscribedAt', 'desc')
    .limit(limitNum)
    .offset((pageNum - 1) * limitNum)
    .get();

  const subscribers = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

  res.status(200).json({
    success: true,
    data: {
      subscribers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
});

export const deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.collection('subscribers').doc(id).delete();
  res.status(200).json({ success: true, message: 'Subscriber removed' });
});

export const sendNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { subject, content, recipientId } = req.body;

  if (!subject || !content) {
    throw Errors.BadRequest('Subject and content are required');
  }

  let recipients: string[] = [];

  if (recipientId) {
    // Single recipient
    const doc = await db.collection('subscribers').doc(recipientId).get();
    if (doc.exists) recipients.push(doc.data()?.email);
  } else {
    // All active subscribers
    const snapshot = await db.collection('subscribers').where('isActive', '==', true).get();
    recipients = snapshot.docs.map(doc => doc.data().email);
  }

  if (recipients.length === 0) {
    throw Errors.NotFound('No recipients found');
  }

  // Send via Resend using verified domain
  const { data, error } = await resend.emails.send({
    from: 'AuraTree <newsletter@feel-flytech.site>', 
    to: recipients,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://auratree.me/aura%20tree%20logo.png" alt="AuraTree" style="width: 150px;">
        </div>
        <div style="color: #333; line-height: 1.6; font-size: 16px;">
          ${content}
        </div>
        <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;">
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>© 2026 AuraTree. All rights reserved.</p>
          <p>You received this because you are subscribed to Aura Insights.</p>
        </div>
      </div>
    `
  });

  if (error) {
    console.error('Resend API Error Detail:', JSON.stringify(error, null, 2));
    throw Errors.Internal(`Resend Error: ${error.message}`);
  }

  res.status(200).json({ success: true, message: `Email sent to ${recipients.length} recipients` });
});

export default {
  getStats, getAdvancedAnalytics, getUsers, getUserDetails, updateUser, deleteUser, cancelUserSubscription, getAuraTrees, getLinks, deleteLink, getPayments, getAnalytics, createLog, getLogs, getSettings, updateSettings, getAdminTestimonials, deleteTestimonial, getSubscribers, deleteSubscriber, sendNewsletter
};
