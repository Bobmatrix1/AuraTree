/**
 * User Routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  changeEmail,
  getUserByUsername,
  checkUsername,
} from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const updateProfileValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be 2-50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('username')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,30}$/)
    .withMessage('Username must be 3-30 characters, alphanumeric with underscores'),
  handleValidationErrors,
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  handleValidationErrors,
];

const changeEmailValidation = [
  body('newEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors,
];

// Protected routes
router.get('/me', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfileValidation, updateProfile);
router.post('/avatar', verifyToken, uploadSingleImage('avatar'), uploadAvatar);
router.delete('/avatar', verifyToken, deleteAvatar);
router.put('/password', verifyToken, changePasswordValidation, changePassword);
router.put('/email', verifyToken, changeEmailValidation, changeEmail);

// Public routes
router.get('/check-username/:username', checkUsername);
router.get('/:username', getUserByUsername);

export default router;
