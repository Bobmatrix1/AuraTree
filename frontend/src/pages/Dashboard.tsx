import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Link2 as LucideLink2, 
  Palette as LucidePalette, 
  BarChart3 as LucideBarChart3, 
  Settings as LucideSettings, 
  LogOut as LucideLogOut, 
  Plus as LucidePlus, 
  ExternalLink as LucideExternalLink, 
  GripVertical as LucideGripVertical, 
  Sparkles as LucideSparkles, 
  ArrowLeft as LucideArrowLeft, 
  QrCode as LucideQrCode, 
  Loader2 as LucideLoader2, 
  X as LucideX, 
  Globe as LucideGlobe, 
  Link as LucideLinkIcon, 
  Check as LucideCheck,
  Camera as LucideCamera,
  Copy as LucideCopy,
  Download as LucideDownload,
  Share2 as LucideShare,
  Zap as LucideZap,
  Shield as LucideShield,
  Eye as LucideEye,
  EyeOff as LucideEyeOff
} from 'lucide-react';
import { 
  SiYoutube, SiInstagram, SiTiktok, SiX, SiSpotify, 
  SiApplemusic, SiSoundcloud, SiTwitch, SiGithub, SiLinkedin, 
  SiFacebook, SiWhatsapp, SiTelegram, SiDiscord, SiSnapchat, 
  SiPinterest, SiReddit, SiMedium, SiSubstack, SiPatreon, 
  SiBuymeacoffee, SiPaypal, SiVenmo, SiCashapp, SiOnlyfans, 
  SiKofi, SiEtsy, SiAmazon, SiShopify, 
  SiBehance, SiFigma, SiNotion, SiCalendly, 
  SiLinktree, SiThreads, SiGitlab, SiBitbucket, SiStackoverflow,
  SiCodepen, SiCodesandbox, SiNpm, SiFramer, SiProducthunt,
  SiUpwork, SiFiverr, SiPolywork, SiDevdotto, SiHashnode,
  SiGhost, SiWordpress, SiKickstarter, SiEbay,
  SiGumroad, SiFlickr, SiArtstation, SiDeviantart, SiUnsplash,
  SiVsco, SiZoom, SiCanva, SiBento
} from 'react-icons/si';
import { FaSkype } from 'react-icons/fa6';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

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
    linkedin: { icon: SiLinkedin, color: '#0A66C2' },
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
    amazon: { icon: SiAmazon, color: '#FF9900' },
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
    "w-7 h-7": 28,
    "w-8 h-8": 32,
    "w-10 h-10": 40,
    "w-12 h-12": 48
  };
  const size = sizeMap[className] || 24;

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size} color={useColor ? color : 'currentColor'} />
    </div>
  );
};

const THEMES = [
  { id: 'cosmic', name: 'Cosmic Dark', background: 'linear-gradient(135deg, #070913 0%, #0B1025 50%, #070913 100%)', accent: '#7B61FF', preview: 'bg-[#0B1025]', isLight: false },
  { id: 'frost', name: 'Ice Frost', background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0a1628 100%)', accent: '#00D9FF', preview: 'bg-[#0d2847]', isLight: false },
  { id: 'aurora', name: 'Aurora Mesh', background: 'linear-gradient(215deg, #4F46E5 0%, #7B61FF 30%, #00D9FF 70%, #2DD4A8 100%)', accent: '#FFFFFF', preview: 'bg-gradient-to-br from-indigo-600 to-cyan-400', isLight: false },
  { id: 'cyberpunk', name: 'Cyberpunk', background: 'linear-gradient(135deg, #050505 0%, #1a0033 100%)', accent: '#F0F', preview: 'bg-[#1a0033]', isLight: false },
  { id: 'glass-light', name: 'Glass Light', background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)', accent: '#7B61FF', preview: 'bg-white', isLight: true },
  { id: 'rose', name: 'Rose Gold', background: 'linear-gradient(135deg, #1a0a0f 0%, #2d0a15 100%)', accent: '#FF61DC', preview: 'bg-[#2d0a15]', isLight: false },
  { id: 'royal', name: 'Royal Velvet', background: 'linear-gradient(135deg, #0a0515 0%, #1a0a2d 100%)', accent: '#FFD166', preview: 'bg-[#1a0a2d]', isLight: false },
  { id: 'obsidian', name: 'Obsidian', background: '#050505', accent: '#FFFFFF', preview: 'bg-black', isLight: false },
  { id: 'mint', name: 'Mint Fresh', background: 'linear-gradient(135deg, #061a12 0%, #0a2d1d 100%)', accent: '#2DD4A8', preview: 'bg-[#0a2d1d]', isLight: false },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'analytics' | 'settings'>('links');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [auraTree, setAuraTree] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for race condition management
  const updateCounterRef = useRef(0);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAvatarModal, setShowDeleteAvatarModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCancelSubModal, setShowCancelSubModal] = useState(false);
  
  // Form States
  const [editingLink, setEditingLink] = useState<any>(null);
  const [deletingLink, setDeletingLink] = useState<any>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Force enable body scrolling when entering the dashboard
    // This fixes cases where Lenis or other components on the home page might have locked the scroll
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Immediate scroll to top
    window.scrollTo(0, 0);

    // Scroll to the editor section when tab changes on mobile
    const editorSection = document.getElementById('dashboard-editor');
    if (editorSection && window.innerWidth < 1024) {
      editorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const contentArea = document.querySelector('.overflow-y-auto');
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('http://localhost:5000/api/v1/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Password updated successfully');
        setShowPasswordModal(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password Update Error:', error);
      toast.error('Update failed', { description: error.message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelSubModal(true);
  };

  const confirmCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/payments/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Subscription cancelled');
        setShowCancelSubModal(false);
        // Refresh user data
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
        if (userDoc.exists()) setUserData(userDoc.data());
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Cancellation failed', { description: error.message });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSocialShare = async (platform: 'instagram' | 'x' | 'whatsapp') => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/${auraTree?.slug}`;
    const shareText = `Check out my Aura Tree! ✨`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aura Tree',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }

    let intentUrl = '';
    const fullMessage = `${shareText}\n${shareUrl}`;
    
    if (platform === 'x') {
      intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`;
    } else if (platform === 'whatsapp') {
      intentUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(shareUrl);
      toast.info('Link copied! Share it to your Instagram story.');
      window.open('https://instagram.com', '_blank');
      return;
    }

    if (intentUrl) window.open(intentUrl, '_blank');
  };

  const shareQR = async () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = async () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        
        canvas.toBlob(async (blob) => {
          if (blob && navigator.share) {
            const file = new File([blob], `auratree-qr-${auraTree?.slug}.png`, { type: 'image/png' });
            try {
              await navigator.share({
                files: [file],
                title: 'My Aura Tree QR Code',
                text: `Scan to visit my profile! ✨`
              });
            } catch (err) {
              downloadQR();
            }
          } else {
            downloadQR();
          }
        }, 'image/png');
      }
    };

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 2000;
    canvas.height = 2000;

    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 2000, 2000);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `auratree-qr-${auraTree?.slug || 'profile'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('QR Code saved to device');
      }
    };

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  const fetchAuraTree = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/auratree/me`, {
        headers: { 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuraTree(data.data);
        setLinks(data.data.links || []);
      }
    } catch (error) {
      console.error('Error fetching Aura Tree:', error);
    }
  };

  const createAuraTree = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auratree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({
          displayName: auth.currentUser?.displayName || 'User',
          bio: ''
        })
      });
      const data = await response.json();
      if (data.success) {
        await fetchAuraTree();
        return data.data.id;
      }
    } catch (error) {
      console.error('Error creating Aura Tree:', error);
    }
    return null;
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Use real-time listener for user data (especially important for admin plan changes)
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const uData = docSnap.data();
            setUserData(uData);
            
            // Only fetch Aura Tree if we don't have it or if auraTreeId changed
            if (uData.auraTreeId) {
              await fetchAuraTree();
            } else {
              await createAuraTree();
            }
          }
        });
      } else {
        window.location.href = '/';
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleUpdateProfile = async (updateData?: any) => {
    if (!auraTree?.id) return;
    
    // --- OPTIMISTIC UI ---
    // Save current state in case we need to roll back
    const previousState = { ...auraTree };
    
    // Support theme updates directly from THEMES list
    const finalData = updateData || { 
      displayName: auraTree.displayName, 
      bio: auraTree.bio,
      slug: auraTree.slug 
    };

    // Apply change immediately to local state
    setAuraTree((prev: any) => ({
      ...prev,
      ...finalData,
      theme: finalData.theme ? { ...prev.theme, ...finalData.theme } : prev.theme
    }));

    setIsUpdatingProfile(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/auratree/${auraTree.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify(finalData)
      });
      const data = await response.json();
      if (data.success) {
        setAuraTree({ ...auraTree, ...data.data });
        toast.success('Profile updated');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      // Roll back on error
      setAuraTree(previousState);
      toast.error('Update failed', { description: error.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/user/avatar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ auraTreeId: auraTree?.id })
      });

      const data = await response.json();
      if (data.success) {
        setUserData({ ...userData, avatarUrl: '' });
        setAuraTree({ ...auraTree, avatarUrl: '' });
        setShowDeleteAvatarModal(false);
        toast.success('Profile picture removed');
      }
    } catch (error) {
      toast.error('Failed to remove picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large', { description: 'Please choose an image under 5MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('http://localhost:5000/api/v1/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setUserData({ ...userData, avatarUrl: data.data.avatarUrl });
        toast.success('Avatar updated');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Upload failed');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- OPTIMIZED LINK ADDING ---
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = newLinkUrl.trim().toLowerCase();
    
    if (!url) {
      toast.error('URL required');
      return;
    }
    
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      toast.error('Invalid URL format');
      return;
    }

    if (userData?.subscription?.plan === 'free' && links.length >= 5) {
      toast.error('Limit reached', { description: 'Upgrade for more links!' });
      return;
    }

    // --- OPTIMISTIC UI ---
    const tempId = `temp-${Date.now()}`;
    const detectedPlatform = url.includes('youtube') ? 'youtube' : 
                            url.includes('instagram') ? 'instagram' : 
                            url.includes('tiktok') ? 'tiktok' : 
                            url.includes('spotify') ? 'spotify' : 'website';
    
    const optimisticLink = {
      id: tempId,
      url: url.startsWith('http') ? url : `https://${url}`,
      title: 'Syncing...',
      platform: detectedPlatform,
      isOptimistic: true
    };

    // Immediately update UI
    setLinks([...links, optimisticLink]);
    setNewLinkUrl('');
    setShowAddModal(false);
    
    try {
      const response = await fetch(`http://localhost:5000/api/v1/links/auratree/${auraTree.id}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (data.success) {
        setLinks(prev => prev.map(l => l.id === tempId ? data.data : l));
        toast.success(`Link published!`);
      } else {
        setLinks(prev => prev.filter(l => l.id !== tempId));
        toast.error('Failed to save link', { description: data.message });
      }
    } catch (error) {
      setLinks(prev => prev.filter(l => l.id !== tempId));
      toast.error('Network error', { description: 'Check your connection.' });
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink || !auraTree?.id) return;

    setIsAddingLink(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/links/${editingLink.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ 
          auraTreeId: auraTree.id,
          url: editingLink.url,
          title: editingLink.title
        })
      });

      const data = await response.json();
      if (data.success) {
        setLinks(links.map(l => l.id === editingLink.id ? { ...l, ...data.data } : l));
        setShowEditModal(false);
        setEditingLink(null);
        toast.success('Link updated');
      }
    } catch (error: any) {
      toast.error('Update failed');
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deletingLink || !auraTree?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/links/${deletingLink.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ auraTreeId: auraTree.id })
      });

      const data = await response.json();
      if (data.success) {
        setLinks(links.filter(l => l.id !== deletingLink.id));
        setShowDeleteModal(false);
        setDeletingLink(null);
        toast.success('Link removed');
      }
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aura-navy flex items-center justify-center">
        <LucideLoader2 className="w-8 h-8 text-aura-violet animate-spin" />
      </div>
    );
  }

  const isFree = userData?.subscription?.plan === 'free';

  return (
    <div className="min-h-screen bg-aura-navy flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-aura-glass-border hidden lg:flex flex-col bg-white/[0.02] backdrop-blur-xl">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aura-violet to-aura-cyan flex items-center justify-center">
            <LucideSparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-aura-text">Aura Tree</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {[
            { id: 'links', icon: LayoutDashboard, label: 'Links' },
            { id: 'appearance', icon: LucidePalette, label: 'Appearance' },
            { id: 'analytics', icon: LucideBarChart3, label: 'Analytics' },
            { id: 'settings', icon: LucideSettings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-aura-violet text-white shadow-lg shadow-aura-violet/20' 
                  : 'text-aura-text-secondary hover:bg-white/5 hover:text-aura-text'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-aura-glass-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aura-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LucideLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-aura-navy/80 backdrop-blur-xl border-t border-aura-glass-border flex items-center justify-around px-2 z-50">
        {[
          { id: 'links', icon: LayoutDashboard, label: 'Links' },
          { id: 'appearance', icon: LucidePalette, label: 'Appearance' },
          { id: 'analytics', icon: LucideBarChart3, label: 'Analytics' },
          { id: 'settings', icon: LucideSettings, label: 'Settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`relative flex flex-col items-center justify-center gap-1 h-full px-4 transition-all ${
              activeTab === item.id 
                ? 'text-aura-violet' 
                : 'text-aura-text-secondary hover:text-aura-text'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-aura-violet rounded-b-full shadow-[0_0_15px_rgba(123,97,255,0.6)] animate-in slide-in-from-top-1 duration-300" />
            )}
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`} />
            <span className={`text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="h-16 border-b border-aura-glass-border flex items-center justify-between px-4 lg:px-8 bg-white/[0.01] backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { window.location.href = '/'; }}
              className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LucideArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Site</span>
            </button>
            <h1 className="font-display font-bold text-xl text-aura-text border-l border-white/10 pl-4 capitalize">{activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowShareModal(true)}
              className="hidden sm:flex btn-primary py-2 px-6 text-sm font-bold shadow-lg shadow-aura-violet/20"
            >
              Share Profile
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-0.5 overflow-hidden">
              <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center font-bold text-aura-text overflow-hidden">
                {userData?.avatarUrl ? (
                  <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (userData?.displayName || 'U').charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto" data-lenis-prevent>
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Upgrade Banner for non-Teams users */}
            {userData?.subscription?.plan !== 'teams' && (
              <div className="glass-card p-6 border-aura-violet/30 bg-gradient-to-r from-aura-violet/10 to-transparent relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="font-display font-bold text-xl text-aura-text flex items-center gap-2 justify-center md:justify-start">
                      <LucideSparkles className="w-5 h-5 text-aura-pink animate-pulse" />
                      Elevate your Aura
                    </h2>
                    <p className="text-aura-text-secondary text-sm max-w-xl">
                      {isFree 
                        ? 'Unlock premium glassmorphic themes, full branding control, and real-time analytics by upgrading to Pro.' 
                        : 'Remove the "aura-" prefix entirely and get fully branded links with the Teams plan.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => { window.location.href = '/#pricing'; }}
                    className="btn-primary py-3 px-8 text-sm whitespace-nowrap shadow-xl shadow-aura-violet/20 hover:scale-105 transition-transform"
                  >
                    Upgrade Now
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-aura-violet/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Total Visits', value: isFree ? 'Unlock' : (auraTree?.viewCount || '0'), icon: LucideBarChart3, color: 'text-aura-violet', locked: isFree },
                { label: 'Link Clicks', value: isFree ? 'Unlock' : (links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0)), icon: LucideLink2, color: 'text-aura-cyan', locked: isFree },
                { label: 'QR Scans', value: isFree ? 'Unlock' : (auraTree?.qrScanCount || '0'), icon: LucideQrCode, color: 'text-aura-mint', locked: isFree },
                { label: 'Aura Score', value: userData?.auraScore || '0', icon: LucideSparkles, color: 'text-aura-pink', glow: (userData?.auraScore || 0) >= 80 },
              ].map((stat, i) => (
                <div key={i} className={`glass-card p-6 flex items-center justify-between transition-all duration-500 ${stat.glow ? 'shadow-[0_0_30px_rgba(123,97,255,0.3)] border-aura-violet/30 animate-pulse-glow' : ''} ${stat.locked ? 'cursor-pointer group hover:border-aura-violet/30' : ''}`}>
                  <div>
                    <p className="text-xs text-aura-text-secondary mb-1 uppercase tracking-wider font-semibold">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-display font-bold text-aura-text ${stat.locked ? 'text-xl text-aura-violet' : 'text-3xl'}`}>{stat.value}</p>
                      {stat.locked && <LucideSettings className="w-4 h-4 text-aura-violet animate-spin-slow" />}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Section - Always Visible */}
            <div className="glass-card p-8 border-aura-glass-border">
              <h3 className="font-display font-bold text-xl text-aura-text mb-6">Profile Details</h3>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <label className={`w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden cursor-pointer`}>
                    {isUploadingAvatar ? (
                      <LucideLoader2 className="w-8 h-8 text-aura-violet animate-spin" />
                    ) : (auraTree?.avatarUrl || userData?.avatarUrl) ? (
                      <img src={auraTree?.avatarUrl || userData?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <LucideCamera className="w-8 h-8 text-aura-text-secondary" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isUploadingAvatar}
                      onChange={handleAvatarUpload}
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                    </div>
                  </label>
                  {(auraTree?.avatarUrl || userData?.avatarUrl) && (
                    <button 
                      onClick={() => setShowDeleteAvatarModal(true)}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-aura-navy hover:bg-red-600 transition-colors"
                      title="Remove Picture"
                    >
                      <LucideX className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest">Display Name</label>
                      <input 
                        type="text" 
                        value={auraTree?.displayName || ''}
                        onChange={(e) => setAuraTree((prev: any) => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest">Bio</label>
                      <textarea 
                        rows={1}
                        placeholder="Write a short bio about yourself..."
                        value={auraTree?.bio || ''}
                        onChange={(e) => setAuraTree((prev: any) => ({ ...prev, bio: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all resize-none font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleUpdateProfile()}
                      disabled={isUpdatingProfile}
                      className="btn-primary py-2.5 px-8 text-sm font-bold shadow-lg shadow-aura-violet/20 flex items-center gap-2"
                    >
                      {isUpdatingProfile ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <><LucideCheck className="w-4 h-4" /> Save Profile</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="dashboard-editor" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
              
              {/* Left Column: Editor */}
              <div className="lg:col-span-7 space-y-6">
                
                {activeTab === 'links' && (
                  <div className="glass-card flex flex-col shadow-2xl overflow-hidden border-aura-glass-border animate-in fade-in slide-in-from-left duration-500">
                    <div className="p-6 border-b border-aura-glass-border flex items-center justify-between bg-white/[0.01]">
                      <div>
                        <h2 className="font-display font-semibold text-xl text-aura-text">My Links</h2>
                        <p className="text-xs text-aura-text-secondary mt-1">
                          {links.length} / {isFree ? '5' : '∞'} links used
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-aura-violet text-white text-sm font-bold hover:bg-aura-violet/90 transition-all shadow-lg shadow-aura-violet/20 active:scale-95"
                      >
                        <LucidePlus className="w-4 h-4" />
                        Add Link
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {links.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <LucideLinkIcon className="w-8 h-8 text-aura-text-secondary" />
                          </div>
                          <h3 className="text-aura-text font-medium">No links yet</h3>
                          <p className="text-aura-text-secondary text-sm max-w-xs">Paste a URL to get started. We'll automatically detect the platform.</p>
                        </div>
                      ) : (
                        links.map((link) => (
                          <div key={link.id} className={`flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-violet/30 transition-all group shadow-sm ${link.isOptimistic ? 'opacity-50 grayscale cursor-wait' : ''}`}>
                            <div className="cursor-grab text-aura-text-secondary/30 hover:text-aura-violet">
                              <LucideGripVertical className="w-5 h-5" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner" style={{ color: getPlatformDetails(link.platform).color }}>
                              <PlatformIcon platform={link.platform} className="w-6 h-6" useColor={true} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-aura-text font-bold truncate">{link.title}</h4>
                              <p className="text-xs text-aura-text-secondary truncate">{link.url}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!link.isOptimistic && (
                                <>
                                  <button onClick={() => { setEditingLink(link); setShowEditModal(true); }} className="p-2 rounded-lg hover:bg-white/5 text-aura-text-secondary"><LucideSettings className="w-4 h-4" /></button>
                                  <button onClick={() => { setDeletingLink(link); setShowDeleteModal(true); }} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500/70 hover:text-red-500"><LucideX className="w-4 h-4" /></button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-6 pt-0 mt-4 border-t border-white/5">
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 hover:scale-[1.02] transition-transform"
                      >
                        Publish & Generate Link Page <LucideShare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
                    <div className="glass-card p-8 border-aura-glass-border relative">
                      {isFree && (
                        <div className="absolute inset-0 z-10 bg-aura-navy/40 backdrop-blur-[2px] flex items-center justify-center rounded-[24px]">
                          <div className="glass-card p-6 flex flex-col items-center text-center max-w-sm shadow-2xl border-aura-violet/30">
                            <LucideZap className="w-10 h-10 text-aura-violet mb-4 animate-pulse" />
                            <h4 className="text-aura-text font-bold text-lg">Premium Themes</h4>
                            <p className="text-aura-text-secondary text-xs mt-2 mb-6">Upgrade to Pro to unlock stunning glassmorphic themes and custom backgrounds.</p>
                            <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-3 px-8 text-xs font-bold uppercase tracking-widest">Unlock Now</button>
                          </div>
                        </div>
                      )}
                      
                      <h3 className="font-display font-bold text-xl text-aura-text mb-6">Visual Theme</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            disabled={isFree}
                            onClick={() => handleUpdateProfile({ theme: { background: theme.background, accentColor: theme.accent } })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left group ${
                              auraTree?.theme?.background === theme.background ? 'border-aura-violet bg-aura-violet/5' : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-full aspect-video rounded-lg mb-3 ${theme.preview} border border-white/10 overflow-hidden relative`}>
                              <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full" style={{ background: theme.accent }} />
                            </div>
                            <span className="text-sm font-bold text-aura-text group-hover:text-aura-violet transition-colors">{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-aura-glass-border animate-in fade-in slide-in-from-left duration-500">
                    <LucideBarChart3 className="w-16 h-16 text-aura-violet mb-6 opacity-50" />
                    <h2 className="text-2xl font-display font-bold text-aura-text mb-4">Deep Analytics</h2>
                    <p className="text-aura-text-secondary max-w-md mx-auto mb-8">
                      Detailed insights into your audience behavior.
                    </p>
                    {isFree && (
                      <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-4 px-10 text-sm font-bold uppercase tracking-widest">Upgrade to View</button>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
                    <div className="glass-card p-8 border-aura-glass-border">
                      <h3 className="font-display font-bold text-xl text-aura-text mb-6">Manage Subscription</h3>
                      
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${isFree ? 'bg-white/5' : 'bg-aura-violet/20'} flex items-center justify-center`}>
                            {isFree ? <LucideSparkles className="w-7 h-7 text-aura-text-secondary" /> : <LucideZap className="w-7 h-7 text-aura-violet" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest">Current Plan</p>
                            <h4 className="text-xl font-display font-bold text-aura-text capitalize">{userData?.subscription?.plan || 'Free'}</h4>
                            {!isFree && userData?.subscription?.status === 'active' && (
                              <p className="text-xs text-aura-mint font-medium mt-1">Renews on {new Date(userData.subscription.expiresAt).toLocaleDateString()}</p>
                            )}
                            {userData?.subscription?.status === 'cancelled' && (
                              <p className="text-xs text-aura-pink font-medium mt-1">Ends on {new Date(userData.subscription.expiresAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>

                        {isFree ? (
                          <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-3 px-8 text-sm font-bold">Upgrade Plan</button>
                        ) : userData?.subscription?.status === 'active' ? (
                          <button 
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all disabled:opacity-50"
                          >
                            {isCancelling ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : 'Cancel Subscription'}
                          </button>
                        ) : (
                          <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-3 px-8 text-sm font-bold">Resubscribe</button>
                        )}
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/5">
                        <h4 className="text-sm font-bold text-aura-text mb-4 uppercase tracking-widest">Account Security</h4>
                        <button 
                          onClick={() => setShowPasswordModal(true)}
                          className="flex items-center gap-2 text-aura-text-secondary hover:text-white transition-colors text-sm font-medium"
                        >
                          <LucideShield className="w-4 h-4" /> Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Mobile Preview */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="sticky top-24 w-full max-w-[300px]">
                  <p className="text-xs font-bold text-aura-text-secondary uppercase tracking-[0.2em] text-center mb-6">Live Preview</p>
                  <div className="relative w-full aspect-[9/19] rounded-[48px] bg-aura-navy p-3 border-[8px] border-aura-text/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div 
                      className="w-full h-full rounded-[36px] overflow-hidden relative flex flex-col"
                      style={{ background: auraTree?.theme?.background || 'linear-gradient(135deg, #070913 0%, #0B1025 50%, #070913 100%)' }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-aura-navy/40 backdrop-blur-md rounded-b-3xl z-10" />
                      
                      <div className="flex-1 flex flex-col items-center pt-14 px-6 overflow-y-auto no-scrollbar relative z-10">
                        <div className="w-20 h-20 rounded-full p-0.5 mb-4 shadow-xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${auraTree?.theme?.accentColor || '#7B61FF'}, #00D9FF)` }}>
                          <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center font-display font-bold text-2xl text-aura-text overflow-hidden">
                            {userData?.avatarUrl ? (
                              <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              (auraTree?.displayName || userData?.displayName || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        
                        <h3 className={`font-display font-bold text-lg text-center leading-tight ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-900' : 'text-aura-text'}`}>
                          {auraTree?.displayName || userData?.displayName || '@username'}
                        </h3>
                        <p className={`text-[10px] text-center mt-2 max-w-[180px] line-clamp-3 ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-600' : 'text-aura-text-secondary'}`}>
                          {auraTree?.bio || 'Add a bio to tell your audience who you are.'}
                        </p>

                        <div className="w-full mt-8 space-y-3">
                          {links.map((link) => (
                            <div key={link.id} className={`w-full p-3 flex items-center gap-3 shadow-lg backdrop-blur-md transition-transform active:scale-95 group ${auraTree?.theme?.cardStyle || 'rounded-2xl'} ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'bg-white/40 border-slate-200' : 'bg-white/[0.05] border-white/5'}`}>
                              <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${auraTree?.theme?.cardStyle === 'rounded-full' ? 'rounded-full' : auraTree?.theme?.cardStyle === 'rounded-none' ? 'rounded-none' : 'rounded-lg'} bg-white/5`} style={{ color: getPlatformDetails(link.platform).color }}>
                                <PlatformIcon platform={link.platform} className="w-4 h-4" useColor={true} />
                              </div>
                              <span className={`text-[11px] font-bold truncate flex-1 text-center pr-8 ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-800' : 'text-aura-text'}`}>{link.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="h-14 flex flex-col items-center justify-center flex-shrink-0 opacity-40">
                        <div className="flex items-center gap-1.5 mb-2">
                          <LucideSparkles className={`w-3 h-3 ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-aura-violet' : 'text-aura-violet'}`} />
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-900' : 'text-white'}`}>Aura Tree</span>
                        </div>
                        <div className={`w-16 h-1 rounded-full ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowPasswordModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text"><LucideX className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4"><LucideShield className="w-6 h-6 text-aura-violet" /></div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Change Password</h2>
              <p className="text-aura-text-secondary text-sm text-center mt-2">Enter your current and new password below.</p>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'} 
                      required
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-all"
                    >
                      {showCurrentPassword ? <LucideEye className="w-5 h-5" /> : <LucideEyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      required
                      minLength={6}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-all"
                    >
                      {showNewPassword ? <LucideEye className="w-5 h-5" /> : <LucideEyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      required
                      minLength={6}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-all"
                    >
                      {showConfirmPassword ? <LucideEye className="w-5 h-5" /> : <LucideEyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isChangingPassword}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 disabled:opacity-50"
              >
                {isChangingPassword ? <LucideLoader2 className="w-6 h-6 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/95 backdrop-blur-xl" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-10 shadow-[0_0_100px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar" data-lenis-prevent>
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-aura-text-secondary hover:text-aura-text transition-colors z-10"><LucideX className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 flex items-center justify-center transition-transform duration-300">
                <img 
                  src="/aura%20tree%20logo.png" 
                  alt="Aura Tree Logo" 
                  className="w-full h-full object-contain scale-[3.2] invert dark:invert-0 transition-all duration-300" 
                />
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-aura-text">Your Aura is Live!</h2>
              <p className="text-aura-text-secondary text-sm mt-2 sm:mt-3 max-w-sm">Share your unique link and QR code with your audience.</p>
            </div>

            <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Profile Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-aura-text text-sm sm:text-base font-medium truncate">
                    {window.location.origin}/{auraTree?.slug}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${auraTree?.slug}`);
                      toast.success('Link copied!');
                    }}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-aura-violet text-white hover:bg-aura-violet/90 transition-all shadow-lg"
                  >
                    <LucideCopy className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-white/[0.03] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white p-1.5 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={`http://localhost:5000/api/v1/auratree/qr/${auraTree?.slug}`}
                    size={512}
                    style={{ width: '100%', height: '100%' }}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTYwIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiByeD0iMjUiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNjAgMTEwIEw2MCA3MCBNNjAgODAgTDQwIDU1IE02MCA4MCBMODAgNTUgTTYwIDcwIEw1MCA0MCBNNjAgNzAgTDcwIDQwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+",
                      x: undefined,
                      y: undefined,
                      height: 128,
                      width: 128,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-4">
                  <h4 className="text-aura-text font-bold text-base sm:text-lg leading-tight">Official QR Code</h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button onClick={downloadQR} className="flex items-center gap-2 text-aura-violet font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-aura-cyan transition-colors">
                      <LucideDownload className="w-3 h-3 sm:w-4 sm:h-4" /> Download
                    </button>
                    <button onClick={shareQR} className="flex items-center gap-2 text-aura-cyan font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-aura-violet transition-colors">
                      <LucideShare className="w-3 h-3 sm:w-4 sm:h-4" /> Share QR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text"><LucideX className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4">
                {newLinkUrl ? (
                  <PlatformIcon 
                    platform={newLinkUrl.includes('youtube') ? 'youtube' : 
                             newLinkUrl.includes('instagram') ? 'instagram' : 
                             newLinkUrl.includes('tiktok') ? 'tiktok' : 
                             newLinkUrl.includes('spotify') ? 'spotify' : 'website'} 
                    className="w-6 h-6 animate-in zoom-in" 
                    useColor={true} 
                  />
                ) : (
                  <LucideLinkIcon className="w-6 h-6 text-aura-violet" />
                )}
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Add a new link</h2>
              <p className="text-aura-text-secondary text-sm text-center mt-2">Paste your URL and we'll handle the rest.</p>
            </div>
            
            <form onSubmit={handleAddLink} className="space-y-6">
              <div className="space-y-2">
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. youtube.com/aura" 
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={!newLinkUrl}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30"
              >
                Add to Profile <LucideArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {showEditModal && editingLink && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text"><LucideX className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4"><LucideSettings className="w-6 h-6 text-aura-violet" /></div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Edit link</h2>
            </div>
            
            <form onSubmit={handleUpdateLink} className="space-y-6">
              <div className="space-y-4">
                <input 
                  type="text" 
                  required
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                />
                <input 
                  type="text" 
                  required
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium"
                />
              </div>
              <button 
                type="submit" 
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3"
              >
                Save Changes <LucideCheck className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingLink && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-sm:w-full max-w-sm glass-card p-8 shadow-[0_0_50px_rgba(255,97,97,0.1)] animate-in zoom-in duration-300" data-lenis-prevent>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                <LucideX className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Are you sure?</h2>
              <p className="text-aura-text-secondary text-sm mt-3">
                Remove <span className="text-aura-text font-semibold">"{deletingLink.title}"</span>?
              </p>
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleDeleteLink} className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">Yes, delete link</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Avatar Modal */}
      {showDeleteAvatarModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowDeleteAvatarModal(false)} />
          <div className="relative w-full max-sm:w-full max-w-sm glass-card p-8 animate-in zoom-in duration-300" data-lenis-prevent>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                <LucideCamera className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Remove Photo?</h2>
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleDeleteAvatar} className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">Yes, remove photo</button>
              <button onClick={() => setShowDeleteAvatarModal(false)} className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelSubModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowCancelSubModal(false)} />
          <div className="relative w-full max-sm:w-full max-w-sm glass-card p-8 shadow-[0_0_50px_rgba(255,97,97,0.1)] animate-in zoom-in duration-300" data-lenis-prevent>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                <LucideZap className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Cancel Plan?</h2>
              <p className="text-aura-text-secondary text-sm mt-3">
                You will keep premium access until <span className="text-aura-text font-semibold">{new Date(userData?.subscription?.expiresAt).toLocaleDateString()}</span>.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={confirmCancelSubscription} 
                disabled={isCancelling}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isCancelling ? <LucideLoader2 className="w-5 h-5 animate-spin" /> : 'Yes, stop billing'}
              </button>
              <button onClick={() => setShowCancelSubModal(false)} className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all">Keep my plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
