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
import affiliateRoutes from './routes/affiliate.routes';
import testimonialRoutes from './routes/testimonial.routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Create Express app
const app: Application = express();

// Security middleware - Highly relaxed for development on IP addresses
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: false, // EXPLICITLY DISABLE HSTS (HTTPS Force)
  referrerPolicy: { policy: 'no-referrer' },
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success' });
});

// API version prefix
const API_VERSION = '/api/v1';

// Register routes
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/affiliates`, affiliateRoutes);
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/auratree`, auraTreeRoutes);
app.use(`${API_VERSION}/links`, linkRoutes);
app.use(`${API_VERSION}/payments`, paymentRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/system`, systemRoutes);
app.use(`${API_VERSION}/testimonials`, testimonialRoutes);

// Serve Public Assets
app.use(express.static(path.join(__dirname, 'public')));

// Serve Admin Dashboard
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get(['/admin', '/admin/'], (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
