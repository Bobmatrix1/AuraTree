/**
 * Cloudinary Configuration
 * Handles image uploads, optimizations, and transformations
 */

import { v2 as cloudinary, ConfigOptions, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration interface
interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  upload_preset: string;
  folder: string;
}

// Initialize Cloudinary
const initializeCloudinary = (): void => {
  const config: ConfigOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true,
  };

  cloudinary.config(config);
  console.log('✅ Cloudinary configured');
};

initializeCloudinary();

// Upload preset and folder from environment
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'aura_tree_uploads';
const FOLDER = process.env.CLOUDINARY_FOLDER || 'aura_tree';

/**
 * Upload an image buffer to Cloudinary
 */
export const uploadImage = async (
  fileBuffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: object;
  } = {}
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || FOLDER,
        public_id: options.publicId,
        resource_type: 'image',
        transformation: options.transformation || [
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed with no result'));
        }
      }
    );

    // Convert buffer to stream and pipe to upload
    const { Readable } = require('stream');
    const readableStream = Readable.from([fileBuffer]);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload a base64 image to Cloudinary
 */
export const uploadBase64Image = async (
  base64String: string,
  options: {
    folder?: string;
    publicId?: string;
  } = {}
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: options.folder || FOLDER,
      public_id: options.publicId,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
      overwrite: true,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    if (!publicId) return { result: 'not_found' };
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Cloudinary destroy result for ${publicId}:`, result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Generate optimized image URL with transformations
 */
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    secure: true,
  });
};

/**
 * Generate avatar URL with circular crop
 */
export const getAvatarUrl = (publicId: string, size: number = 200): string => {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    radius: 'max',
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  });
};

/**
 * Generate background image URL
 */
export const getBackgroundUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    quality: 'auto:eco',
    fetch_format: 'auto',
    secure: true,
  });
};

export default cloudinary;
export { cloudinary };
