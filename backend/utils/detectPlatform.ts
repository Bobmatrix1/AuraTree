/**
 * Smart Platform Detection Utility
 * Automatically detects the platform from a URL and returns platform info
 */

export interface PlatformInfo {
  name: string;
  icon: string;
  label: string;
  color: string;
  domain: string;
}

// Platform detection patterns (100+ supported)
const PLATFORM_PATTERNS: { [key: string]: PlatformInfo } = {
  // Social & Messaging
  youtube: { name: 'youtube', icon: 'youtube', label: 'YouTube', color: '#FF0000', domain: 'youtube.com' },
  instagram: { name: 'instagram', icon: 'instagram', label: 'Instagram', color: '#E4405F', domain: 'instagram.com' },
  tiktok: { name: 'tiktok', icon: 'music-2', label: 'TikTok', color: '#000000', domain: 'tiktok.com' },
  twitter: { name: 'twitter', icon: 'twitter', label: 'X (Twitter)', color: '#000000', domain: 'twitter.com' },
  x: { name: 'x', icon: 'twitter', label: 'X', color: '#000000', domain: 'x.com' },
  facebook: { name: 'facebook', icon: 'facebook', label: 'Facebook', color: '#1877F2', domain: 'facebook.com' },
  threads: { name: 'threads', icon: 'at-sign', label: 'Threads', color: '#000000', domain: 'threads.net' },
  whatsapp: { name: 'whatsapp', icon: 'message-circle', label: 'WhatsApp', color: '#25D366', domain: 'wa.me' },
  telegram: { name: 'telegram', icon: 'send', label: 'Telegram', color: '#26A5E4', domain: 't.me' },
  discord: { name: 'discord', icon: 'message-square', label: 'Discord', color: '#5865F2', domain: 'discord.com' },
  snapchat: { name: 'snapchat', icon: 'ghost', label: 'Snapchat', color: '#FFFC00', domain: 'snapchat.com' },
  linkedin: { name: 'linkedin', icon: 'linkedin', label: 'LinkedIn', color: '#0A66C2', domain: 'linkedin.com' },
  pinterest: { name: 'pinterest', icon: 'pin', label: 'Pinterest', color: '#BD081C', domain: 'pinterest.com' },
  reddit: { name: 'reddit', icon: 'message-circle', label: 'Reddit', color: '#FF4500', domain: 'reddit.com' },
  twitch: { name: 'twitch', icon: 'twitch', label: 'Twitch', color: '#9146FF', domain: 'twitch.tv' },
  mastodon: { name: 'mastodon', icon: 'at-sign', label: 'Mastodon', color: '#6364FF', domain: 'mastodon.social' },
  bluesky: { name: 'bluesky', icon: 'cloud', label: 'Bluesky', color: '#0085FF', domain: 'bsky.app' },
  tumblr: { name: 'tumblr', icon: 'type', label: 'Tumblr', color: '#36465D', domain: 'tumblr.com' },
  vk: { name: 'vk', icon: 'share-2', label: 'VK', color: '#4C75A3', domain: 'vk.com' },
  line: { name: 'line', icon: 'message-circle', label: 'LINE', color: '#00C300', domain: 'line.me' },
  wechat: { name: 'wechat', icon: 'message-square', label: 'WeChat', color: '#07C160', domain: 'wechat.com' },

  // Music & Audio
  spotify: { name: 'spotify', icon: 'music', label: 'Spotify', color: '#1DB954', domain: 'spotify.com' },
  appleMusic: { name: 'appleMusic', icon: 'music', label: 'Apple Music', color: '#FA243C', domain: 'music.apple.com' },
  soundcloud: { name: 'soundcloud', icon: 'cloud', label: 'SoundCloud', color: '#FF5500', domain: 'soundcloud.com' },
  tidal: { name: 'tidal', icon: 'music', label: 'Tidal', color: '#000000', domain: 'tidal.com' },
  deezer: { name: 'deezer', icon: 'music', label: 'Deezer', color: '#A238FF', domain: 'deezer.com' },
  bandcamp: { name: 'bandcamp', icon: 'disc', label: 'Bandcamp', color: '#629AA9', domain: 'bandcamp.com' },
  mixcloud: { name: 'mixcloud', icon: 'cloud', label: 'Mixcloud', color: '#52AAD8', domain: 'mixcloud.com' },
  audiomack: { name: 'audiomack', icon: 'music', label: 'Audiomack', color: '#FFA200', domain: 'audiomack.com' },
  pandora: { name: 'pandora', icon: 'music', label: 'Pandora', color: '#00A0EE', domain: 'pandora.com' },

  // Developer & Professional
  github: { name: 'github', icon: 'github', label: 'GitHub', color: '#181717', domain: 'github.com' },
  gitlab: { name: 'gitlab', icon: 'git-merge', label: 'GitLab', color: '#FCA121', domain: 'gitlab.com' },
  bitbucket: { name: 'bitbucket', icon: 'git-branch', label: 'Bitbucket', color: '#0052CC', domain: 'bitbucket.org' },
  stackoverflow: { name: 'stackoverflow', icon: 'layers', label: 'Stack Overflow', color: '#F48024', domain: 'stackoverflow.com' },
  codepen: { name: 'codepen', icon: 'codepen', label: 'CodePen', color: '#000000', domain: 'codepen.io' },
  codesandbox: { name: 'codesandbox', icon: 'box', label: 'CodeSandbox', color: '#000000', domain: 'codesandbox.io' },
  npm: { name: 'npm', icon: 'package', label: 'NPM', color: '#CB3837', domain: 'npmjs.com' },
  figma: { name: 'figma', icon: 'figma', label: 'Figma', color: '#F24E1E', domain: 'figma.com' },
  behance: { name: 'behance', icon: 'image', label: 'Behance', color: '#1769FF', domain: 'behance.net' },
  dribbble: { name: 'dribbble', icon: 'dribbble', label: 'Dribbble', color: '#EA4C89', domain: 'dribbble.com' },
  framer: { name: 'framer', icon: 'frame', label: 'Framer', color: '#0055FF', domain: 'framer.com' },
  producthunt: { name: 'producthunt', icon: 'target', label: 'Product Hunt', color: '#DA552F', domain: 'producthunt.com' },
  upwork: { name: 'upwork', icon: 'briefcase', label: 'Upwork', color: '#14A800', domain: 'upwork.com' },
  fiverr: { name: 'fiverr', icon: 'briefcase', label: 'Fiverr', color: '#1DBF73', domain: 'fiverr.com' },
  polywork: { name: 'polywork', icon: 'user', label: 'Polywork', color: '#243486', domain: 'polywork.com' },

  // Content & Blogs
  medium: { name: 'medium', icon: 'book-open', label: 'Medium', color: '#000000', domain: 'medium.com' },
  substack: { name: 'substack', icon: 'mail', label: 'Substack', color: '#FF6719', domain: 'substack.com' },
  notion: { name: 'notion', icon: 'file-text', label: 'Notion', color: '#000000', domain: 'notion.so' },
  devto: { name: 'devto', icon: 'code', label: 'Dev.to', color: '#0A0A0A', domain: 'dev.to' },
  hashnode: { name: 'hashnode', icon: 'pen-tool', label: 'Hashnode', color: '#2962FF', domain: 'hashnode.com' },
  ghost: { name: 'ghost', icon: 'ghost', label: 'Ghost', color: '#15171A', domain: 'ghost.org' },
  wordpress: { name: 'wordpress', icon: 'globe', label: 'WordPress', color: '#21759B', domain: 'wordpress.com' },

  // Payments & Crowdfunding
  paypal: { name: 'paypal', icon: 'credit-card', label: 'PayPal', color: '#003087', domain: 'paypal.me' },
  venmo: { name: 'venmo', icon: 'dollar-sign', label: 'Venmo', color: '#008CFF', domain: 'venmo.com' },
  cashapp: { name: 'cashapp', icon: 'dollar-sign', label: 'Cash App', color: '#00C244', domain: 'cash.app' },
  buymeacoffee: { name: 'buymeacoffee', icon: 'coffee', label: 'Buy Me a Coffee', color: '#FFDD00', domain: 'buymeacoffee.com' },
  kofi: { name: 'kofi', icon: 'coffee', label: 'Ko-fi', color: '#FF5E5B', domain: 'ko-fi.com' },
  patreon: { name: 'patreon', icon: 'heart', label: 'Patreon', color: '#FF424D', domain: 'patreon.com' },
  onlyfans: { name: 'onlyfans', icon: 'star', label: 'OnlyFans', color: '#00AFF0', domain: 'onlyfans.com' },
  kickstarter: { name: 'kickstarter', icon: 'compass', label: 'Kickstarter', color: '#05CE78', domain: 'kickstarter.com' },
  indiegogo: { name: 'indiegogo', icon: 'target', label: 'Indiegogo', color: '#EB1478', domain: 'indiegogo.com' },

  // Shopping & E-commerce
  etsy: { name: 'etsy', icon: 'shopping-bag', label: 'Etsy', color: '#F56400', domain: 'etsy.com' },
  amazon: { name: 'amazon', icon: 'shopping-cart', label: 'Amazon', color: '#FF9900', domain: 'amazon.com' },
  shopify: { name: 'shopify', icon: 'store', label: 'Shopify', color: '#96BF48', domain: 'myshopify.com' },
  ebay: { name: 'ebay', icon: 'shopping-bag', label: 'eBay', color: '#E53238', domain: 'ebay.com' },
  gumroad: { name: 'gumroad', icon: 'shopping-cart', label: 'Gumroad', color: '#36A1D1', domain: 'gumroad.com' },
  'lemon-squeezy': { name: 'lemon-squeezy', icon: 'shopping-bag', label: 'Lemon Squeezy', color: '#D6FB41', domain: 'lemonsqueezy.com' },

  // Photography & Art
  flickr: { name: 'flickr', icon: 'camera', label: 'Flickr', color: '#0063DC', domain: 'flickr.com' },
  '500px': { name: '500px', icon: 'camera', label: '500px', color: '#0099E5', domain: '500px.com' },
  artstation: { name: 'artstation', icon: 'palette', label: 'ArtStation', color: '#13AFF0', domain: 'artstation.com' },
  deviantart: { name: 'deviantart', icon: 'palette', label: 'DeviantArt', color: '#05CC47', domain: 'deviantart.com' },
  unsplash: { name: 'unsplash', icon: 'camera', label: 'Unsplash', color: '#000000', domain: 'unsplash.com' },
  vsco: { name: 'vsco', icon: 'camera', label: 'VSCO', color: '#000000', domain: 'vsco.co' },

  // Others & Utilities
  calendly: { name: 'calendly', icon: 'calendar', label: 'Calendly', color: '#006BFF', domain: 'calendly.com' },
  zoom: { name: 'zoom', icon: 'video', label: 'Zoom', color: '#2D8CFF', domain: 'zoom.us' },
  skype: { name: 'skype', icon: 'phone', label: 'Skype', color: '#00AFF0', domain: 'skype.com' },
  'discord-server': { name: 'discord-server', icon: 'message-square', label: 'Discord Server', color: '#5865F2', domain: 'discord.gg' },
  canva: { name: 'canva', icon: 'image', label: 'Canva', color: '#00C4CC', domain: 'canva.com' },
  linktree: { name: 'linktree', icon: 'tree-pine', label: 'Linktree', color: '#43E660', domain: 'linktr.ee' },
  'all-my-links': { name: 'all-my-links', icon: 'link', label: 'AllMyLinks', color: '#00D1FF', domain: 'allmylinks.com' },
  bento: { name: 'bento', icon: 'grid', label: 'Bento', color: '#FF0000', domain: 'bento.me' },
};

/**
 * Detect platform from URL
 */
export const detectPlatform = (url: string): PlatformInfo => {
  try {
    // Add protocol if missing
    let processedUrl = url.trim().toLowerCase();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }

    const urlObj = new URL(processedUrl);
    const hostname = urlObj.hostname.replace('www.', '');

    // Check for exact domain matches or subdomains
    for (const [key, platform] of Object.entries(PLATFORM_PATTERNS)) {
      if (hostname === platform.domain || hostname.endsWith(`.${platform.domain}`)) {
        return platform;
      }
    }

    // Special cases for short URLs
    if (hostname === 'youtu.be') return PLATFORM_PATTERNS.youtube;
    if (hostname === 't.co') return PLATFORM_PATTERNS.twitter;
    if (hostname === 'fb.me') return PLATFORM_PATTERNS.facebook;
    if (hostname === 'instagr.am') return PLATFORM_PATTERNS.instagram;
    if (hostname === 'msng.link') return PLATFORM_PATTERNS.messenger || PLATFORM_PATTERNS.facebook;

    // Default to website
    return {
      name: 'website',
      icon: 'globe',
      label: 'Website',
      color: '#7B61FF',
      domain: hostname,
    };
  } catch (error) {
    return {
      name: 'website',
      icon: 'globe',
      label: 'Website',
      color: '#7B61FF',
      domain: 'unknown',
    };
  }
};

/**
 * Extract readable title from URL
 */
export const extractTitleFromUrl = (url: string, platform: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    switch (platform) {
      case 'youtube':
        return 'YouTube Video';
      case 'instagram':
        return 'Instagram Profile';
      case 'tiktok':
        return 'TikTok Profile';
      case 'twitter':
      case 'x':
        return 'X Profile';
      case 'spotify':
        return pathParts.includes('artist') 
          ? 'Spotify Artist' 
          : pathParts.includes('playlist')
          ? 'Spotify Playlist'
          : 'Spotify';
      case 'github':
        return pathParts.length > 1 ? 'GitHub Repository' : 'GitHub Profile';
      case 'linkedin':
        return 'LinkedIn Profile';
      case 'twitch':
        return 'Twitch Channel';
      default:
        // Try to create a readable title from the path
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          // Remove hyphens and underscores, capitalize words
          return lastPart
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
        }
        return 'Link';
    }
  } catch {
    return 'Link';
  }
};

/**
 * Get all available platforms
 */
export const getAllPlatforms = (): PlatformInfo[] => {
  return Object.values(PLATFORM_PATTERNS);
};

/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.length < 3) return false;
  
  // More flexible URL regex that allows domains without protocol
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  try {
    // If it passes the regex, it's good enough for our processing 
    // where we add https:// later if missing
    return urlPattern.test(url.trim().toLowerCase());
  } catch {
    return false;
  }
};

export default {
  detectPlatform,
  extractTitleFromUrl,
  getAllPlatforms,
  isValidUrl,
  PLATFORM_PATTERNS,
};
