/**
 * Paystack Configuration
 * Handles payment processing, subscriptions, and webhooks
 */

import dotenv from 'dotenv';

dotenv.config();

// Paystack API configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Plan configurations
export const PLANS = {
  PRO: {
    name: 'Pro',
    amount: parseInt(process.env.PRO_PLAN_AMOUNT || '100000'), // in kobo (₦1,000.00)
    interval: process.env.PRO_PLAN_INTERVAL || 'monthly',
    planCode: process.env.PAYSTACK_PRO_PLAN_CODE || '', // Will be created dynamically
  },
  TEAMS: {
    name: 'Teams',
    amount: parseInt(process.env.TEAMS_PLAN_AMOUNT || '1000000'), // in kobo (₦10,000.00)
    interval: process.env.TEAMS_PLAN_INTERVAL || 'monthly',
    planCode: process.env.PAYSTACK_TEAMS_PLAN_CODE || '', // Will be created dynamically
  },
};

/**
 * Initialize a transaction
 */
export const initializeTransaction = async (
  email: string,
  amount: number,
  metadata: object = {},
  plan?: string
): Promise<{
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}> => {
  try {
    const body: any = {
      email,
      amount: amount, // Amount is already in kobo from PLANS config
      metadata,
      callback_url: `${process.env.API_URL || 'http://localhost:5000/api/v1'}/payments/verify`,
    };

    if (plan) {
      body.plan = plan;
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data as any;
  } catch (error) {
    console.error('Paystack initialize transaction error:', error);
    throw error;
  }
};

/**
 * Verify a transaction
 */
export const verifyTransaction = async (
  reference: string
): Promise<{
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
    };
    metadata: object;
    plan: string;
    subscription: string;
  };
}> => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    return data as any;
  } catch (error) {
    console.error('Paystack verify transaction error:', error);
    throw error;
  }
};

/**
 * Create a subscription plan
 */
export const createPlan = async (
  name: string,
  amount: number,
  interval: string
): Promise<{
  status: boolean;
  message: string;
  data?: {
    plan_code: string;
    name: string;
    amount: number;
    interval: string;
  };
}> => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        amount: amount, // Amount is already in kobo
        interval,
      }),
    });

    const data = await response.json();
    return data as any;
  } catch (error) {
    console.error('Paystack create plan error:', error);
    throw error;
  }
};

/**
 * Create a subscription
 */
export const createSubscription = async (
  customerEmail: string,
  planCode: string,
  authorizationCode: string
): Promise<{
  status: boolean;
  message: string;
  data?: {
    subscription_code: string;
    status: string;
    next_payment_date: string;
  };
}> => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerEmail,
        plan: planCode,
        authorization: authorizationCode,
      }),
    });

    const data = await response.json();
    return data as any;
  } catch (error) {
    console.error('Paystack create subscription error:', error);
    throw error;
  }
};

/**
 * Disable a subscription
 */
export const disableSubscription = async (
  subscriptionCode: string,
  token: string
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: subscriptionCode,
        token,
      }),
    });

    const data = await response.json();
    return data as any;
  } catch (error) {
    console.error('Paystack disable subscription error:', error);
    throw error;
  }
};

/**
 * Fetch subscription details
 */
export const fetchSubscription = async (
  subscriptionCode: string
): Promise<{
  status: boolean;
  message: string;
  data?: object;
}> => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/${subscriptionCode}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    return data as any;
  } catch (error) {
    console.error('Paystack fetch subscription error:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 */
export const verifyWebhook = (
  signature: string,
  body: string
): boolean => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');
  
  return hash === signature;
};

export default {
  initializeTransaction,
  verifyTransaction,
  createPlan,
  createSubscription,
  disableSubscription,
  fetchSubscription,
  verifyWebhook,
  PLANS,
  PAYSTACK_PUBLIC_KEY,
};
