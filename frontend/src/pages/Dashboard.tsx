import { useEffect, useState, useRef } from 'react';
import AffiliateSection from '../components/AffiliateSection';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users as LucideUsers,
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
  TrendingUp,
  Camera as LucideCamera,
  Copy as LucideCopy,
  Download as LucideDownload,
  Share2 as LucideShare,
  Zap as LucideZap,
  Shield as LucideShield,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  ChevronDown,
  Trash2 as LucideTrash,
  Handshake as LucideHandshake
} from 'lucide-react';
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
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ReviewModal from '../components/ReviewModal';
import PropellerAd from '../components/PropellerAd';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { API_BASE_URL, API_V1_URL } from '../config/api';

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
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as any;
  const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'analytics' | 'affiliate' | 'settings' | 'team'>(
    ['links', 'appearance', 'analytics', 'affiliate', 'settings', 'team'].includes(initialTab) ? initialTab : 'links'
  );
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [auraTree, setAuraTree] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isFetchingTeam, setIsFetchingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  // Multi-page State
  const [allAuraTrees, setAllAuraTrees] = useState<any[]>([]);
  const [isCreatingNewPage, setIsCreatingNewPage] = useState(false);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageData, setNewPageData] = useState({ displayName: '', slug: '' });
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  
  // Refs for race condition management
  const updateCounterRef = useRef(0);
  const switcherRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  
  // Click outside logic for switcher
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };

    if (isSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSwitcherOpen]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [deletingPage, setDeletingPage] = useState<any>(null);
  const [showDeleteAvatarModal, setShowDeleteAvatarModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCancelSubModal, setShowCancelSubModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
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

  const fetchAnalytics = async () => {
    if (!auraTree?.id) return;
    setIsFetchingAnalytics(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${auraTree.id}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsFetchingAnalytics(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (!auraTree?.id) return;
    setIsFetchingTeam(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${auraTree.id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsFetchingTeam(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !auraTree?.id) return;
    
    setIsAddingMember(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${auraTree.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newMemberEmail })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Team member added');
        setNewMemberEmail('');
        fetchTeamMembers();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Failed to add member', { description: error.message });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!auraTree?.id) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${auraTree.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Member removed');
        fetchTeamMembers();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Failed to remove member');
    }
  };

  useEffect(() => {
    // Force enable body scrolling when entering the dashboard
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

    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
    if (activeTab === 'team') {
      fetchTeamMembers();
    }
  }, [activeTab, auraTree?.id]);

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

      const response = await fetch(`${API_V1_URL}/user/password`, {
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

  const handleShareClick = () => {
    if (links.length === 0) {
      toast.error('Add at least one link before sharing your Aura Tree!');
      return;
    }

    if (userData?.subscription?.plan === 'free') {
      // Compulsory Ad for Free users
      // This opens the ad in a new tab and continues to the modal
      const adUrl = "https://quge5.com/88/tag.min.js?zone=228814"; // Using your MultiTag zone as a base
      
      toast.info('Opening secure link... please wait.', {
        duration: 3000,
      });

      // Open ad in new window/tab
      window.open(adUrl, '_blank');

      // Small delay to ensure they see the "process" before the share modal appears
      setTimeout(() => {
        setShowShareModal(true);
      }, 1500);
    } else {
      // Paid users get instant access with NO ads
      setShowShareModal(true);
    }
  };

  const confirmCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`${API_V1_URL}/payments/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Subscription cancelled');
        setShowCancelSubModal(false);
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
      const response = await fetch(`${API_V1_URL}/auratree/me`, {
        headers: { 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuraTree(data.data);
        setLinks(data.data.links || []);
        // Persist the page ID
        localStorage.setItem('active_aura_page_id', data.data.id);
      }
    } catch (error) {
      console.error('Error fetching Aura Tree:', error);
    }
  };

  const fetchAllAuraTrees = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAllAuraTrees(data.data);
      }
    } catch (error) {
      console.error('Error fetching all Aura Trees:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshActivePage = async () => {
    if (!auraTree?.id) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${auraTree.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuraTree(data.data);
        setLinks(data.data.links || []);
      }
      // Also refresh user data for plan/header consistency
      await fetchUserData();
    } catch (error) {
      console.error('Error refreshing page data:', error);
    }
  };

  const handlePageSwitch = async (pageId: string, isSilent: boolean = false) => {
    setLoading(true);
    setIsSwitcherOpen(false);
    // Save selection to localStorage for persistence
    localStorage.setItem('active_aura_page_id', pageId);
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${pageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuraTree(data.data);
        setLinks(data.data.links || []);
        if (!isSilent) {
          toast.success(`Switched to ${data.data.displayName}`);
        }
      }
    } catch (error) {
      if (!isSilent) toast.error('Failed to switch page');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingNewPage(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      
      // Only include slug if it's provided
      const payload: any = { displayName: newPageData.displayName };
      if (newPageData.slug.trim()) {
        payload.slug = newPageData.slug.trim();
      }

      const response = await fetch(`${API_V1_URL}/auratree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('New Aura Tree page created!');
        setShowCreatePageModal(false);
        setNewPageData({ displayName: '', slug: '' });
        fetchAllAuraTrees();
        // Switch to the new page
        setAuraTree(data.data);
        setLinks([]);
      } else {
        // If validation errors exist, show the first one
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors[0].message);
        }
        throw new Error(data.message || 'Failed to create page');
      }
    } catch (error: any) {
      toast.error('Creation failed', { description: error.message });
    } finally {
      setIsCreatingNewPage(false);
    }
  };

  const createInitialAuraTree = async () => {
    try {
      const response = await fetch(`${API_V1_URL}/auratree`, {
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
        await fetchAllAuraTrees();
        return data.data.id;
      }
    } catch (error) {
      console.error('Error creating initial Aura Tree:', error);
    }
    return null;
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchAllAuraTrees();
        
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const uData = docSnap.data();
            setUserData(uData);
            
            // Handle initial page load
            if (isInitialLoadRef.current) {
              isInitialLoadRef.current = false;
              const savedPageId = localStorage.getItem('active_aura_page_id');
              
              try {
                if (savedPageId) {
                  // If we have a saved ID, load that specific page
                  await handlePageSwitch(savedPageId, true);
                } else if (uData.auraTreeId) {
                  // Otherwise fallback to their primary page
                  await fetchAuraTree();
                } else {
                  // Create first page if they have none
                  await createInitialAuraTree();
                }
              } finally {
                setLoading(false);
              }
            }
          }
        });
      } else {
        window.location.href = '/';
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleUpdateProfile = async (updateData?: any) => {
    if (!auraTree?.id) return;
    const previousState = { ...auraTree };
    const finalData = updateData || { 
      displayName: auraTree.displayName, 
      bio: auraTree.bio,
      slug: auraTree.slug 
    };

    setAuraTree((prev: any) => ({
      ...prev,
      ...finalData,
      theme: finalData.theme ? { ...prev.theme, ...finalData.theme } : prev.theme
    }));

    setIsUpdatingProfile(true);
    try {
      const response = await fetch(`${API_V1_URL}/auratree/${auraTree.id}`, {
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
        fetchAllAuraTrees(); // Update list
        refreshActivePage(); // Refresh page data and score
        toast.success('Profile updated');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setAuraTree(previousState);
      toast.error('Update failed', { description: error.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const response = await fetch(`${API_V1_URL}/user/avatar`, {
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
        refreshActivePage(); // Refresh page data and score
        toast.success('Profile picture removed');
      }
    } catch (error) {
      toast.error('Failed to remove picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeletePage = async () => {
    if (!deletingPage) return;
    setIsDeleting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/auratree/${deletingPage.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Page deleted successfully');
        setShowDeletePageModal(false);
        setDeletingPage(null);
        await fetchAllAuraTrees();
        // If we deleted the current active page, fetch the new default
        if (auraTree?.id === deletingPage.id) {
          await fetchAuraTree();
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Deletion failed', { description: error.message });
    } finally {
      setIsDeleting(false);
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
    if (auraTree?.id) {
      formData.append('auraTreeId', auraTree.id);
    }

    try {
      const response = await fetch(`${API_V1_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Update specific tree state
        setAuraTree({ ...auraTree, avatarUrl: data.data.avatarUrl });
        // Also update user data for the header icon
        setUserData({ ...userData, avatarUrl: data.data.avatarUrl });
        refreshActivePage(); // Refresh page data and score
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

    setLinks([...links, optimisticLink]);
    setNewLinkUrl('');
    setShowAddModal(false);
    
    try {
      const response = await fetch(`${API_V1_URL}/links/auratree/${auraTree.id}/links`, {
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
        refreshActivePage(); // Refresh page data and score
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
      const response = await fetch(`${API_V1_URL}/links/${editingLink.id}`, {
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
        refreshActivePage(); // Refresh page data and score
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
      const response = await fetch(`${API_V1_URL}/links/${deletingLink.id}`, {
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
        refreshActivePage(); // Refresh page data and score
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

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('Link copied!');
      }).catch(() => {
        fallbackCopyTextToClipboard(text);
      });
    } else {
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success('Link copied!');
    } catch (err) {
      toast.error('Failed to copy');
    }
    document.body.removeChild(textArea);
  };

  const navItems = [
    { id: 'links', icon: LayoutDashboard, label: 'Links' },
    { id: 'appearance', icon: LucidePalette, label: 'Appearance' },
    { id: 'analytics', icon: LucideBarChart3, label: 'Analytics' },
    { id: 'affiliate', icon: LucideHandshake, label: 'Affiliate' },
    ...(userData?.subscription?.plan === 'teams' || auraTree?.teamMembers?.length > 0 || auraTree?.role === 'member' ? [{ id: 'team', icon: LucideUsers, label: 'Team' }] : []),
    { id: 'settings', icon: LucideSettings, label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-aura-navy flex items-center justify-center">
        <LucideLoader2 className="w-8 h-8 text-aura-violet animate-spin" />
      </div>
    );
  }

  const isFree = userData?.subscription?.plan === 'free';
  const isOwner = auraTree?.role === 'owner';

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
          {navItems.map((item) => (
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-aura-navy/80 backdrop-blur-xl border-t border-aura-glass-border flex items-center overflow-x-auto no-scrollbar px-1 z-50">
        <div className="flex items-center justify-between w-full min-w-max sm:min-w-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`relative flex flex-col items-center justify-center gap-1 h-full px-3 min-w-[72px] transition-all ${
                activeTab === item.id 
                  ? 'text-aura-violet' 
                  : 'text-aura-text-secondary hover:text-aura-text'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-aura-violet rounded-b-full shadow-[0_0_15px_rgba(123,97,255,0.6)] animate-in slide-in-from-top-1 duration-300" />
              )}
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[8px] font-bold uppercase tracking-wider transition-all ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0">
        <header className="h-16 border-b border-aura-glass-border flex items-center justify-between px-4 lg:px-8 bg-white/[0.01] backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => { window.location.href = '/'; }} className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-colors flex items-center gap-2 text-sm font-medium">
              <LucideArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Site</span>
            </button>
            
            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            {/* Page Switcher */}
            <div className="relative" ref={switcherRef}>
              <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-aura-text group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-aura-violet/20 flex items-center justify-center text-aura-violet font-bold text-xs uppercase">
                  {auraTree?.displayName?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold leading-none">{auraTree?.displayName}</p>
                    {auraTree?.role === 'member' && <span className="text-[8px] bg-aura-violet/20 text-aura-violet px-1.5 py-0.5 rounded-full uppercase font-bold">Team Member</span>}
                  </div>
                  <p className="text-[10px] text-aura-text-secondary mt-1">/{auraTree?.slug}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-aura-text-secondary transition-transform duration-300 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSwitcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-aura-navy border border-aura-glass-border rounded-2xl shadow-2xl backdrop-blur-xl z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest px-3 py-2">My Aura Pages</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                    {allAuraTrees.map((tree) => (
                      <div
                        key={tree.id}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                          auraTree?.id === tree.id 
                            ? 'bg-aura-violet/10 text-aura-violet' 
                            : 'text-aura-text-secondary hover:bg-white/5 hover:text-aura-text'
                        }`}
                        onClick={() => handlePageSwitch(tree.id)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${auraTree?.id === tree.id ? 'bg-aura-violet text-white' : 'bg-white/5'}`}>
                          {tree.displayName?.charAt(0)}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{tree.displayName}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-[9px] opacity-60 truncate">/{tree.slug}</p>
                            {tree.role === 'member' && <span className="text-[7px] text-aura-violet font-bold uppercase">Team</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {auraTree?.id === tree.id && <LucideCheck className="w-3 h-3 text-aura-violet" />}
                          {tree.role === 'owner' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingPage(tree);
                                setShowDeletePageModal(true);
                                setIsSwitcherOpen(false);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-aura-text-secondary hover:text-red-500 transition-colors"
                              title="Delete Page"
                            >
                              <LucideTrash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-px bg-white/5 my-2" />
                  
                  <button 
                    onClick={() => { setShowCreatePageModal(true); setIsSwitcherOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-aura-mint hover:bg-aura-mint/5 transition-all font-bold text-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-aura-mint/10 flex items-center justify-center">
                      <LucidePlus className="w-4 h-4" />
                    </div>
                    Create New Page
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!userData?.isAffiliate && (
              <button onClick={() => setActiveTab('affiliate')} className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-aura-violet/10 border border-aura-violet/20 text-aura-violet text-sm font-bold hover:bg-aura-violet/20 transition-all">
                <LucideUsers className="w-4 h-4" /> Become an Affiliate
              </button>
            )}
            <button onClick={handleShareClick} className="hidden sm:flex btn-primary py-2 px-6 text-sm font-bold shadow-lg shadow-aura-violet/20">
              Share Profile
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-0.5 overflow-hidden">
              <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center font-bold text-aura-text overflow-hidden">
                {auraTree?.avatarUrl ? <img src={auraTree.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (auraTree?.displayName || userData?.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto" data-lenis-prevent>
          <div className="max-w-6xl mx-auto space-y-8">
            {userData?.subscription?.plan !== 'teams' && isOwner && (
              <div className="glass-card p-6 border-aura-violet/30 bg-gradient-to-r from-aura-violet/10 to-transparent relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="font-display font-bold text-xl text-aura-text flex items-center gap-2 justify-center md:justify-start">
                      <LucideSparkles className="w-5 h-5 text-aura-pink animate-pulse" /> Elevate your Aura
                    </h2>
                    <p className="text-aura-text-secondary text-sm max-w-xl">
                      {isFree ? 'Unlock premium glassmorphic themes, full branding control, and a 100% ad-free experience by upgrading to Pro.' : 'Remove the "aura-" prefix entirely and enjoy an ad-free workspace with the Teams plan.'}
                    </p>
                  </div>
                  <button onClick={() => { window.location.href = '/#pricing'; }} className="btn-primary py-3 px-8 text-sm whitespace-nowrap shadow-xl shadow-aura-violet/20 hover:scale-105 transition-transform">
                    Upgrade Now
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-aura-violet/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Total Visits', value: isFree ? 'Unlock' : (auraTree?.viewCount || '0'), icon: LucideBarChart3, color: 'text-aura-violet', locked: isFree },
                { label: 'Link Clicks', value: isFree ? 'Unlock' : (links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0)), icon: LucideLink2, color: 'text-aura-cyan', locked: isFree },
                { label: 'QR Scans', value: isFree ? 'Unlock' : (auraTree?.qrScanCount || '0'), icon: LucideQrCode, color: 'text-aura-mint', locked: isFree },
                { label: 'Aura Score', value: auraTree?.auraScore || '0', icon: LucideSparkles, color: 'text-aura-pink', glow: (auraTree?.auraScore || 0) >= 80 },
              ].map((stat, i) => (
                <div key={i} className={`glass-card p-6 flex items-center justify-between transition-all duration-500 ${stat.glow ? 'shadow-[0_0_30px_rgba(123,97,255,0.3)] border-aura-violet/30 animate-pulse-glow' : ''} ${stat.locked ? 'cursor-pointer group hover:border-aura-violet/30' : ''}`}>
                  <div>
                    <p className="text-xs text-aura-text-secondary mb-1 uppercase tracking-wider font-semibold">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-display font-bold text-aura-text ${stat.locked ? 'text-xl text-aura-violet' : 'text-3xl'}`}>{stat.value}</p>
                      {stat.locked && <LucideSettings className="w-4 h-4 text-aura-violet animate-spin-slow" />}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                </div>
              ))}
            </div>

            {activeTab !== 'affiliate' && activeTab !== 'team' && (
              <div className="glass-card p-8 border-aura-glass-border">
                <h3 className="font-display font-bold text-xl text-aura-text mb-6">Profile Details</h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative group">
                    <label className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden cursor-pointer">
                      {isUploadingAvatar ? <LucideLoader2 className="w-8 h-8 text-aura-violet animate-spin" /> : auraTree?.avatarUrl ? <img src={auraTree?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <LucideCamera className="w-8 h-8 text-aura-text-secondary" />}
                      <input type="file" accept="image/*" className="hidden" disabled={isUploadingAvatar} onChange={handleAvatarUpload} />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span></div>
                    </label>
                    {auraTree?.avatarUrl && (
                      <button onClick={() => setShowDeleteAvatarModal(true)} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-aura-navy hover:bg-red-600 transition-colors" title="Remove Picture"><LucideX className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest">Display Name</label>
                        <input type="text" value={auraTree?.displayName || ''} onChange={(e) => setAuraTree((prev: any) => ({ ...prev, displayName: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest">Bio</label>
                        <textarea rows={1} placeholder="Write a short bio about yourself..." value={auraTree?.bio || ''} onChange={(e) => setAuraTree((prev: any) => ({ ...prev, bio: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all resize-none font-medium" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleUpdateProfile()} disabled={isUpdatingProfile} className="btn-primary py-2.5 px-8 text-sm font-bold shadow-lg shadow-aura-violet/20 flex items-center gap-2">
                        {isUpdatingProfile ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <><LucideCheck className="w-4 h-4" /> Save Profile</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div id="dashboard-editor">
              {activeTab === 'affiliate' && <AffiliateSection userData={userData} auraTreeId={auraTree?.id} />}
              {activeTab === 'team' && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-8">
                  <div className="glass-card p-6 lg:p-10 border-aura-glass-border">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-10">
                      <div>
                        <h2 className="font-display font-bold text-2xl lg:text-3xl text-aura-text">Team Management</h2>
                        <p className="text-aura-text-secondary text-sm mt-2">Add up to 5 members to manage this Aura Page.</p>
                      </div>
                      {isOwner && (
                        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                          <input 
                            type="email" 
                            placeholder="User Email" 
                            required
                            value={newMemberEmail}
                            onChange={e => setNewMemberEmail(e.target.value)}
                            className="flex-1 xl:w-72 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all text-sm"
                          />
                          <button 
                            type="submit" 
                            disabled={isAddingMember || teamMembers.length >= 5}
                            className="px-8 py-3 rounded-2xl bg-aura-violet text-white font-bold hover:bg-aura-violet/90 transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-aura-violet/20"
                          >
                            {isAddingMember ? <LucideLoader2 className="w-5 h-5 animate-spin" /> : 'Add Member'}
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="space-y-4">
                      {isFetchingTeam ? (
                        <div className="py-20 flex justify-center"><LucideLoader2 className="w-10 h-10 text-aura-violet animate-spin" /></div>
                      ) : teamMembers.length === 0 ? (
                        <div className="py-16 text-center bg-white/[0.02] rounded-[32px] border border-dashed border-white/10">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <LucideUsers className="w-8 h-8 text-aura-text-secondary opacity-30" />
                          </div>
                          <p className="text-aura-text-secondary font-medium">No team members added yet.</p>
                          <p className="text-[10px] text-aura-text-secondary/50 uppercase tracking-widest mt-2">Team collaborative features will appear here</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-violet/30 transition-all group">
                              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-aura-violet/20 flex items-center justify-center overflow-hidden border-2 border-white/5">
                                {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-aura-violet font-bold text-lg">{member.displayName?.charAt(0)}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-aura-text truncate text-sm lg:text-base">{member.displayName}</p>
                                <p className="text-xs text-aura-text-secondary truncate mt-0.5">{member.email}</p>
                              </div>
                              {isOwner && (
                                <button 
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-aura-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove Member"
                                >
                                  <LucideX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-10 p-5 bg-aura-violet/5 border border-aura-violet/20 rounded-[24px]">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-aura-violet/20 flex items-center justify-center shrink-0">
                          <LucideShield className="w-5 h-5 text-aura-violet" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-aura-text uppercase tracking-widest mb-1.5">Permissions & Security</p>
                          <p className="text-xs text-aura-text-secondary leading-relaxed max-w-2xl">
                            Team members have limited administrative access. They can manage links, customize themes, and view real-time analytics. 
                            <span className="text-aura-violet font-bold ml-1">Sensitive actions</span> like deleting the Aura page, managing the subscription, or removing other members are restricted to the account owner.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 ${activeTab === 'affiliate' || activeTab === 'team' ? 'hidden' : ''}`}>
                <div className="lg:col-span-7 space-y-6">
                  {activeTab === 'links' && (
                    <div className="glass-card flex flex-col shadow-2xl overflow-hidden border-aura-glass-border animate-in fade-in slide-in-from-left duration-500">
                      <div className="p-6 border-b border-aura-glass-border flex items-center justify-between bg-white/[0.01]">
                        <div>
                          <h2 className="font-display font-semibold text-xl text-aura-text">My Links</h2>
                          <p className="text-xs text-aura-text-secondary mt-1">{links.length} / {isFree ? '5' : '∞'} links used</p>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-aura-violet text-white text-sm font-bold hover:bg-aura-violet/90 transition-all shadow-lg shadow-aura-violet/20 active:scale-95"><LucidePlus className="w-4 h-4" /> Add Link</button>
                      </div>
                      <div className="p-6 space-y-4">
                        {links.length === 0 ? (
                          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><LucideLinkIcon className="w-8 h-8 text-aura-text-secondary" /></div>
                            <h3 className="text-aura-text font-medium">No links yet</h3>
                            <p className="text-aura-text-secondary text-sm max-w-xs">Paste a URL to get started. We'll automatically detect the platform.</p>
                          </div>
                        ) : links.map((link) => (
                          <div key={link.id} className={`flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-violet/30 transition-all group shadow-sm ${link.isOptimistic ? 'opacity-50 grayscale cursor-wait' : ''}`}>
                            <div className="cursor-grab text-aura-text-secondary/30 hover:text-aura-violet"><LucideGripVertical className="w-5 h-5" /></div>
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner" style={{ color: getPlatformDetails(link.platform).color }}><PlatformIcon platform={link.platform} className="w-6 h-6" useColor={true} /></div>
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
                        ))}
                      </div>
                      <div className="p-6 pt-0 mt-4 border-t border-white/5">
                        <button 
                          onClick={handleShareClick} 
                          className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 hover:scale-[1.02] transition-transform whitespace-nowrap"
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
                            <button key={theme.id} disabled={isFree} onClick={() => handleUpdateProfile({ theme: { background: theme.background, accentColor: theme.accent } })} className={`p-4 rounded-2xl border-2 transition-all text-left group ${auraTree?.theme?.background === theme.background ? 'border-aura-violet bg-aura-violet/5' : 'border-white/5 hover:border-white/20'}`}>
                              <div className={`w-full aspect-video rounded-lg mb-3 ${theme.preview} border border-white/10 overflow-hidden relative`}><div className="absolute bottom-2 left-2 w-4 h-4 rounded-full" style={{ background: theme.accent }} /></div>
                              <span className="text-sm font-bold text-aura-text group-hover:text-aura-violet transition-colors">{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
                      {isFree ? (
                        <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-aura-glass-border">
                          <div className="w-20 h-20 rounded-3xl bg-aura-violet/10 flex items-center justify-center mb-6">
                            <LucideBarChart3 className="w-10 h-10 text-aura-violet" />
                          </div>
                          <h2 className="text-2xl font-display font-bold text-aura-text mb-4">Deep Analytics</h2>
                          <p className="text-aura-text-secondary max-w-md mx-auto mb-8">Detailed insights into your audience behavior, top links, and traffic trends.</p>
                          <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-4 px-10 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <LucideZap className="w-4 h-4" /> Upgrade to Pro to View
                          </button>
                        </div>
                      ) : isFetchingAnalytics ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                          <LucideLoader2 className="w-10 h-10 text-aura-violet animate-spin" />
                          <p className="text-aura-text-secondary mt-4 animate-pulse font-medium">Crunching your data...</p>
                        </div>
                      ) : !analyticsData ? (
                        <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-aura-glass-border">
                          <LucideBarChart3 className="w-16 h-16 text-aura-violet mb-6 opacity-50" />
                          <h2 className="text-2xl font-display font-bold text-aura-text mb-4">No data yet</h2>
                          <p className="text-aura-text-secondary max-w-md mx-auto">Your analytics will appear here once you share your link and get visits.</p>
                        </div>
                      ) : (
                        <>
                          {/* Analytics Overview Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                              { 
                                label: 'Total Visits', 
                                value: analyticsData.totalVisits, 
                                icon: LucideUsers, 
                                color: 'text-aura-violet', 
                                bg: 'bg-aura-violet/10',
                                growth: analyticsData.growth?.visits
                              },
                              { 
                                label: 'Total Clicks', 
                                value: analyticsData.totalClicks, 
                                icon: LucideLink2, 
                                color: 'text-aura-cyan', 
                                bg: 'bg-aura-cyan/10',
                                growth: analyticsData.growth?.clicks
                              },
                              { 
                                label: 'Avg. CTR', 
                                value: analyticsData.totalVisits > 0 ? `${((analyticsData.totalClicks / analyticsData.totalVisits) * 100).toFixed(1)}%` : '0%', 
                                icon: LucideBarChart3, 
                                color: 'text-aura-mint', 
                                bg: 'bg-aura-mint/10' 
                              },
                              { 
                                label: 'QR Scans', 
                                value: analyticsData.totalQrScans, 
                                icon: LucideQrCode, 
                                color: 'text-aura-pink', 
                                bg: 'bg-aura-pink/10' 
                              },
                            ].map((stat, i) => (
                              <div key={i} className="glass-card p-6 flex flex-col gap-4 border-aura-glass-border">
                                <div className="flex justify-between items-start">
                                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6" />
                                  </div>
                                  {stat.growth && (
                                    <div className="flex gap-4">
                                      <div className="text-right">
                                        <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.growth.weekly >= 0 ? 'text-aura-mint' : 'text-red-400'}`}>
                                          {stat.growth.weekly >= 0 ? '+' : ''}{stat.growth.weekly}%
                                          <TrendingUp className={`w-3 h-3 ${stat.growth.weekly < 0 ? 'rotate-180' : ''}`} />
                                        </div>
                                        <p className="text-[8px] text-aura-text-secondary uppercase mt-0.5">This Week</p>
                                      </div>
                                      <div className="text-right">
                                        <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.growth.monthly >= 0 ? 'text-aura-mint' : 'text-red-400'}`}>
                                          {stat.growth.monthly >= 0 ? '+' : ''}{stat.growth.monthly}%
                                          <TrendingUp className={`w-3 h-3 ${stat.growth.monthly < 0 ? 'rotate-180' : ''}`} />
                                        </div>
                                        <p className="text-[8px] text-aura-text-secondary uppercase mt-0.5">This Month</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-3xl font-display font-bold text-aura-text">{stat.value}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">{stat.label}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Traffic Chart */}
                          <div className="glass-card p-8 border-aura-glass-border">
                            <div className="flex items-center justify-between mb-8">
                              <div>
                                <h3 className="font-display font-bold text-xl text-aura-text">Traffic Trends</h3>
                                <p className="text-xs text-aura-text-secondary mt-1">Unique visits and clicks over the last 14 days</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-aura-violet" />
                                  <span className="text-[10px] font-bold text-aura-text-secondary uppercase">Visits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-aura-cyan" />
                                  <span className="text-[10px] font-bold text-aura-text-secondary uppercase">Clicks</span>
                                </div>
                              </div>
                            </div>
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData.timeSeries}>
                                  <defs>
                                    <linearGradient id="colorVisits" x1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#7B61FF" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorClicks" x1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                  <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                    tickFormatter={(str) => {
                                      const d = new Date(str);
                                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                  />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                  <Tooltip 
                                    contentStyle={{ background: '#070913', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                  />
                                  <Area type="monotone" dataKey="visits" stroke="#7B61FF" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                                  <Area type="monotone" dataKey="clicks" stroke="#00D9FF" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={3} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Links Bar Chart */}
                            <div className="glass-card p-8 border-aura-glass-border">
                              <h3 className="font-display font-bold text-xl text-aura-text mb-8">Link Performance</h3>
                              <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={analyticsData.links.sort((a: any, b: any) => b.clickCount - a.clickCount).slice(0, 5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                      dataKey="title" 
                                      type="category" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      width={100}
                                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <Tooltip 
                                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                      contentStyle={{ background: '#070913', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="clickCount" radius={[0, 4, 4, 0]}>
                                      {analyticsData.links.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#7B61FF' : 'rgba(123,97,255,0.4)'} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Detailed List */}
                            <div className="glass-card overflow-hidden border-aura-glass-border">
                              <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                                <h3 className="font-display font-bold text-lg text-aura-text">Engagement by Platform</h3>
                              </div>
                              <div className="divide-y divide-white/5">
                                {analyticsData.links.map((link: any, i: number) => (
                                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <PlatformIcon platform={link.platform} className="w-4 h-4" useColor={true} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-aura-text">{link.title}</p>
                                        <p className="text-[10px] text-aura-text-secondary uppercase tracking-widest">{link.platform}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-aura-text">{link.clickCount} <span className="text-[10px] text-aura-text-secondary font-normal ml-1 uppercase">Clicks</span></p>
                                      <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div 
                                          className="h-full bg-aura-cyan" 
                                          style={{ width: `${analyticsData.totalClicks > 0 ? (link.clickCount / analyticsData.totalClicks) * 100 : 0}%` }} 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
                      <div className="glass-card p-8 border-aura-glass-border">
                        <h3 className="font-display font-bold text-xl text-aura-text mb-6">Manage Subscription</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl ${isFree ? 'bg-white/5' : 'bg-aura-violet/20'} flex items-center justify-center`}>{isFree ? <LucideSparkles className="w-7 h-7 text-aura-text-secondary" /> : <LucideZap className="w-7 h-7 text-aura-violet" />}</div>
                            <div>
                              <p className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest">Current Plan</p>
                              <h4 className="text-xl font-display font-bold text-aura-text capitalize">{userData?.subscription?.plan || 'Free'}</h4>
                              {!isFree && userData?.subscription?.status === 'active' && <p className="text-xs text-aura-mint font-medium mt-1">Renews on {new Date(userData.subscription.expiresAt).toLocaleDateString()}</p>}
                              {userData?.subscription?.status === 'cancelled' && <p className="text-xs text-aura-pink font-medium mt-1">Ends on {new Date(userData.subscription.expiresAt).toLocaleDateString()}</p>}
                            </div>
                          </div>
                          {isFree ? <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-3 px-8 text-sm font-bold">Upgrade Plan</button> : userData?.subscription?.status === 'active' ? <button onClick={handleCancelSubscription} disabled={isCancelling} className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all disabled:opacity-50">{isCancelling ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : 'Cancel Subscription'}</button> : <button onClick={() => window.location.href='/#pricing'} className="btn-primary py-3 px-8 text-sm font-bold">Resubscribe</button>}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          <div>
                            <h4 className="text-sm font-bold text-aura-text mb-4 uppercase tracking-widest">Account Security</h4>
                            <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-2 text-aura-text-secondary hover:text-white transition-colors text-sm font-medium"><LucideShield className="w-4 h-4" /> Change Password</button>
                          </div>
                          <div className="h-12 w-px bg-white/5 hidden sm:block" />
                          <div>
                            <h4 className="text-sm font-bold text-aura-text mb-4 uppercase tracking-widest">Feedback</h4>
                            <button onClick={() => setShowReviewModal(true)} className="flex items-center gap-2 text-aura-violet hover:text-aura-cyan transition-colors text-sm font-bold"><LucideSparkles className="w-4 h-4" /> Leave a Review</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="sticky top-24 w-full max-w-[300px]">
                    <p className="text-xs font-bold text-aura-text-secondary uppercase tracking-[0.2em] text-center mb-6">Live Preview</p>
                    <div className="relative w-full aspect-[9/19] rounded-[48px] bg-aura-navy p-3 border-[8px] border-aura-text/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="w-full h-full rounded-[36px] overflow-hidden relative flex flex-col" style={{ background: auraTree?.theme?.background || 'linear-gradient(135deg, #070913 0%, #0B1025 50%, #070913 100%)' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-aura-navy/40 backdrop-blur-md rounded-b-3xl z-10" />
                        <div className="flex-1 flex flex-col items-center pt-14 px-6 overflow-y-auto no-scrollbar relative z-10">
                          <div className="w-20 h-20 rounded-full p-0.5 mb-4 shadow-xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${auraTree?.theme?.accentColor || '#7B61FF'}, #00D9FF)` }}>
                            <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center font-display font-bold text-2xl text-aura-text overflow-hidden">{auraTree?.avatarUrl ? <img src={auraTree.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (auraTree?.displayName || userData?.displayName || 'U').charAt(0).toUpperCase()}</div>
                          </div>
                          <h3 className={`font-display font-bold text-lg text-center leading-tight ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-900' : 'text-aura-text'}`}>{auraTree?.displayName || userData?.displayName || '@username'}</h3>
                          <p className={`text-[10px] text-center mt-2 max-w-[180px] line-clamp-3 ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-600' : 'text-aura-text-secondary'}`}>{auraTree?.bio || 'Add a bio to tell your audience who you are.'}</p>
                          <div className="w-full mt-8 space-y-3">
                            {links.map((link) => (
                              <div key={link.id} className={`w-full p-3 flex items-center gap-3 shadow-lg backdrop-blur-md transition-transform active:scale-95 group ${auraTree?.theme?.cardStyle || 'rounded-2xl'} ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'bg-white/40 border-slate-200' : 'bg-white/[0.05] border-white/5'}`}>
                                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${auraTree?.theme?.cardStyle === 'rounded-full' ? 'rounded-full' : auraTree?.theme?.cardStyle === 'rounded-none' ? 'rounded-none' : 'rounded-lg'} bg-white/5`} style={{ color: getPlatformDetails(link.platform).color }}><PlatformIcon platform={link.platform} className="w-4 h-4" useColor={true} /></div>
                                <span className={`text-[11px] font-bold truncate flex-1 text-center pr-8 ${THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'text-slate-800' : 'text-aura-text'}`}>{link.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="h-14 flex flex-col items-center justify-center flex-shrink-0 opacity-40">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                              <img src="/aura%20tree%20logo.png" className="w-full h-full object-contain scale-[3.2]" style={{ filter: THEMES.find(t => t.background === auraTree?.theme?.background)?.isLight ? 'none' : 'invert(1)' }} alt="" />
                            </div>
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
        </div>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowPasswordModal(false)} />
          <div className="relative w-full max-md:w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text"><LucideX className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-8"><div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4"><LucideShield className="w-6 h-6 text-aura-violet" /></div><h2 className="font-display font-bold text-2xl text-aura-text">Change Password</h2><p className="text-aura-text-secondary text-sm text-center mt-2">Enter your current and new password below.</p></div>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Current Password</label><div className="relative"><input type={showCurrentPassword ? 'text' : 'password'} required value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" /><button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-all">{showCurrentPassword ? <LucideEye className="w-5 h-5" /> : <LucideEyeOff className="w-5 h-5" />}</button></div></div>
                <div className="space-y-2"><label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">New Password</label><div className="relative"><input type={showNewPassword ? 'text' : 'password'} required minLength={6} value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-all">{showNewPassword ? <LucideEye className="w-5 h-5" /> : <LucideEyeOff className="w-5 h-5" />}</button></div></div>
                <div className="space-y-2"><label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Confirm New Password</label><div className="relative"><input type={showConfirmPassword ? 'text' : 'password'} required minLength={6} value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-all">{showConfirmPassword ? <LucideEye className="w-5 h-5" /> : <LucideEyeOff className="w-5 h-5" />}</button></div></div>
              </div>
              <button type="submit" disabled={isChangingPassword} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 disabled:opacity-50">{isChangingPassword ? <LucideLoader2 className="w-6 h-6 animate-spin" /> : 'Update Password'}</button>
            </form>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/95 backdrop-blur-xl" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-10 shadow-[0_0_100px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar" data-lenis-prevent>
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-aura-text-secondary hover:text-aura-text transition-colors z-10"><LucideX className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <div className="flex flex-col items-center text-center"><div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 flex items-center justify-center transition-transform duration-300"><img src="/aura%20tree%20logo.png" alt="Aura Tree Logo" className="w-full h-full object-contain scale-[3.2] invert dark:invert-0 transition-all duration-300" /></div><h2 className="font-display font-bold text-2xl sm:text-3xl text-aura-text">Your Aura is Live!</h2><p className="text-aura-text-secondary text-sm mt-2 sm:mt-3 max-w-sm">Share your unique link and QR code with your audience.</p></div>
            <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Profile Link</label><div className="flex gap-2"><div className="flex-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-aura-text text-sm sm:text-base font-medium truncate">{window.location.origin}/{auraTree?.slug}</div><button onClick={() => copyToClipboard(`${window.location.origin}/${auraTree?.slug}`)} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-aura-violet text-white hover:bg-aura-violet/90 transition-all shadow-lg"><LucideCopy className="w-5 h-5 sm:w-6 sm:h-6" /></button></div></div>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-white/[0.03] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5"><div className="w-24 h-24 sm:w-32 sm:h-32 bg-white p-1.5 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden shrink-0 flex items-center justify-center"><QRCodeSVG id="qr-code-svg" value={`${API_V1_URL}/auratree/qr/${auraTree?.slug}`} size={512} style={{ width: '100%', height: '100%' }} level="H" includeMargin={false} imageSettings={{ src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTYwIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiByeD0iMjUiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNjAgMTEwIEw2MCA3MCBNNjAgODAgTDQwIDU1IE02MCA4MCBMODAgNTUgTTYwIDcwIEw1MCA0MCBNNjAgNzAgTDcwIDQwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+", x: undefined, y: undefined, height: 128, width: 128, excavate: true }} /></div><div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-4"><h4 className="text-aura-text font-bold text-base sm:text-lg leading-tight">Official QR Code</h4><div className="flex flex-wrap items-center justify-center sm:justify-start gap-3"><button onClick={downloadQR} className="flex items-center gap-2 text-aura-violet font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-aura-cyan transition-colors"><LucideDownload className="w-3 h-3 sm:w-4 sm:h-4" /> Download</button><button onClick={shareQR} className="flex items-center gap-2 text-aura-cyan font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-aura-violet transition-colors"><LucideShare className="w-3 h-3 sm:w-4 sm:h-4" /> Share QR</button></div></div></div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text"><LucideX className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-8"><div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4">{newLinkUrl ? <PlatformIcon platform={newLinkUrl.includes('youtube') ? 'youtube' : newLinkUrl.includes('instagram') ? 'instagram' : newLinkUrl.includes('tiktok') ? 'tiktok' : newLinkUrl.includes('spotify') ? 'spotify' : 'website'} className="w-6 h-6 animate-in zoom-in" useColor={true} /> : <LucideLinkIcon className="w-6 h-6 text-aura-violet" />}</div><h2 className="font-display font-bold text-2xl text-aura-text">Add a new link</h2><p className="text-aura-text-secondary text-sm text-center mt-2">Paste your URL and we'll handle the rest.</p></div>
            <form onSubmit={handleAddLink} className="space-y-6">
              <div className="space-y-2"><input type="text" autoFocus required placeholder="e.g. youtube.com/aura" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" /></div>
              <button type="submit" disabled={!newLinkUrl} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30">Add to Profile <LucideArrowLeft className="w-5 h-5 rotate-180" /></button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingLink && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text"><LucideX className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-8"><div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4"><LucideSettings className="w-6 h-6 text-aura-violet" /></div><h2 className="font-display font-bold text-2xl text-aura-text">Edit link</h2></div>
            <form onSubmit={handleUpdateLink} className="space-y-6">
              <div className="space-y-4"><input type="text" required value={editingLink.title} onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" /><input type="text" required value={editingLink.url} onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" /></div>
              <button type="submit" className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3">Save Changes <LucideCheck className="w-5 h-5" /></button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deletingLink && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-sm:w-full max-w-sm glass-card p-8 shadow-[0_0_50px_rgba(255,97,97,0.1)] animate-in zoom-in duration-300" data-lenis-prevent>
            <div className="flex flex-col items-center text-center"><div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"><LucideX className="w-8 h-8 text-red-500" /></div><h2 className="font-display font-bold text-2xl text-aura-text">Are you sure?</h2><p className="text-aura-text-secondary text-sm mt-3">Remove <span className="text-aura-text font-semibold">"{deletingLink.title}"</span>?</p></div>
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={handleDeleteLink} 
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <LucideLoader2 className="w-5 h-5 animate-spin" /> : 'Yes, delete link'}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAvatarModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowDeleteAvatarModal(false)} />
          <div className="relative w-full max-sm:w-full max-w-sm glass-card p-8 animate-in zoom-in duration-300" data-lenis-prevent>
            <div className="flex flex-col items-center text-center"><div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"><LucideCamera className="w-8 h-8 text-red-500" /></div><h2 className="font-display font-bold text-2xl text-aura-text">Remove Photo?</h2></div>
            <div className="flex flex-col gap-3 mt-8"><button onClick={handleDeleteAvatar} className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">Yes, remove photo</button><button onClick={() => setShowDeleteAvatarModal(false)} className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all">Cancel</button></div>
          </div>
        </div>
      )}

      {showCancelSubModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowCancelSubModal(false)} />
          <div className="relative w-full max-sm:w-full max-w-sm glass-card p-8 shadow-[0_0_50px_rgba(255,97,97,0.1)] animate-in zoom-in duration-300" data-lenis-prevent>
            <div className="flex flex-col items-center text-center"><div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"><LucideZap className="w-8 h-8 text-red-500" /></div><h2 className="font-display font-bold text-2xl text-aura-text">Cancel Plan?</h2><p className="text-aura-text-secondary text-sm mt-3">You will keep premium access until <span className="text-aura-text font-semibold">{new Date(userData?.subscription?.expiresAt).toLocaleDateString()}</span>.</p></div>
            <div className="flex flex-col gap-3 mt-8"><button onClick={confirmCancelSubscription} disabled={isCancelling} className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2">{isCancelling ? <LucideLoader2 className="w-5 h-5 animate-spin" /> : 'Yes, stop billing'}</button><button onClick={() => setShowCancelSubModal(false)} className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all">Keep my plan</button></div>
          </div>
        </div>
      )}

      {showCreatePageModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowCreatePageModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 animate-in zoom-in duration-300">
            <button onClick={() => setShowCreatePageModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-white">
              <LucideX className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4">
                <LucidePlus className="w-8 h-8 text-aura-violet" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">New Aura Page</h2>
              <p className="text-aura-text-secondary text-sm text-center mt-2">
                Create an additional live profile page.
              </p>
            </div>
            
            <form onSubmit={handleCreateNewPage} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Display Name</label>
                  <input 
                    type="text" 
                    required
                    value={newPageData.displayName}
                    onChange={e => setNewPageData({...newPageData, displayName: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                    placeholder="e.g. My Portfolio"
                  />
                </div>
                {!isFree && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Custom Slug</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newPageData.slug}
                        onChange={e => setNewPageData({...newPageData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                        placeholder="your-custom-link"
                      />
                    </div>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isCreatingNewPage || !newPageData.displayName}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 disabled:opacity-50"
              >
                {isCreatingNewPage ? <LucideLoader2 className="w-6 h-6 animate-spin" /> : 'Create Page'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} />

      {showDeletePageModal && deletingPage && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowDeletePageModal(false)} />
          <div className="relative w-full max-w-sm glass-card p-8 shadow-[0_0_50px_rgba(255,97,97,0.1)] animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                <LucideTrash className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Delete Page?</h2>
              <p className="text-aura-text-secondary text-sm mt-3">
                This will permanently delete <span className="text-aura-text font-bold">"{deletingPage.displayName}"</span> and all its links and analytics.
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={handleDeletePage}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <LucideLoader2 className="w-5 h-5 animate-spin" /> : 'Yes, delete permanently'}
              </button>
              <button 
                onClick={() => setShowDeletePageModal(false)}
                className="w-full py-4 rounded-2xl bg-white/5 text-aura-text font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
