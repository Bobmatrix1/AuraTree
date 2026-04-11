/**
 * Affiliate Controller
 * Handles affiliate registration, stats, and withdrawals
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

/**
 * Register as an affiliate
 * POST /affiliates/register
 */
export const registerAffiliate = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  const { fullName, email, phoneNumber, withdrawalMethod, bankName, accountNumber, accountName } = req.body;

  if (!bankName || !accountNumber || !accountName) {
    throw Errors.BadRequest('Bank details are required');
  }

  // Check if already an affiliate
  const affiliateDoc = await db.collection('affiliates').doc(userId).get();
  if (affiliateDoc.exists) {
    throw Errors.Conflict('You are already registered as an affiliate');
  }

  // Generate unique referral code
  const referralCode = (accountName.split(' ')[0] || 'user') + Math.floor(1000 + Math.random() * 9000);

  const affiliateData = {
    userId,
    fullName,
    email,
    phoneNumber,
    referralCode,
    withdrawalMethod,
    bankDetails: {
      bankName,
      accountNumber,
      accountName,
    },
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawableBalance: 0,
    stats: {
      clicks: 0,
      signups: 0,
      activeSubscribers: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  };

  await db.collection('affiliates').doc(userId).set(affiliateData);

  // Update user document
  await db.collection('users').doc(userId).update({
    isAffiliate: true,
    referralCode,
  });

  res.status(201).json({
    success: true,
    message: 'Registered as affiliate successfully',
    data: affiliateData,
  });
});

/**
 * Get affiliate dashboard data
 * GET /affiliates/me?auraTreeId=...
 */
export const getAffiliateData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  const { auraTreeId } = req.query;
  let targetUserId = userId;

  if (auraTreeId) {
    const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId as string).get();
    if (auraTreeDoc.exists) {
      const auraTreeData = auraTreeDoc.data();
      const isOwner = auraTreeData?.userId === userId;
      const isMember = auraTreeData?.teamMembers?.includes(userId);
      
      if (isOwner || isMember) {
        targetUserId = auraTreeData?.userId;
      }
    }
  }

  const affiliateDoc = await db.collection('affiliates').doc(targetUserId).get();
  if (!affiliateDoc.exists) {
    throw Errors.NotFound('Affiliate record not found');
  }

  res.status(200).json({
    success: true,
    data: affiliateDoc.data(),
  });
});

/**
 * Get affiliate stats (over time, etc.)
 * GET /affiliates/stats?auraTreeId=...
 */
export const getAffiliateStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  const { auraTreeId } = req.query;
  let targetUserId = userId;

  if (auraTreeId) {
    const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId as string).get();
    if (auraTreeDoc.exists) {
      const auraTreeData = auraTreeDoc.data();
      const isOwner = auraTreeData?.userId === userId;
      const isMember = auraTreeData?.teamMembers?.includes(userId);
      
      if (isOwner || isMember) {
        targetUserId = auraTreeData?.userId;
      }
    }
  }

  // For now return basic stats from affiliate doc
  const affiliateDoc = await db.collection('affiliates').doc(targetUserId).get();
  const data = affiliateDoc.data();

  // In a real app, we might query commissions and referrals to build charts
  res.status(200).json({
    success: true,
    data: data?.stats || {},
  });
});

/**
 * Get referred users
 * GET /affiliates/referrals?auraTreeId=...
 */
export const getReferrals = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  const { auraTreeId } = req.query;
  let targetUserId = userId;

  if (auraTreeId) {
    const auraTreeDoc = await db.collection('auraTrees').doc(auraTreeId as string).get();
    if (auraTreeDoc.exists) {
      const auraTreeData = auraTreeDoc.data();
      const isOwner = auraTreeData?.userId === userId;
      const isMember = auraTreeData?.teamMembers?.includes(userId);
      
      if (isOwner || isMember) {
        targetUserId = auraTreeData?.userId;
      }
    }
  }

  const referralsSnapshot = await db.collection('affiliateReferrals')
    .where('affiliateId', '==', targetUserId)
    .get();

  let referralsData = referralsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Sort in memory by createdAt desc
  referralsData.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const referrals = [];
  for (const data of referralsData) {
    // Get referred user details
    const userDoc = await db.collection('users').doc(data.referredUserId).get();
    const userData = userDoc.data();
    
    referrals.push({
      id: data.id,
      referredUserId: data.referredUserId,
      username: userData?.username,
      displayName: userData?.displayName,
      email: userData?.email,
      avatarUrl: userData?.avatarUrl,
      subscriptionPlan: userData?.subscription?.plan,
      subscriptionStatus: userData?.subscription?.status,
      createdAt: data.createdAt,
    });
  }

  res.status(200).json({
    success: true,
    data: referrals,
  });
});

/**
 * Request withdrawal
 * POST /affiliates/withdraw
 */
export const requestWithdrawal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  const { amount } = req.body;
  const minWithdrawal = 1000;

  if (!amount || amount < minWithdrawal) {
    throw Errors.BadRequest(`Minimum withdrawal amount is ₦${minWithdrawal}`);
  }

  const affiliateDoc = await db.collection('affiliates').doc(userId).get();
  const affiliateData = affiliateDoc.data();

  if (!affiliateData || affiliateData.withdrawableBalance < amount) {
    throw Errors.BadRequest('Insufficient balance');
  }

  // Check for 1 withdrawal per week
  const lastWithdrawalSnapshot = await db.collection('withdrawals')
    .where('affiliateId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!lastWithdrawalSnapshot.empty) {
    const lastWithdrawal = lastWithdrawalSnapshot.docs[0].data();
    const lastDate = new Date(lastWithdrawal.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (lastDate > oneWeekAgo) {
      throw Errors.BadRequest('You can only make one withdrawal request per week.');
    }
  }

  const fee = amount * 0.05;
  const netAmount = amount - fee;

  const withdrawalData = {
    affiliateId: userId,
    amount, // gross
    fee,
    netAmount,
    bankName: affiliateData.bankDetails.bankName,
    accountNumber: affiliateData.bankDetails.accountNumber,
    accountName: affiliateData.bankDetails.accountName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await db.collection('withdrawals').add(withdrawalData);

  // Update affiliate balance
  await db.collection('affiliates').doc(userId).update({
    withdrawableBalance: affiliateData.withdrawableBalance - amount,
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Withdrawal request submitted successfully',
    data: withdrawalData,
  });
});

/**
 * Update bank details
 * PUT /affiliates/bank-details
 */
export const updateBankDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw Errors.Unauthorized('Authentication required');

  const { bankName, accountNumber, accountName } = req.body;

  if (!bankName || !accountNumber || !accountName) {
    throw Errors.BadRequest('Bank details are required');
  }

  await db.collection('affiliates').doc(userId).update({
    'bankDetails.bankName': bankName,
    'bankDetails.accountNumber': accountNumber,
    'bankDetails.accountName': accountName,
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Bank details updated successfully',
  });
});

export default {
  registerAffiliate,
  getAffiliateData,
  getAffiliateStats,
  getReferrals,
  requestWithdrawal,
  updateBankDetails,
};
