/**
 * Authentication Routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  verifyEmail,
  logout,
  deleteAccount,
} from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be 2-50 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const emailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors,
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', verifyToken, getCurrentUser);
router.post('/refresh', verifyToken, refreshToken);
router.post('/forgot-password', emailValidation, forgotPassword);
router.post('/verify-email', emailValidation, verifyEmail);
router.post('/logout', verifyToken, logout);
router.delete('/account', verifyToken, deleteAccount);

export default router;
