/**
 * Link Routes
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addLink,
  getLinks,
  updateLink,
  deleteLink,
  reorderLinks,
  trackClick,
  detectPlatformEndpoint,
} from '../controllers/link.controller';
import { verifyToken, optionalAuth } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// Validation middleware
const addLinkValidation = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ require_protocol: false })
    .withMessage('Valid URL is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('customTitle')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  handleValidationErrors,
];

const updateLinkValidation = [
  body('url')
    .optional()
    .trim()
    .isURL({ require_protocol: false }),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('isVisible')
    .optional()
    .isBoolean(),
  handleValidationErrors,
];

const reorderValidation = [
  body('auraTreeId').notEmpty().withMessage('Aura Tree ID is required'),
  body('linkOrders')
    .isArray()
    .withMessage('Link orders must be an array'),
  body('linkOrders.*.linkId')
    .notEmpty()
    .withMessage('Link ID is required'),
  body('linkOrders.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  handleValidationErrors,
];

const detectPlatformValidation = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required'),
  handleValidationErrors,
];

const trackClickValidation = [
  body('auraTreeId').notEmpty().withMessage('Aura Tree ID is required'),
  handleValidationErrors,
];

// Routes
router.post('/detect-platform', detectPlatformValidation, detectPlatformEndpoint);
router.post('/:id/click', trackClickValidation, trackClick);

// Protected routes
router.post('/auratree/:id/links', verifyToken, addLinkValidation, addLink);
router.get('/auratree/:id/links', optionalAuth, getLinks);
router.put('/:id', verifyToken, updateLinkValidation, updateLink);
router.delete('/:id', verifyToken, deleteLink);
router.patch('/reorder', verifyToken, reorderValidation, reorderLinks);

export default router;
