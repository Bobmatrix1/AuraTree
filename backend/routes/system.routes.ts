/**
 * System Routes
 * Publicly accessible system information
 */

import { Router } from 'express';
import { getSystemSettings } from '../utils/systemConfig';
import { asyncHandler } from '../middlewares/error.middleware';

const router = Router();

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
