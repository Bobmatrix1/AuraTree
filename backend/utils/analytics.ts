/**
 * Analytics Utility
 * Helpers for detecting device type and geolocation from requests
 */

import { Request } from 'express';

export interface VisitorInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
}

/**
 * Detect device type from User-Agent string
 */
export const detectDevice = (userAgent: string): 'mobile' | 'tablet' | 'desktop' => {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Get visitor info from request headers
 * Handles common proxy headers (Cloudflare, Render, etc.)
 */
export const getVisitorInfo = (req: Request): VisitorInfo => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // IP Detection
  const ip = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || 'unknown').split(',')[0].trim();

  // Geolocation Detection (prioritizing Cloudflare/Render headers if available)
  // Render and Cloudflare often provide these
  const country = req.headers['cf-ipcountry'] as string || req.headers['x-vercel-ip-country'] as string || 'Unknown';
  const region = req.headers['cf-region'] as string || req.headers['x-vercel-ip-region'] as string || 'Unknown';
  const city = req.headers['cf-ipcity'] as string || req.headers['x-vercel-ip-city'] as string || 'Unknown';

  return {
    ip,
    country,
    region,
    city,
    device: detectDevice(userAgent),
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent),
  };
};

function extractBrowser(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

function extractOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Other';
}
