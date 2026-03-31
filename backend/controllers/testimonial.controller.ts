/**
 * Testimonial Controller
 * Handles user reviews and testimonials
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { asyncHandler, Errors } from '../middlewares/error.middleware';
import { uploadImage } from '../config/cloudinary';
import { sanitizeString } from '../utils/helpers';

/**
 * Get all approved testimonials
 * GET /api/v1/testimonials
 */
export const getTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const testimonialsSnapshot = await db
    .collection('testimonials')
    .where('status', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  const testimonials = testimonialsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.status(200).json({
    success: true,
    data: testimonials
  });
});

/**
 * Submit a new testimonial
 * POST /api/v1/testimonials
 */
export const submitTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { quote, name, role } = req.body;

  if (!userId) {
    throw Errors.Unauthorized('Authentication required to leave a review');
  }

  if (!quote || !name || !role) {
    throw Errors.BadRequest('Quote, name, and role are required');
  }

  let avatarUrl = '';
  
  // Handle image upload if provided
  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer, {
      folder: 'aura_tree/testimonials',
      publicId: `testimonial-${userId}-${Date.now()}`,
      transformation: {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face',
      },
    });
    avatarUrl = uploadResult.secure_url;
  }

  const testimonialData = {
    userId,
    quote: sanitizeString(quote).substring(0, 300),
    name: sanitizeString(name).substring(0, 50),
    role: sanitizeString(role).substring(0, 50),
    avatar: avatarUrl || '/avatars/default.jpg',
    status: 'approved', // Auto-approve for now, or 'pending' if moderation is needed
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('testimonials').add(testimonialData);

  res.status(201).json({
    success: true,
    message: 'Testimonial submitted successfully',
    data: {
      id: docRef.id,
      ...testimonialData
    }
  });
});

export default {
  getTestimonials,
  submitTestimonial
};
