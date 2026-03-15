import { db } from '../config/firebase';

let cachedSettings: any = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // Cache for 1 minute

export const getSystemSettings = async () => {
  const now = Date.now();
  if (cachedSettings && (now - lastFetch < CACHE_TTL)) {
    return cachedSettings;
  }

  const defaultSettings = {
    platformName: 'Aura Tree',
    supportEmail: 'support@auratree.com',
    maintenanceMode: false,
    registrationEnabled: true,
    minPasswordLength: 6,
    maxLinksPerFreeUser: 5,
    proPrice: 1000,
    teamsPrice: 10000
  };

  try {
    const doc = await db.collection('config').doc('system').get();
    cachedSettings = doc.exists ? { ...defaultSettings, ...doc.data() } : defaultSettings;
    lastFetch = now;
    return cachedSettings;
  } catch (error) {
    return defaultSettings;
  }
};

export const clearSettingsCache = () => {
  cachedSettings = null;
  lastFetch = 0;
};
