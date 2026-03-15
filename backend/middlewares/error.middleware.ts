/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

import { Request, Response, NextFunction } from 'express';

// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const Errors = {
  BadRequest: (message: string = 'Bad request') =>
    new ApiError(message, 400),
  Unauthorized: (message: string = 'Unauthorized') =>
    new ApiError(message, 401),
  Forbidden: (message: string = 'Forbidden') =>
    new ApiError(message, 403),
  NotFound: (message: string = 'Resource not found') =>
    new ApiError(message, 404),
  Conflict: (message: string = 'Resource already exists') =>
    new ApiError(message, 409),
  Validation: (message: string = 'Validation failed') =>
    new ApiError(message, 422),
  Internal: (message: string = 'Internal server error') =>
    new ApiError(message, 500),
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let stack: string | undefined;

  // Check if it's our custom API error
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
  } else if (err.name === 'ValidationError') {
    // Mongoose/Firestore validation error
    statusCode = 422;
    message = err.message;
  } else if (err.name === 'CastError') {
    // Invalid ObjectId
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 'auth/user-not-found') {
    // Firebase auth error
    statusCode = 404;
    message = 'User not found';
  } else if (err.code === 'auth/email-already-exists') {
    statusCode = 409;
    message = 'Email already exists';
  } else if (err.code === 'auth/invalid-email') {
    statusCode = 400;
    message = 'Invalid email format';
  } else if (err.code === 'auth/weak-password') {
    statusCode = 400;
    message = 'Password is too weak';
  } else if (err.code === 'permission-denied') {
    // Firestore permission error
    statusCode = 403;
    message = 'Permission denied';
  } else if (err.code === 'not-found') {
    // Firestore not found error
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'already-exists') {
    // Firestore already exists error
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

export default {
  ApiError,
  Errors,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleValidationErrors,
};
