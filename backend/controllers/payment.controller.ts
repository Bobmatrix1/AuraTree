/**
 * Payment Controller
 * Handles Paystack payment processing and subscriptions
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import {
  initializeTransaction,
  verifyTransaction,
  createSubscription,
  disableSubscription,
  PLANS,
} from '../config/paystack';

/**
 * Helper to create affiliate commission
 */
const createAffiliateCommission = async (userId: string, amount: number, reference: string, isRenewal: boolean = false) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const referredBy = userData?.referredBy;

    if (referredBy) {
      // Find affiliate by referral code
      const affiliateSnapshot = await db.collection('affiliates')
        .where('referralCode', '==', referredBy)
        .limit(1)
        .get();

      if (!affiliateSnapshot.empty) {
        const affiliateDoc = affiliateSnapshot.docs[0];
        const affiliateId = affiliateDoc.id;

        // Affiliate cannot earn from their own subscription
        if (affiliateId === userId) return;

        const commissionRate = 0.20; // 20%
        const commissionAmount = amount * commissionRate;

        const commissionData = {
          affiliateId,
          referredUserId: userId,
          amount: commissionAmount,
          subscriptionAmount: amount,
          paymentReference: reference,
          isRenewal,
          status: 'pending', 
          billingCycle: new Date().toISOString().substring(0, 7), // YYYY-MM
          createdAt: new Date().toISOString(),
        };

        await db.collection('affiliateCommissions').add(commissionData);

        // Update affiliate earnings
        const affiliateData = affiliateDoc.data();
        await affiliateDoc.ref.update({
          totalEarnings: (affiliateData.totalEarnings || 0) + commissionAmount,
          withdrawableBalance: (affiliateData.withdrawableBalance || 0) + commissionAmount,
          'stats.activeSubscribers': (affiliateData.stats?.activeSubscribers || 0) + (isRenewal ? 0 : 1),
          updatedAt: new Date().toISOString(),
        });
        
        console.log(`Commission of ${commissionAmount} created for affiliate ${affiliateId}`);
      }
    }
  } catch (error) {
    console.error('Error creating affiliate commission:', error);
  }
};

/**
 * Initialize payment
 * POST /payments/initialize
 */
export const initializePayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const { plan } = req.body;

  if (!plan || !['pro', 'teams'].includes(plan.toLowerCase())) {
    throw Errors.BadRequest('Valid plan (pro or teams) is required');
  }

  // Get user
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData?.email) {
    throw Errors.BadRequest('User email not found');
  }

  // Get system settings for latest prices
  const { getSystemSettings } = await import('../utils/systemConfig');
  const settings = await getSystemSettings();
  
  const isPro = plan.toLowerCase() === 'pro';
  const planAmount = isPro ? settings.proPrice * 100 : settings.teamsPrice * 100; // convert to kobo
  const planName = isPro ? 'Pro' : 'Teams';

  // Get or Create Paystack Plan
  const { createPlan } = await import('../config/paystack');
  
  // Try to find an existing plan code for this name and amount in our config
  const planConfigKey = `paystack_${plan.toLowerCase()}_${planAmount}_plan_code`;
  let paystackPlanCode = settings[planConfigKey];

  if (!paystackPlanCode) {
    // Create a new plan on Paystack
    const newPlan = await createPlan(
      `${planName} Plan - ₦${planAmount / 100}/mo`,
      planAmount,
      'monthly'
    );

    if (newPlan.status && newPlan.data?.plan_code) {
      paystackPlanCode = newPlan.data.plan_code;
      
      // Save this plan code to our system settings so we don't create it again
      await db.collection('config').doc('system').set({
        [planConfigKey]: paystackPlanCode
      }, { merge: true });
      
      // Clear cache so it fetches the new plan code next time
      const { clearSettingsCache } = await import('../utils/systemConfig');
      clearSettingsCache();
    }
  }

  // Initialize transaction with the plan for recurring billing
  const transaction = await initializeTransaction(
    userData.email,
    planAmount,
    {
      userId,
      plan: plan.toLowerCase(),
      custom_fields: [
        {
          display_name: 'Plan',
          variable_name: 'plan',
          value: planName,
        },
      ],
    },
    paystackPlanCode // Pass the plan code here
  );

  if (!transaction.status) {
    throw Errors.Internal(transaction.message || 'Failed to initialize payment');
  }

  // Store pending payment
  await db.collection('payments').add({
    userId,
    plan: plan.toLowerCase(),
    reference: transaction.data?.reference,
    amount: planAmount,
    status: 'pending',
    authorizationUrl: transaction.data?.authorization_url,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Payment initialized',
    data: {
      authorizationUrl: transaction.data?.authorization_url,
      reference: transaction.data?.reference,
    },
  });
});

/**
 * Verify payment
 * POST /payments/verify
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.body;

  if (!reference) {
    throw Errors.BadRequest('Payment reference is required');
  }

  // Verify transaction with Paystack
  const verification = await verifyTransaction(reference);

  if (!verification.status) {
    throw Errors.Internal(verification.message || 'Failed to verify payment');
  }

  const transactionData = verification.data;

  if (transactionData?.status !== 'success') {
    // Update payment status
    const paymentSnapshot = await db
      .collection('payments')
      .where('reference', '==', reference)
      .get();

    if (!paymentSnapshot.empty) {
      await paymentSnapshot.docs[0].ref.update({
        status: transactionData?.status,
        updatedAt: new Date().toISOString(),
      });
    }

    throw Errors.BadRequest(`Payment ${transactionData?.status}`);
  }

  // Get payment record
  const paymentSnapshot = await db
    .collection('payments')
    .where('reference', '==', reference)
    .get();

  if (paymentSnapshot.empty) {
    throw Errors.NotFound('Payment record not found');
  }

  const paymentDoc = paymentSnapshot.docs[0];
  const paymentData = paymentDoc.data();

  // Update payment status
  await paymentDoc.ref.update({
    status: 'success',
    paidAt: transactionData?.paid_at,
    channel: transactionData?.channel,
    updatedAt: new Date().toISOString(),
  });

  // Update user subscription
  const plan = paymentData.plan;
  const subscriptionData: any = {
    plan,
    status: 'active',
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(), // 31 days to be safe
    paymentReference: reference,
  };

  // If it was a subscription-based payment, store the subscription code
  if ((transactionData as any)?.subscription) {
    subscriptionData.paystackSubscriptionCode = (transactionData as any).subscription;
    subscriptionData.paystackEmailToken = (transactionData as any).customer?.email_token;
  }

  await db.collection('users').doc(paymentData.userId).update({
    subscription: subscriptionData,
    updatedAt: new Date().toISOString(),
  });

  // Create subscription record
  await db.collection('subscriptions').add({
    userId: paymentData.userId,
    plan,
    status: 'active',
    amount: paymentData.amount,
    paymentReference: reference,
    paystackSubscriptionCode: subscriptionData.paystackSubscriptionCode || null,
    paystackEmailToken: subscriptionData.paystackEmailToken || null,
    startedAt: new Date().toISOString(),
    expiresAt: subscriptionData.expiresAt,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      plan,
      status: 'active',
      expiresAt: subscriptionData.expiresAt,
    },
  });

  // Create affiliate commission
  createAffiliateCommission(paymentData.userId, paymentData.amount / 100, reference).catch(console.error);
});

/**
 * Get user's subscription
 * GET /payments/subscription
 */
export const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData?.subscription) {
    res.status(200).json({
      success: true,
      data: {
        plan: 'free',
        status: 'active',
      },
    });
    return;
  }

  // Check if subscription has expired
  const subscription = userData.subscription;
  if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
    // Update to free plan
    await db.collection('users').doc(userId).update({
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: null,
      },
      updatedAt: new Date().toISOString(),
    });

    subscription.plan = 'free';
    subscription.status = 'active';
    subscription.expiresAt = null;
  }

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

/**
 * Cancel subscription
 * POST /payments/cancel
 */
export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData?.subscription || userData.subscription.plan === 'free') {
    throw Errors.BadRequest('No active subscription to cancel');
  }

  // Get subscription record
  const subscriptionSnapshot = await db
    .collection('subscriptions')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!subscriptionSnapshot.empty) {
    const subscriptionDoc = subscriptionSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // Disable Paystack subscription if exists
    if (subscriptionData.paystackSubscriptionCode) {
      try {
        await disableSubscription(
          subscriptionData.paystackSubscriptionCode,
          subscriptionData.paystackEmailToken
        );
      } catch (error) {
        console.error('Failed to disable Paystack subscription:', error);
      }
    }

    // Update subscription status
    await subscriptionDoc.ref.update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });
  }

  // Update user subscription (will expire at end of period)
  await db.collection('users').doc(userId).update({
    'subscription.status': 'cancelled',
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully. You will have access until the end of your billing period.',
  });
});

/**
 * Get payment history
 * GET /payments/history
 */
export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required');
  }

  const paymentsSnapshot = await db
    .collection('payments')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  const payments = paymentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    success: true,
    data: payments,
  });
});

/**
 * Handle Paystack webhook
 * POST /payments/webhook
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] as string;

  if (!signature) {
    throw Errors.Unauthorized('Missing webhook signature');
  }

  // Verify webhook signature
  const { verifyWebhook } = await import('../config/paystack');
  const isValid = verifyWebhook(signature, JSON.stringify(req.body));

  if (!isValid) {
    throw Errors.Unauthorized('Invalid webhook signature');
  }

  const event = req.body;
  const data = event.data;

  // Handle different event types
  switch (event.event) {
    case 'charge.success':
      // This handles initial payment AND subsequent renewals
      if (data.status === 'success') {
        const metadata = data.metadata;
        const userId = metadata?.userId;
        const plan = metadata?.plan || data.plan?.name?.toLowerCase();
        const subscriptionCode = data.subscription;

        if (userId) {
          // Extension logic
          const newExpiry = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
          
          await db.collection('users').doc(userId).update({
            'subscription.status': 'active',
            'subscription.expiresAt': newExpiry,
            'subscription.paystackSubscriptionCode': subscriptionCode || null,
            updatedAt: new Date().toISOString(),
          });

          // Record the payment
          await db.collection('payments').add({
            userId,
            plan: plan || 'pro',
            reference: data.reference,
            amount: data.amount,
            status: 'success',
            paidAt: data.paid_at,
            channel: data.channel,
            isRenewal: !!subscriptionCode,
            createdAt: new Date().toISOString(),
          });

          // Create affiliate commission
          createAffiliateCommission(userId, data.amount / 100, data.reference, !!subscriptionCode).catch(console.error);
        } else if (subscriptionCode) {
          // If userId is missing but we have a subscription code, find user by subscription code
          const userSnapshot = await db.collection('users')
            .where('subscription.paystackSubscriptionCode', '==', subscriptionCode)
            .limit(1).get();
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const newExpiry = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
            
            await userDoc.ref.update({
              'subscription.status': 'active',
              'subscription.expiresAt': newExpiry,
              updatedAt: new Date().toISOString(),
            });

            // Record payment
            await db.collection('payments').add({
              userId: userDoc.id,
              plan: plan || 'pro',
              reference: data.reference,
              amount: data.amount,
              status: 'success',
              paidAt: data.paid_at,
              isRenewal: true,
              createdAt: new Date().toISOString(),
            });

            // Create affiliate commission for renewal
            createAffiliateCommission(userDoc.id, data.amount / 100, data.reference, true).catch(console.error);
          }
        }
      }
      break;

    case 'subscription.create':
      console.log('Subscription created:', data.subscription_code);
      break;

    case 'subscription.disable':
      // Handle subscription cancellation from Paystack dashboard or failure
      const subCode = data.subscription_code;
      const userSnap = await db.collection('users')
        .where('subscription.paystackSubscriptionCode', '==', subCode)
        .limit(1).get();
      
      if (!userSnap.empty) {
        await userSnap.docs[0].ref.update({
          'subscription.status': 'cancelled',
          updatedAt: new Date().toISOString(),
        });
      }
      break;

    case 'invoice.create':
      // New invoice created
      console.log('Invoice created:', event.data);
      break;

    case 'invoice.update':
      // Invoice updated (payment received)
      console.log('Invoice updated:', event.data);
      break;

    default:
      console.log('Unhandled webhook event:', event.event);
  }

  res.status(200).json({ received: true });
});

export default {
  initializePayment,
  verifyPayment,
  getSubscription,
  cancelSubscription,
  getPaymentHistory,
  handleWebhook,
};
