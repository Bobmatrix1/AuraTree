/**
 * Aura Tree Routes
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createAuraTree,
  getAuraTreeBySlug,
  getMyAuraTree,
  updateAuraTree,
  updateSlug,
  uploadBackground,
  deleteAuraTree,
  getAnalytics,
  trackQRScan,
} from '../controllers/auraTree.controller';
import { verifyToken, optionalAuth } from '../middlewares/auth.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const createValidation = [
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]{3,50}$/)
    .withMessage('Slug must be 3-50 lowercase alphanumeric characters with hyphens'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name must be less than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  handleValidationErrors,
];

const updateValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  handleValidationErrors,
];

const slugValidation = [
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]{3,50}$/)
    .withMessage('Slug must be 3-50 lowercase alphanumeric characters with hyphens'),
  handleValidationErrors,
];

const idParamValidation = [
  param('id').notEmpty().withMessage('Aura Tree ID is required'),
  handleValidationErrors,
];

const slugParamValidation = [
  param('slug').notEmpty().withMessage('Slug is required'),
  handleValidationErrors,
];

// Public routes
router.get('/qr/:slug', trackQRScan);
router.get('/public/:slug', optionalAuth, slugParamValidation, getAuraTreeBySlug);

// Protected routes
router.post('/', verifyToken, createValidation, createAuraTree);
router.get('/me', verifyToken, getMyAuraTree);
router.put('/:id', verifyToken, idParamValidation, updateValidation, updateAuraTree);
router.put('/:id/slug', verifyToken, idParamValidation, slugValidation, updateSlug);
router.post('/:id/background', verifyToken, idParamValidation, uploadSingleImage('background'), uploadBackground);
router.delete('/:id', verifyToken, idParamValidation, deleteAuraTree);
router.get('/:id/analytics', verifyToken, idParamValidation, getAnalytics);

export default router;
