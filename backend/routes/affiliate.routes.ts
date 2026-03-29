/**
 * Affiliate Routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerAffiliate,
  getAffiliateData,
  getAffiliateStats,
  getReferrals,
  requestWithdrawal,
  updateBankDetails,
} from '../controllers/affiliate.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('bankName').notEmpty().withMessage('Bank name is required'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  handleValidationErrors,
];

const withdrawalValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  handleValidationErrors,
];

const bankDetailsValidation = [
  body('bankName').notEmpty().withMessage('Bank name is required'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  handleValidationErrors,
];

// Routes
router.post('/register', verifyToken, registerValidation, registerAffiliate);
router.get('/me', verifyToken, getAffiliateData);
router.get('/stats', verifyToken, getAffiliateStats);
router.get('/referrals', verifyToken, getReferrals);
router.post('/withdraw', verifyToken, withdrawalValidation, requestWithdrawal);
router.put('/bank-details', verifyToken, bankDetailsValidation, updateBankDetails);

export default router;
