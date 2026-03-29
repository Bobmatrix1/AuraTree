/**
 * Aura Score Utility
 * Calculates the 'Aura Score' for a specific Aura Tree page based on engagement, completeness, and connectivity.
 */

import { db, auth } from '../config/firebase';

export interface AuraScoreBreakdown {
  engagement: number;
  aesthetic: number;
  connectivity: number;
  trust: number;
  total: number;
}

/**
 * Calculate the Aura Score for a specific Aura Tree page
 */
export const calculateAuraScore = async (auraTreeId: string): Promise<AuraScoreBreakdown> => {
  try {
    // 1. Get Aura Tree Data
    const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId).get();
    if (!auraTreeDoc.exists) {
      return { engagement: 0, aesthetic: 0, connectivity: 0, trust: 0, total: 0 };
    }
    const auraTreeData = auraTreeDoc.data() || {};
    const userId = auraTreeData.userId;

    // Get User Data for trust/account metrics
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    // --- PILLAR 1: Engagement Vitality (Max 40 points) ---
    // Specifically for this page
    let engagement = 0;
    const views = auraTreeData.viewCount || 0;
    const clicks = auraTreeData.clickCount || 0;
    const ctr = views > 0 ? (clicks / views) : 0;

    // Score based on CTR (0% to 20%+ CTR maps to 0-30 points)
    engagement += Math.min(30, Math.floor(ctr * 150));
    
    // Bonus for volume (1 point per 10 views, max 10 points) - reduced scale for pages
    engagement += Math.min(10, Math.floor(views / 10));

    // --- PILLAR 2: Aesthetic Completeness (Max 20 points) ---
    let aesthetic = 0;
    // Does this specific page have a photo?
    if (auraTreeData.avatarUrl) aesthetic += 10;
    // Does this specific page have a bio?
    if (auraTreeData.bio && auraTreeData.bio.length > 10) aesthetic += 5;
    
    // Custom theme check for this page
    if (auraTreeData.theme && auraTreeData.theme.accentColor !== '#7B61FF') {
      aesthetic += 5;
    }

    // --- PILLAR 3: Connectivity Depth (Max 20 points) ---
    let connectivity = 0;
    const linksSnapshot = await db.collection('auraTrees').doc(auraTreeId).collection('links').get();
    const linksCount = linksSnapshot.size;
    
    // 2 points per link, max 10 points
    connectivity += Math.min(10, linksCount * 2);

    // Diversity check (different platforms) on this page
    const platforms = new Set();
    linksSnapshot.docs.forEach(doc => platforms.add(doc.data().platform));
    connectivity += Math.min(10, Math.round(platforms.size * 2.5));

    // --- PILLAR 4: Verification & Trust (Max 20 points) ---
    let trust = 0;
    // Account level verification carries over
    try {
      const userRecord = await auth.getUser(userId);
      if (userRecord.emailVerified) trust += 10;
    } catch (e) {}
    
    // Plan bonus carries over to all pages
    const plan = userData.subscription?.plan || 'free';
    if (plan === 'teams') trust += 10;
    else if (plan === 'pro') trust += 5;

    const total = engagement + aesthetic + connectivity + trust;

    return {
      engagement,
      aesthetic,
      connectivity,
      trust,
      total: Math.min(100, Math.round(total))
    };
  } catch (error) {
    console.error('Error calculating Aura Score:', error);
    return { engagement: 0, aesthetic: 0, connectivity: 0, trust: 0, total: 0 };
  }
};

/**
 * Calculate and save the Aura Score to the specific Aura Tree document
 */
export const updateAuraScore = async (auraTreeId: string): Promise<number> => {
  const breakdown = await calculateAuraScore(auraTreeId);
  
  await db.collection('auraTrees').doc(auraTreeId).update({
    auraScore: breakdown.total,
    auraScoreBreakdown: breakdown,
    updatedAt: new Date().toISOString()
  });

  return breakdown.total;
};
