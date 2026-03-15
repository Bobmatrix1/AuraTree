/**
 * QR Code Generation Utility
 * Generates QR codes for Aura Tree public pages
 */

import QRCode from 'qrcode';
import { cloudinary } from '../config/cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// QR Code configuration
const QR_CONFIG = {
  size: parseInt(process.env.QR_CODE_SIZE || '500'),
  margin: parseInt(process.env.QR_CODE_MARGIN || '2'),
  colorDark: process.env.QR_CODE_COLOR_DARK || '#070913',
  colorLight: process.env.QR_CODE_COLOR_LIGHT || '#F4F6FF',
};

export interface QRCodeResult {
  url: string;
  publicId: string;
  dataUrl?: string;
}

/**
 * Generate a QR code for an Aura Tree URL
 */
export const generateQRCode = async (
  auraTreeUrl: string,
  slug: string
): Promise<QRCodeResult> => {
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(auraTreeUrl, {
      width: QR_CONFIG.size,
      margin: QR_CONFIG.margin,
      color: {
        dark: QR_CONFIG.colorDark,
        light: QR_CONFIG.colorLight,
      },
      errorCorrectionLevel: 'H',
    });

    // Upload to Cloudinary
    const publicId = `qr-codes/${slug}`;
    const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
      folder: 'aura_tree/qr-codes',
      public_id: slug,
      resource_type: 'image',
      overwrite: true,
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      dataUrl: qrDataUrl,
    };
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code buffer (for direct download)
 */
export const generateQRCodeBuffer = async (
  auraTreeUrl: string,
  format: 'png' | 'svg' | 'pdf' = 'png'
): Promise<Buffer> => {
  try {
    if (format === 'svg') {
      const svgString = await QRCode.toString(auraTreeUrl, {
        type: 'svg',
        width: QR_CONFIG.size,
        margin: QR_CONFIG.margin,
        color: {
          dark: QR_CONFIG.colorDark,
          light: QR_CONFIG.colorLight,
        },
        errorCorrectionLevel: 'H',
      });
      return Buffer.from(svgString);
    }

    const buffer = await QRCode.toBuffer(auraTreeUrl, {
      type: format === 'pdf' ? 'png' : format,
      width: QR_CONFIG.size,
      margin: QR_CONFIG.margin,
      color: {
        dark: QR_CONFIG.colorDark,
        light: QR_CONFIG.colorLight,
      },
      errorCorrectionLevel: 'H',
    });

    return buffer;
  } catch (error) {
    console.error('QR Code buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

/**
 * Generate QR code with custom styling
 */
export const generateStyledQRCode = async (
  auraTreeUrl: string,
  options: {
    color?: string;
    backgroundColor?: string;
    logoUrl?: string;
  }
): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(auraTreeUrl, {
      width: QR_CONFIG.size,
      margin: QR_CONFIG.margin,
      color: {
        dark: options.color || QR_CONFIG.colorDark,
        light: options.backgroundColor || QR_CONFIG.colorLight,
      },
      errorCorrectionLevel: 'H',
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Styled QR Code generation error:', error);
    throw new Error('Failed to generate styled QR code');
  }
};

/**
 * Delete QR code from Cloudinary
 */
export const deleteQRCode = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ QR Code deleted: ${publicId}`);
  } catch (error) {
    console.error('QR Code deletion error:', error);
    throw new Error('Failed to delete QR code');
  }
};

/**
 * Get Aura Tree tracking URL for QR codes
 */
export const getAuraTreeUrl = (slug: string): string => {
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  return `${apiUrl}/api/v1/auratree/qr/${slug.toLowerCase()}`;
};

export default {
  generateQRCode,
  generateQRCodeBuffer,
  generateStyledQRCode,
  deleteQRCode,
  getAuraTreeUrl,
  QR_CONFIG,
};
