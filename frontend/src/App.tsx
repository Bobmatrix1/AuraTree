import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import Starfield from './components/Starfield';
import DemoModal from './components/DemoModal';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import ProfilePage from './pages/ProfilePage';
import ComparePlansModal from './components/ComparePlansModal';
import { Toaster } from '@/components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';

gsap.registerPlugin(ScrollTrigger);

// Global Loader Component
const PageLoader = () => (
  <div className="fixed inset-0 z-[200] bg-aura-navy flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-aura-violet border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(123,97,255,0.3)]" />
      <p className="text-aura-text-secondary font-display font-medium animate-pulse">Syncing your Aura...</p>
    </div>
  </div>
);

import AuthPage from './pages/AuthPage';

// Separate Landing Page Component
const LandingPage = ({ user, onCompareClick }: { 
  user: FirebaseUser | null, 
  onCompareClick: () => void
}) => {
  const [showDemo, setShowDemo] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Lenis ONLY on the landing page
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Force scroll restoration to auto for internal pages
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      // Ensure everything is unlocked when leaving
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.classList.remove('lenis-stopped');
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
          // Clear hash after scroll to prevent repeated triggers
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname);
          }, 1000);
        } else if (retries < 5) {
          setTimeout(() => scrollWithRetry(retries + 1), 200);
        }
      };
      
      // Delay slightly to allow Lenis and animations to initialize
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
      />
      
      <main className="relative z-10">
        <HeroSection user={user} onDemoClick={() => setShowDemo(true)} onAuthClick={() => navigate('/signup')} />
        <FeaturesOrbit />
        <FeatureAnalytics />
        <FeatureThemes />
        <FeatureQR user={user} />
        <EditorPreview onAuthClick={() => navigate('/signup')} />
        <SocialProof />
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
        <Footer />
      </main>
      
      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
};

function App() {
  const [showCompare, setShowCompare] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Scroll Reset on Route Change
  useEffect(() => {
    const resetScroll = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
    };
    
    // Call once on init
    resetScroll();
    
    // Since we're using a single-page app architecture, we'll also reset on pathname changes
    const originalPathname = window.location.pathname;
    const interval = setInterval(() => {
      if (window.location.pathname !== originalPathname) {
        resetScroll();
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

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
        <Routes>
          <Route path="/" element={<LandingPage user={user} onCompareClick={() => setShowCompare(true)} />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/:slug" element={<ProfilePage />} />
        </Routes>
        
        {/* Compare Plans Modal */}
        <ComparePlansModal isOpen={showCompare} onClose={() => setShowCompare(false)} />
        
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
