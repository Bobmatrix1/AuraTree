/**
 * File Upload Middleware
 * Handles image uploads using multer
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

// Configure multer storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  req: Request,
  file: any,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      )
    );
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1, // Only 1 file per upload
  },
});

/**
 * Single image upload middleware
 */
export const uploadSingleImage = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        // Other errors
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      next();
    });
  };
};

/**
 * Multiple images upload middleware
 */
export const uploadMultipleImages = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB per file.',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files.`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      next();
    });
  };
};

/**
 * Parse file from request
 */
export const getUploadedFile = (
  req: Request
): any | undefined => {
  return req.file;
};

/**
 * Parse multiple files from request
 */
export const getUploadedFiles = (
  req: Request
): any[] | undefined => {
  return req.files as any[];
};

export default {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  getUploadedFile,
  getUploadedFiles,
};
