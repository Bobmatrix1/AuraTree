/**
 * Admin Routes
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getStats,
  getUsers,
  getUserDetails,
  updateUser,
  cancelUserSubscription,
  deleteUser,
  getAuraTrees,
  getLinks,
  deleteLink,
  getPayments,
  getAdvancedAnalytics,
  createLog,
  getLogs,
  getSettings,
  updateSettings,
  getAdminTestimonials,
  deleteTestimonial,
  getSubscribers,
  deleteSubscriber,
  sendNewsletter,
} from '../controllers/admin.controller';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/error.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

// Validation middleware
const updateUserValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  handleValidationErrors,
];

const createLogValidation = [
  body('action').notEmpty().withMessage('Action is required'),
  body('details').optional().isObject(),
  handleValidationErrors,
];

import {
  getAllAffiliates,
  getAffiliateReferralsAdmin,
  getAllWithdrawals,
  updateWithdrawalStatus
} from '../controllers/adminAffiliate.controller';

// Dashboard
router.get('/stats', getStats);
router.get('/analytics', getAdvancedAnalytics);

// Affiliates
router.get('/affiliates', getAllAffiliates);
router.get('/affiliates/:id/referrals', getAffiliateReferralsAdmin);
router.get('/withdrawals', getAllWithdrawals);
router.patch('/withdrawals/:id', updateWithdrawalStatus);

// Users
router.get('/users', getUsers);
router.get('/users/:id', param('id').notEmpty(), handleValidationErrors, getUserDetails);
router.put('/users/:id', param('id').notEmpty(), handleValidationErrors, updateUser);
router.post('/users/:id/cancel-subscription', param('id').notEmpty(), handleValidationErrors, cancelUserSubscription);
router.delete('/users/:id', param('id').notEmpty(), handleValidationErrors, deleteUser);

// Aura Trees
router.get('/auratrees', getAuraTrees);

// Links
router.get('/links', getLinks);
router.delete('/links/:treeId/:linkId', deleteLink);

// Payments
router.get('/payments', getPayments);

// Logs
router.get('/logs', getLogs);
router.post('/logs', createLogValidation, createLog);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Testimonials
router.get('/testimonials', getAdminTestimonials);
router.delete('/testimonials/:id', deleteTestimonial);

// Subscribers
router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);
router.post('/newsletter/send', sendNewsletter);

export default router;
