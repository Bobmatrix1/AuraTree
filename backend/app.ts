/**
 * Express App Configuration
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import auraTreeRoutes from './routes/auraTree.routes';
import linkRoutes from './routes/link.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import systemRoutes from './routes/system.routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { getSystemSettings } from './utils/systemConfig';

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://use.fontawesome.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://use.fontawesome.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      connectSrc: ["'self'", "https://*"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global System Check Middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getSystemSettings();
    
    // 1. Maintenance Mode Check
    // Skip check for admin routes so you don't lock yourself out
    if (settings.maintenanceMode && !req.path.startsWith('/api/v1/admin') && !req.path.startsWith('/admin')) {
      return res.status(503).json({
        success: false,
        message: `${settings.platformName} is currently undergoing maintenance. Please try again later.`,
        maintenance: true
      });
    }
    
    next();
  } catch (error) {
    next(); // Fallback to continue if settings fetch fails
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API version prefix
const API_VERSION = '/api/v1';

// Register routes
app.use(`${API_VERSION}/auth`, authLimiter, authRoutes);
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/auratree`, auraTreeRoutes);
app.use(`${API_VERSION}/links`, linkRoutes);
app.use(`${API_VERSION}/payments`, paymentRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/system`, systemRoutes);

// Serve Public Assets from root (logos, icons etc)
app.use(express.static(path.join(__dirname, 'public')));

// Serve Admin Dashboard
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/admin/*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Aura Tree API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    admin: '/admin',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
