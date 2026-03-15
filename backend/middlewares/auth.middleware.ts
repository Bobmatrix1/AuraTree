/**
 * Authentication Middleware
 * Verifies Firebase ID tokens and protects private routes
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

/**
 * Verify Token (supports both custom JWT and Firebase ID Token)
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format',
      });
      return;
    }

    // 1. Try verifying as our custom JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aura-tree-secret') as any;
      req.userId = decoded.uid;
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        isAdmin: decoded.isAdmin || false
      };
      return next();
    } catch (jwtError) {
      // If not a valid custom JWT, try Firebase ID Token
    }

    // 2. Support demo-token for local development/testing
    if (token === 'demo-token' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
      req.userId = 'demo-admin-id';
      req.user = {
        uid: 'demo-admin-id',
        email: process.env.ADMIN_EMAIL || 'admin@auratree.com',
        isAdmin: true,
        email_verified: true,
      };
      return next();
    }

    // 3. Verify as Firebase ID Token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request
    req.user = decodedToken;
    req.userId = decodedToken.uid;

    next();
  } catch (error: any) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
    });
  }
};

/**
 * Optional authentication - doesn't require token but attaches user if present
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];

      // Support demo-token for local development/testing
      if (token === 'demo-token' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
        req.userId = 'demo-admin-id';
        req.user = {
          uid: 'demo-admin-id',
          email: process.env.ADMIN_EMAIL || 'admin@auratree.com',
          email_verified: true,
          auth_time: Math.floor(Date.now() / 1000),
          iss: 'https://securetoken.google.com/demo',
          aud: 'demo',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          sub: 'demo-admin-id',
          firebase: {
            identities: {},
            sign_in_provider: 'password'
          }
        } as any;
        return next();
      }

      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      req.userId = decodedToken.uid;
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

/**
 * Check if user is admin
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
      return;
    }

    // Check if user has admin claim or is in the admin email list
    const adminEmails = process.env.ADMIN_EMAIL?.split(',') || [];
    const isEmailAdmin = adminEmails.includes(req.user.email || '');

    if (isEmailAdmin) {
      return next();
    }

    // Support demo admin
    if (req.userId === 'demo-admin-id') {
      return next();
    }

    // Check Firestore for isAdmin field
    const { db } = require('../config/firebase');
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    if (userDoc.exists && userDoc.data()?.isAdmin === true) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required',
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Check if user owns the resource
 */
export const requireOwnership = (
  getUserIdFromParams: (req: Request) => string
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Authentication required',
        });
        return;
      }

      const resourceUserId = getUserIdFromParams(req);

      if (req.userId !== resourceUserId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this resource',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

export default {
  verifyToken,
  optionalAuth,
  requireAdmin,
  requireOwnership,
};
