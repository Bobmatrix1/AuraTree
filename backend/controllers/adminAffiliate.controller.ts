/**
 * Admin Affiliate Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';

/**
 * List all affiliates
 * GET /admin/affiliates
 */
export const getAllAffiliates = asyncHandler(async (req: Request, res: Response) => {
  const affiliatesSnapshot = await db.collection('affiliates').get();

  let affiliates = affiliatesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Sort in memory
  affiliates.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(200).json({
    success: true,
    data: affiliates
  });
});

/**
 * Get affiliate referrals
 * GET /admin/affiliates/:id/referrals
 */
export const getAffiliateReferralsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const referralsSnapshot = await db.collection('affiliateReferrals')
    .where('affiliateId', '==', id)
    .get();

  let referralsData = referralsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Sort in memory
  referralsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const referrals = [];
  for (const data of referralsData) {
    const userDoc = await db.collection('users').doc(data.referredUserId).get();
    referrals.push({
      id: data.id,
      ...data,
      user: userDoc.data()
    });
  }

  res.status(200).json({
    success: true,
    data: referrals
  });
});

/**
 * List all withdrawals
 * GET /admin/withdrawals
 */
export const getAllWithdrawals = asyncHandler(async (req: Request, res: Response) => {
  const withdrawalsSnapshot = await db.collection('withdrawals').get();

  let withdrawalsData = withdrawalsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Sort in memory
  withdrawalsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const withdrawals = [];
  for (const data of withdrawalsData) {
    const affiliateDoc = await db.collection('affiliates').doc(data.affiliateId).get();
    withdrawals.push({
      id: data.id,
      ...data,
      affiliate: affiliateDoc.data()
    });
  }

  res.status(200).json({
    success: true,
    data: withdrawals
  });
});

/**
 * Update withdrawal status
 * PATCH /admin/withdrawals/:id
 */
export const updateWithdrawalStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'paid', 'rejected'].includes(status)) {
    throw Errors.BadRequest('Invalid status');
  }

  const withdrawalRef = db.collection('withdrawals').doc(id);
  const withdrawalDoc = await withdrawalRef.get();

  if (!withdrawalDoc.exists) {
    throw Errors.NotFound('Withdrawal request not found');
  }

  const withdrawalData = withdrawalDoc.data();

  // If rejecting, refund the balance to the affiliate
  if (status === 'rejected' && withdrawalData?.status !== 'rejected') {
    const affiliateRef = db.collection('affiliates').doc(withdrawalData?.affiliateId);
    const affiliateDoc = await affiliateRef.get();
    const affiliateData = affiliateDoc.data();

    await affiliateRef.update({
      withdrawableBalance: (affiliateData?.withdrawableBalance || 0) + withdrawalData?.amount,
      updatedAt: new Date().toISOString()
    });
  }

  await withdrawalRef.update({
    status,
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: `Withdrawal request ${status}`
  });
});

export default {
  getAllAffiliates,
  getAffiliateReferralsAdmin,
  getAllWithdrawals,
  updateWithdrawalStatus
};
