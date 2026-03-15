/**
 * Payment Routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  initializePayment,
  verifyPayment,
  getSubscription,
  cancelSubscription,
  getPaymentHistory,
  handleWebhook,
} from '../controllers/payment.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const initializeValidation = [
  body('plan')
    .trim()
    .notEmpty()
    .withMessage('Plan is required')
    .isIn(['pro', 'teams'])
    .withMessage('Plan must be pro or teams'),
  handleValidationErrors,
];

const verifyValidation = [
  body('reference')
    .trim()
    .notEmpty()
    .withMessage('Payment reference is required'),
  handleValidationErrors,
];

// Protected routes
router.post('/initialize', verifyToken, initializeValidation, initializePayment);
router.post('/verify', verifyValidation, verifyPayment);
router.get('/subscription', verifyToken, getSubscription);
router.post('/cancel', verifyToken, cancelSubscription);
router.get('/history', verifyToken, getPaymentHistory);

// Webhook (public, signature verified in controller)
router.post('/webhook', handleWebhook);

export default router;
