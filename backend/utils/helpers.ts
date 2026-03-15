/**
 * General Helper Utilities
 */

import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique slug
 */
export const generateSlug = (text: string): string => {
  const baseSlug = slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()\"'!:@]/g,
  });
  
  // Add random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
};

/**
 * Generate a unique username
 */
export const generateUsername = (displayName: string): string => {
  const baseName = slugify(displayName, {
    lower: true,
    strict: true,
  });
  
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${baseName}${randomSuffix}`;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Sanitize string for Firestore
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[\x00-\x1F\x7F]/g, '');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 */
export const isValidUsername = (username: string): boolean => {
  // Username must be 3-30 characters, alphanumeric with underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug: string): boolean => {
  // Slug must be 3-50 characters, lowercase alphanumeric with hyphens
  const slugRegex = /^[a-z0-9-]{3,50}$/;
  return slugRegex.test(slug);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Pick specific keys from an object
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Omit specific keys from an object
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete (result as any)[key];
  });
  return result;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  generateSlug,
  generateUsername,
  generateId,
  sanitizeString,
  isValidEmail,
  isValidUsername,
  isValidSlug,
  formatDate,
  formatNumber,
  truncateText,
  capitalizeWords,
  getInitials,
  deepClone,
  isEmptyObject,
  pick,
  omit,
  debounce,
  throttle,
};
