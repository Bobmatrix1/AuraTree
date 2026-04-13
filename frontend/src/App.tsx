import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import SocialProof from './sections/SocialProof';
import FeaturesOrbit from './sections/FeaturesOrbit';
import FeatureThemes from './sections/FeatureThemes';
import FeatureAnalytics from './sections/FeatureAnalytics';
import EditorPreview from './sections/EditorPreview';
import FeatureQR from './sections/FeatureQR';
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

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    // Presence check
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Smooth Scroll Initialization
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  if (loading) return null;

  return (
    <HelmetProvider>
      <Router>
        <Starfield />
        <PropellerAdsManager />
        <PWAInstallPrompt />
        <Routes>
          <Route path="/" element={
            <main className="relative z-10 overflow-x-hidden">
              <Navigation 
                user={user} 
                onAuthClick={() => setIsAuthOpen(true)} 
                onDemoClick={() => setIsDemoOpen(true)} 
                onLoginClick={() => setIsAuthOpen(true)}
                onContactClick={() => setIsContactOpen(true)}
              />
              <HeroSection user={user} onAuthClick={() => setIsAuthOpen(true)} onDemoClick={() => setIsDemoOpen(true)} />
              <FeaturesOrbit />
              <FeatureThemes />
              <EditorPreview onAuthClick={() => setIsAuthOpen(true)} />
              <FeatureAnalytics />
              <FeatureQR user={user} />
              <Pricing user={user} onPlanClick={() => setIsAuthOpen(true)} />
              <SocialProof />
              <FAQ />
              <FinalCTA user={user} onAuthClick={() => setIsAuthOpen(true)} onCompareClick={() => setShowCompare(true)} />
              <Footer onContactOpenChange={() => setIsContactOpen(true)} />
            </main>
          } />
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

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        <ComparePlansModal isOpen={showCompare} onClose={() => setShowCompare(false)} />
        
        {/* Contact Sheet */}
        <Sheet open={isContactOpen} onOpenChange={setIsContactOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-aura-navy/95 backdrop-blur-xl border-aura-glass-border p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-8 border-b border-white/5">
                <SheetTitle className="font-display font-bold text-3xl text-aura-text mb-2">Get in touch</SheetTitle>
                <SheetDescription className="text-aura-text-secondary text-base">
                  Have a question or need assistance? We're here to help you elevate your digital Aura.
                </SheetDescription>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-aura-violet uppercase tracking-[0.2em]">Contact Channels</h4>
                  
                  <a href="mailto:support@feel-flytech.site" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-aura-violet/30 hover:bg-aura-violet/5 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-aura-violet/10 flex items-center justify-center text-aura-violet group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest mb-1">Email Support</p>
                      <p className="text-aura-text font-medium">support@feel-flytech.site</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-aura-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <a href="tel:+2349048564696" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-aura-cyan/30 hover:bg-aura-cyan/5 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-aura-cyan/10 flex items-center justify-center text-aura-cyan group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest mb-1">Call Us</p>
                      <p className="text-aura-text font-medium">+234 904 856 4696</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-aura-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-aura-pink/30 hover:bg-aura-pink/5 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-aura-pink/10 flex items-center justify-center text-aura-pink group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest mb-1">Live Chat</p>
                      <p className="text-aura-text font-medium">Available 9am - 5pm WAT</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-aura-violet/10 to-aura-cyan/10 border border-white/5 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-display font-bold text-lg text-aura-text mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-aura-pink" /> Premium Support
                    </h4>
                    <p className="text-sm text-aura-text-secondary leading-relaxed">
                      Pro and Teams members get priority response times and dedicated account management.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-aura-violet/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => setIsContactOpen(false)}
                  className="w-full btn-primary py-4 text-sm font-bold shadow-lg shadow-aura-violet/20"
                >
                  Close Contact Info
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(7, 9, 19, 0.8)',
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
