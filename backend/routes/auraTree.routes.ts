/**
 * Aura Tree Routes
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createAuraTree,
  listMyAuraTrees,
  getAuraTreeById,
  getAuraTreeBySlug,
  getMyAuraTree,
  updateAuraTree,
  updateSlug,
  uploadBackground,
  deleteAuraTree,
  getAnalytics,
  trackQRScan,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
} from '../controllers/auraTree.controller';
import { verifyToken, optionalAuth } from '../middlewares/auth.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const createValidation = [
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
router.get('/list', verifyToken, listMyAuraTrees);
router.get('/me', verifyToken, getMyAuraTree);
router.get('/:id', verifyToken, idParamValidation, getAuraTreeById);
router.put('/:id', verifyToken, idParamValidation, updateValidation, updateAuraTree);
router.put('/:id/slug', verifyToken, idParamValidation, slugValidation, updateSlug);
router.post('/:id/background', verifyToken, idParamValidation, uploadSingleImage('background'), uploadBackground);
router.delete('/:id', verifyToken, idParamValidation, deleteAuraTree);
router.get('/:id/analytics', verifyToken, idParamValidation, getAnalytics);

// Team management routes
router.post('/:id/members', verifyToken, idParamValidation, [
  body('email').isEmail().withMessage('Valid email is required'),
  handleValidationErrors
], addTeamMember);
router.get('/:id/members', verifyToken, idParamValidation, getTeamMembers);
router.delete('/:id/members/:memberId', verifyToken, idParamValidation, removeTeamMember);

export default router;
