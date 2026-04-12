import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Mail, Phone, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

// Sections
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import FeaturesOrbit from './sections/FeaturesOrbit';
import FeatureAnalytics from './sections/FeatureAnalytics';
import FeatureThemes from './sections/FeatureThemes';
import FeatureQR from './sections/FeatureQR';
import EditorPreview from './sections/EditorPreview';
import SocialProof from './sections/SocialProof';
import Pricing from './sections/Pricing';
import FAQ from './sections/FAQ';
import FinalCTA from './sections/FinalCTA';
import Footer from './sections/Footer';

// Components
import Starfield from './components/Starfield';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PropellerAdsManager from './components/PropellerAdsManager';
import DemoModal from './components/DemoModal';
import AuthModal from './components/AuthModal';
import ComparePlansModal from './components/ComparePlansModal';
import ReviewModal from './components/ReviewModal';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

gsap.registerPlugin(ScrollTrigger);

// Global Contact Panel Component
const GlobalContactPanel = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => (
  <Sheet open={isOpen} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="bg-[var(--aura-navy)] border-l border-white/10 backdrop-blur-2xl w-full sm:max-w-md p-0 z-[200] opacity-[0.98]" data-lenis-prevent>
      <div className="relative h-full overflow-y-auto no-scrollbar">
        <div className="p-8 flex flex-col min-h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-aura-violet/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aura-violet/20 to-aura-cyan/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-aura-violet" />
              </div>
            </div>

            <div className="space-y-2 mb-12">
              <SheetTitle className="font-display font-bold text-3xl text-aura-text">Get in <span className="text-gradient-violet">touch.</span></SheetTitle>
              <SheetDescription className="text-aura-text-secondary">Have a question or need support? Our team is here to help you elevate your Aura.</SheetDescription>
            </div>

            <div className="space-y-6">
              <a 
                href="mailto:john@feel-flytech.site" 
                className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-violet/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-aura-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-aura-violet" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest mb-1">Email Us</p>
                  <p className="text-aura-text font-medium text-sm sm:text-base">john@feel-flytech.site</p>
                </div>
                <ExternalLink className="w-4 h-4 text-aura-text-secondary/30 group-hover:text-aura-violet transition-colors" />
              </a>

              <a 
                href="tel:+2349048564696" 
                className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-violet/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-aura-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-aura-cyan" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest mb-1">Call Us</p>
                  <p className="text-aura-text font-medium">+234 904 856 4696</p>
                </div>
                <ExternalLink className="w-4 h-4 text-aura-text-secondary/30 group-hover:text-aura-cyan transition-colors" />
              </a>

              <a 
                href="https://wa.me/2348060593953" 
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-mint/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-aura-mint/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-aura-mint" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.569-.074 1.758-.706 2.006-1.388.248-.683.248-1.265.173-1.388-.075-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest mb-1">Chat on WhatsApp</p>
                  <p className="text-aura-text font-medium">Message Support</p>
                </div>
                <ExternalLink className="w-4 h-4 text-aura-text-secondary/30 group-hover:text-aura-mint transition-colors" />
              </a>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-aura-violet/5 border border-aura-violet/10 relative overflow-hidden">
              <Sparkles className="absolute -bottom-2 -right-2 w-12 h-12 text-aura-violet/10" />
              <p className="text-sm text-aura-text font-medium mb-2">Office Hours</p>
              <p className="text-xs text-aura-text-secondary leading-relaxed">
                Monday – Friday: 9am – 6pm WAT<br />
                We typically respond within 10 mins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

// Global Loader Component
const PageLoader = () => (
  <div className="fixed inset-0 z-[200] bg-aura-navy flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-aura-violet border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(123,97,255,0.3)]" />
      <p className="text-aura-text-secondary font-display font-medium animate-pulse">Syncing your Aura...</p>
    </div>
  </div>
);

// Separate Landing Page Component
const LandingPage = ({ user, onCompareClick, onContactClick }: { 
  user: FirebaseUser | null, 
  onCompareClick: () => void,
  onContactClick: () => void
}) => {
  const [showDemo, setShowDemo] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure native scrolling logic is handled by Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after a short delay
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./config/firebase');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    // Handle hash scrolling (e.g. /#pricing) when landing page mounts
    if (window.location.hash === '#pricing') {
      const scrollWithRetry = (retries = 0) => {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname);
          }, 1000);
        } else if (retries < 5) {
          setTimeout(() => scrollWithRetry(retries + 1), 200);
        }
      };
      setTimeout(() => scrollWithRetry(), 600);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-aura-navy overflow-x-hidden">
      <Starfield />
      <div className="noise-overlay" />
      
      <Navigation 
        user={user}
        onDemoClick={() => setShowDemo(true)} 
        onAuthClick={() => navigate('/signup')} 
        onLoginClick={() => navigate('/login')} 
        onContactClick={onContactClick}
      />
      
      <main className="relative z-10">
        <HeroSection user={user} onDemoClick={() => setShowDemo(true)} onAuthClick={() => navigate('/signup')} />
        <FeaturesOrbit />
        <FeatureAnalytics />
        <FeatureThemes />
        <FeatureQR user={user} />
        <EditorPreview onAuthClick={() => navigate('/signup')} />
        <SocialProof user={user} onReviewClick={() => setShowReviewModal(true)} />
        <Pricing user={user} onPlanClick={(plan) => {
          if (user) {
            const currentPlan = (userData?.subscription?.plan || 'starter').toLowerCase();
            if (plan.toLowerCase() === 'starter' || plan.toLowerCase() === currentPlan) {
              navigate('/dashboard');
            } else {
              window.location.href = `/checkout?plan=${plan}`;
            }
          } else {
            navigate('/signup');
          }
        }} />
        <FAQ />
        <FinalCTA user={user} onCompareClick={onCompareClick} onAuthClick={() => navigate('/signup')} />
        <Footer 
          onContactOpenChange={onContactClick} 
        />
      </main>
      
      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} />
    </div>
  );
};

function App() {
  const [showCompare, setShowCompare] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Referral Tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referred_by', ref);
    }
  }, []);

  // Global Scroll Reset on Route Change
  useEffect(() => {
    const resetScroll = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
    };
    resetScroll();
  }, [window.location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <HelmetProvider>
      <Router>
        <PropellerAdsManager />
        <PWAInstallPrompt />
        <Routes>
          <Route path="/" element={<LandingPage user={user} onCompareClick={() => setShowCompare(true)} onContactClick={() => setIsContactOpen(true)} />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<AboutPage onContactClick={() => setIsContactOpen(true)} />} />
          <Route path="/blog" element={<BlogPage onContactClick={() => setIsContactOpen(true)} />} />
          <Route path="/careers" element={<CareersPage onContactClick={() => setIsContactOpen(true)} />} />
          <Route path="/privacy" element={<PrivacyPage onContactClick={() => setIsContactOpen(true)} />} />
          <Route path="/terms" element={<TermsPage onContactClick={() => setIsContactOpen(true)} />} />
          <Route path="/:slug" element={<ProfilePage />} />
        </Routes>
        
        {/* Compare Plans Modal */}
        <ComparePlansModal isOpen={showCompare} onClose={() => setShowCompare(false)} />
        
        {/* Global Contact Panel */}
        <GlobalContactPanel isOpen={isContactOpen} onOpenChange={setIsContactOpen} />
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(11, 16, 37, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F4F6FF',
            },
          }}
        />
      </Router>
    </HelmetProvider>
  );
}

export default App;
