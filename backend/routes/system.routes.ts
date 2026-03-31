/**
 * System Routes
 * Publicly accessible system information
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { getSystemSettings } from '../utils/systemConfig';
import { asyncHandler, handleValidationErrors } from '../middlewares/error.middleware';
import { db } from '../config/firebase';

const router = Router();

/**
 * Newsletter Subscription
 * POST /api/v1/system/newsletter/subscribe
 */
router.post(
  '/newsletter/subscribe',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const emailLower = email.toLowerCase();

    // Check if already exists
    const subQuery = await db.collection('subscribers').where('email', '==', emailLower).get();
    
    if (!subQuery.empty) {
      res.status(200).json({ success: true, message: 'You are already subscribed!' });
      return;
    }

    // Add to database
    await db.collection('subscribers').add({
      email: emailLower,
      subscribedAt: new Date().toISOString(),
      isActive: true,
      source: 'blog_newsletter'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to Aura Insights!'
    });
  })
);

/**
 * Get public system settings (Pricing, Platform Name, etc.)
 * GET /api/v1/system/settings
 */
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await getSystemSettings();
  
  // Only return safe public settings
  const publicSettings = {
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    registrationEnabled: settings.registrationEnabled,
    proPrice: settings.proPrice,
    teamsPrice: settings.teamsPrice,
    maintenanceMode: settings.maintenanceMode
  };

  res.status(200).json({
    success: true,
    data: publicSettings
  });
}));

export default router;
