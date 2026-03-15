/**
 * Aura Score Utility
 * Calculates the 'Aura Score' for a user based on engagement, completeness, and connectivity.
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
 * Calculate the Aura Score for a specific user
 */
export const calculateAuraScore = async (userId: string): Promise<AuraScoreBreakdown> => {
  try {
    // 1. Get User and Aura Tree Data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { engagement: 0, aesthetic: 0, connectivity: 0, trust: 0, total: 0 };
    }
    const userData = userDoc.data() || {};

    const auraTreeSnapshot = await db.collection('auraTrees').where('userId', '==', userId).limit(1).get();
    const auraTreeData = auraTreeSnapshot.empty ? null : auraTreeSnapshot.docs[0].data();
    const treeId = auraTreeSnapshot.empty ? null : auraTreeSnapshot.docs[0].id;

    // --- PILLAR 1: Engagement Vitality (Max 40 points) ---
    let engagement = 0;
    if (auraTreeData) {
      const views = auraTreeData.viewCount || 0;
      const clicks = auraTreeData.clickCount || 0;
      const ctr = views > 0 ? (clicks / views) : 0;

      // Score based on CTR (0% to 20%+ CTR maps to 0-30 points)
      engagement += Math.min(30, Math.floor(ctr * 150));
      
      // Bonus for volume (1 point per 100 views, max 10 points)
      engagement += Math.min(10, Math.floor(views / 100));
    }

    // --- PILLAR 2: Aesthetic Completeness (Max 20 points) ---
    let aesthetic = 0;
    if (userData.avatarUrl) aesthetic += 5;
    if (userData.bio && userData.bio.length > 10) aesthetic += 5;
    if (userData.username && !userData.username.includes('user-')) aesthetic += 5;
    
    // Custom theme check
    if (auraTreeData && auraTreeData.theme && auraTreeData.theme.accentColor !== '#7B61FF') {
      aesthetic += 5;
    }

    // --- PILLAR 3: Connectivity Depth (Max 20 points) ---
    let connectivity = 0;
    if (treeId) {
      const linksSnapshot = await db.collection('auraTrees').doc(treeId).collection('links').get();
      const linksCount = linksSnapshot.size;
      
      // 2 points per link, max 10 points
      connectivity += Math.min(10, linksCount * 2);

      // Diversity check (different platforms)
      const platforms = new Set();
      linksSnapshot.docs.forEach(doc => platforms.add(doc.data().platform));
      connectivity += Math.min(10, platforms.size * 2.5);
    }

    // --- PILLAR 4: Verification & Trust (Max 20 points) ---
    let trust = 0;
    try {
      const userRecord = await auth.getUser(userId);
      if (userRecord.emailVerified) trust += 10;
    } catch (e) {
      // Fallback if auth check fails
    }
    
    // Tenure bonus (1 point per month since creation, max 10 points)
    const createdAt = new Date(userData.createdAt || Date.now());
    const monthsActive = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
    trust += Math.min(10, monthsActive + 1);

    const total = engagement + aesthetic + connectivity + trust;

    return {
      engagement,
      aesthetic,
      connectivity,
      trust,
      total: Math.min(100, total)
    };
  } catch (error) {
    console.error('Error calculating Aura Score:', error);
    return { engagement: 0, aesthetic: 0, connectivity: 0, trust: 0, total: 0 };
  }
};

/**
 * Calculate and save the Aura Score to Firestore
 */
export const updateAuraScore = async (userId: string): Promise<number> => {
  const breakdown = await calculateAuraScore(userId);
  
  await db.collection('users').doc(userId).update({
    auraScore: breakdown.total,
    auraScoreBreakdown: breakdown,
    updatedAt: new Date().toISOString()
  });

  return breakdown.total;
};
