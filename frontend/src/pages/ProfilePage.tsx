import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  SiYoutube, SiInstagram, SiTiktok, SiX, SiSpotify, 
  SiApplemusic, SiSoundcloud, SiTwitch, SiGithub, 
  SiFacebook, SiWhatsapp, SiTelegram, SiDiscord, SiSnapchat, 
  SiPinterest, SiReddit, SiMedium, SiSubstack, SiPatreon, 
  SiBuymeacoffee, SiPaypal, SiVenmo, SiCashapp, SiOnlyfans, 
  SiKofi, SiEtsy, SiShopify, 
  SiBehance, SiFigma, SiNotion, SiCalendly, 
  SiLinktree, SiThreads, SiGitlab, SiBitbucket, SiStackoverflow,
  SiCodepen, SiCodesandbox, SiNpm, SiFramer, SiProducthunt,
  SiUpwork, SiFiverr, SiPolywork, SiDevdotto, SiHashnode,
  SiGhost, SiWordpress, SiKickstarter, SiEbay,
  SiGumroad, SiFlickr, SiArtstation, SiDeviantart, SiUnsplash,
  SiVsco, SiZoom, SiCanva, SiBento
} from 'react-icons/si';
import { FaSkype, FaLinkedin, FaAmazon } from 'react-icons/fa6';
import { Link as LucideLinkIcon, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { API_V1_URL } from '../config/api';

const getPlatformDetails = (platform: string) => {
  const details: { [key: string]: { icon: any, color: string } } = {
    youtube: { icon: SiYoutube, color: '#FF0000' },
    instagram: { icon: SiInstagram, color: '#E4405F' },
    tiktok: { icon: SiTiktok, color: '#000000' },
    twitter: { icon: SiX, color: '#000000' },
    x: { icon: SiX, color: '#000000' },
    threads: { icon: SiThreads, color: '#000000' },
    spotify: { icon: SiSpotify, color: '#1DB954' },
    appleMusic: { icon: SiApplemusic, color: '#FA243C' },
    soundcloud: { icon: SiSoundcloud, color: '#FF5500' },
    twitch: { icon: SiTwitch, color: '#9146FF' },
    github: { icon: SiGithub, color: '#181717' },
    gitlab: { icon: SiGitlab, color: '#FC6D26' },
    linkedin: { icon: FaLinkedin, color: '#0A66C2' },
    facebook: { icon: SiFacebook, color: '#1877F2' },
    whatsapp: { icon: SiWhatsapp, color: '#25D366' },
    telegram: { icon: SiTelegram, color: '#26A5E4' },
    discord: { icon: SiDiscord, color: '#5865F2' },
    snapchat: { icon: SiSnapchat, color: '#FFFC00' },
    pinterest: { icon: SiPinterest, color: '#BD081C' },
    reddit: { icon: SiReddit, color: '#FF4500' },
    medium: { icon: SiMedium, color: '#000000' },
    substack: { icon: SiSubstack, color: '#FF6719' },
    patreon: { icon: SiPatreon, color: '#FF424D' },
    buymeacoffee: { icon: SiBuymeacoffee, color: '#FFDD00' },
    paypal: { icon: SiPaypal, color: '#003087' },
    venmo: { icon: SiVenmo, color: '#008CFF' },
    cashapp: { icon: SiCashapp, color: '#00C244' },
    onlyfans: { icon: SiOnlyfans, color: '#00AFF0' },
    kofi: { icon: SiKofi, color: '#FF5E5B' },
    etsy: { icon: SiEtsy, color: '#F56400' },
    amazon: { icon: FaAmazon, color: '#FF9900' },
    shopify: { icon: SiShopify, color: '#96BF48' },
    behance: { icon: SiBehance, color: '#1769FF' },
    figma: { icon: SiFigma, color: '#F24E1E' },
    notion: { icon: SiNotion, color: '#000000' },
    calendly: { icon: SiCalendly, color: '#006BFF' },
    linktree: { icon: SiLinktree, color: '#43E660' },
    canva: { icon: SiCanva, color: '#00C4CC' },
    bento: { icon: SiBento, color: '#FF0000' },
    skype: { icon: FaSkype, color: '#00AFF0' },
  };

  const platformLower = platform.toLowerCase();
  return details[platformLower] || { icon: LucideLinkIcon, color: '#7B61FF' };
};

const PlatformIcon = ({ platform, className = "w-6 h-6", useColor = false }: { platform: string, className?: string, useColor?: boolean }) => {
  const { icon: Icon, color } = getPlatformDetails(platform);
  
  const sizeMap: { [key: string]: number } = {
    "w-4 h-4": 16,
    "w-5 h-5": 20,
    "w-6 h-6": 24,
    "w-8 h-8": 32,
  };
  const size = sizeMap[className] || 24;

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size} color={useColor ? color : 'currentColor'} />
    </div>
  );
};

const ProfilePage = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_V1_URL}/auratree/public/${slug}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleLinkClick = async (linkId: string, url: string) => {
    // Fire and forget tracking
    fetch(`${API_V1_URL}/links/${linkId}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auraTreeId: data.id })
    }).catch(console.error);

    // Navigate
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aura-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-aura-violet animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-aura-navy flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-display font-bold text-aura-text mb-4">404</h1>
        <p className="text-aura-text-secondary mb-8 text-lg">Aura Tree not found or is currently private.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary py-3 px-8 rounded-xl font-bold uppercase tracking-widest">Create Your Own</button>
      </div>
    );
  }

  const theme = data.theme || { background: 'linear-gradient(135deg, #070913 0%, #0B1025 50%, #070913 100%)', accentColor: '#7B61FF' };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center py-16 px-6 relative overflow-x-hidden"
      style={{ background: theme.background }}
    >
      <Helmet>
        <title>{data.displayName} | Aura Tree</title>
        <meta name="description" content={data.bio || `Check out ${data.displayName}'s Aura Tree profile.`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${data.displayName} | Aura Tree`} />
        <meta property="og:description" content={data.bio || `Check out ${data.displayName}'s Aura Tree profile.`} />
        <meta property="og:image" content={data.avatarUrl || 'https://auratree.link/logo-icon.png'} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={`${data.displayName} | Aura Tree`} />
        <meta property="twitter:description" content={data.bio || `Check out ${data.displayName}'s Aura Tree profile.`} />
        <meta property="twitter:image" content={data.avatarUrl || 'https://auratree.link/logo-icon.png'} />
      </Helmet>

      <div className="max-w-xl w-full flex flex-col items-center relative z-10">
        {/* Profile Header */}
        <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full p-0.5 mb-6 shadow-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.accentColor}, #00D9FF)` }}>
          <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center font-display font-bold text-3xl lg:text-4xl text-aura-text overflow-hidden">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
            ) : (
              (data.displayName || 'U').charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl lg:text-3xl text-aura-text text-center mb-2">{data.displayName}</h1>
        {data.bio && (
          <p className="text-sm lg:text-base text-aura-text-secondary text-center mb-10 max-w-sm leading-relaxed opacity-90">
            {data.bio}
          </p>
        )}

        {/* Links List */}
        <div className="w-full space-y-4 lg:space-y-5">
          {data.links?.map((link: any) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id, link.url)}
              className={`w-full p-4 lg:p-5 bg-white/[0.05] border border-white/10 flex items-center gap-4 shadow-xl backdrop-blur-md transition-all active:scale-[0.98] hover:bg-white/[0.08] hover:border-white/20 group ${theme.cardStyle || 'rounded-2xl'}`}
            >
              <div className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center flex-shrink-0 bg-white/5 ${theme.cardStyle === 'rounded-full' ? 'rounded-full' : theme.cardStyle === 'rounded-none' ? 'rounded-none' : 'rounded-xl'}`} style={{ color: getPlatformDetails(link.platform).color }}>
                <PlatformIcon platform={link.platform} className="w-6 h-6" useColor />
              </div>
              <span className="text-sm lg:text-base font-bold text-aura-text truncate flex-1 text-center pr-10 lg:pr-12 group-hover:translate-x-1 transition-transform">{link.title}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-col items-center gap-4 pb-12">
          <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default">
            <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
              <img src="/aura%20tree%20logo.png" className="w-full h-full object-contain scale-[2.8] invert dark:invert-0" alt="Aura Tree" />
            </div>
            <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] text-white">Created with Aura Tree</span>
          </div>
          
          <button 
            onClick={() => window.location.href = '/'} 
            className="group relative flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-aura-violet/50 py-3.5 px-8 sm:px-10 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,97,255,0.3)] active:scale-95 overflow-hidden"
          >
            <div className="w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img src="/aura%20tree%20logo.png" className="w-full h-full object-contain scale-[4.5] invert dark:invert-0" alt="" />
            </div>
            <span className="text-xs lg:text-sm font-bold text-aura-text group-hover:text-aura-violet transition-colors uppercase tracking-widest relative z-10 whitespace-nowrap">
              Create your own aura link
            </span>
            {/* Glow Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-aura-violet/0 via-aura-violet/10 to-aura-cyan/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfilePage;
