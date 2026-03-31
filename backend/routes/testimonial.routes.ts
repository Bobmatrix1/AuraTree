/**
 * Testimonial Routes
 * Handles user reviews and testimonials
 */

import { Router } from 'express';
import { getTestimonials, submitTestimonial } from '../controllers/testimonial.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * Get public testimonials
 * GET /api/v1/testimonials
 */
router.get('/', getTestimonials);

/**
 * Submit a new testimonial (Authenticated)
 * POST /api/v1/testimonials
 */
router.post('/', verifyToken, upload.single('avatar'), submitTestimonial);

export default router;
