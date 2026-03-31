import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Layout,
  Smartphone,
  BarChart3,
  Heart,
  Rocket,
  Layers,
  Fingerprint,
  Users,
  QrCode,
  Gauge,
  Activity,
  PlayCircle,
  Clock,
  X,
  Link as LinkIcon,
  CheckCircle2,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Music2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../sections/Footer';
import Starfield from '../components/Starfield';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface PageProps {
  onContactClick: () => void;
}

const AboutPage = ({ onContactClick }: PageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoUrl, setDemoUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLink, setDetectedLink] = useState<any>(null);

  useEffect(() => {
    // Redirect to home if page is refreshed
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
      window.location.href = '/';
      return;
    }

    window.scrollTo(0, 0);

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

    const ctx = gsap.context(() => {
      // Small delay to ensure DOM is fully painted during route transition
      setTimeout(() => {
        gsap.fromTo('.about-hero-content > *', 
          { y: 15, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: 'power2.out',
            onComplete: () => ScrollTrigger.refresh()
          }
        );

        gsap.utils.toArray('.reveal-section').forEach((section: any) => {
          gsap.fromTo(section, 
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: section,
                start: 'top 92%',
              }
            }
          );
        });
      }, 100);
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  const handleDemoDetection = () => {
    if (!demoUrl) return;
    setIsDetecting(true);
    setDetectedLink(null);

    setTimeout(() => {
      const url = demoUrl.toLowerCase();
      let platform = {
        name: 'Website',
        icon: Globe,
        color: 'bg-aura-violet',
        title: 'My Custom Link'
      };

      if (url.includes('spotify')) {
        platform = { name: 'Spotify', icon: Music2, color: 'bg-[#1DB954]', title: 'Listen on Spotify' };
      } else if (url.includes('youtube')) {
        platform = { name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]', title: 'Watch on YouTube' };
      } else if (url.includes('instagram')) {
        platform = { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', title: 'Follow on Instagram' };
      } else if (url.includes('twitter') || url.includes('x.com')) {
        platform = { name: 'Twitter / X', icon: Twitter, color: 'bg-black', title: 'Follow on X' };
      }

      setDetectedLink(platform);
      setIsDetecting(false);
    }, 1200);
  };

  const handleAffiliateClick = () => {
    if (auth.currentUser) {
      navigate('/dashboard?tab=affiliate');
    } else {
      navigate('/signup?tab=affiliate');
    }
  };

  const coreFeatures = [
    {
      icon: Gauge,
      title: "Aura Score",
      description: "Our proprietary algorithm analyzes your page engagement and aesthetic harmony to give you a real time Aura Score which helps you optimize your presence for maximum impact."
    },
    {
      icon: Activity,
      title: "Real time Analytics",
      description: "You can track every click and view as it happens while our dashboard provides deep insights into your audience geography and peak engagement hours."
    },
    {
      icon: Clock,
      title: "Instant Detection",
      description: "When you paste a URL our engine identifies the platform in under 500ms and automatically applies the correct branding and icon for you."
    },
    {
      icon: QrCode,
      title: "Dynamic QR Engine",
      description: "Every AuraTree comes with a high resolution branded QR code and you can change your links anytime without ever needing to replace the code itself."
    }
  ];

  const planTiers = [
    {
      name: "Starter",
      limit: "1 Link Page",
      price: "Free",
      features: ["Standard Themes", "Fast Support", "QR Code"]
    },
    {
      name: "Pro",
      limit: "5 Link Pages",
      price: "₦1,000/mo",
      features: ["Standard Analytics", "Premium Themes", "Aura Score", "Link Customization"]
    },
    {
      name: "Teams",
      limit: "Unlimited Pages",
      price: "₦10,000/mo",
      features: ["Advanced Analytics", "Custom Branding", "Full Team Access", "Priority Support", "Bulk Management"]
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-aura-navy text-aura-text overflow-x-hidden">
      <Starfield />
      <div className="noise-overlay" />
      
      <Navigation 
        user={auth.currentUser}
        onDemoClick={() => setIsDemoOpen(true)} 
        onAuthClick={() => navigate('/signup')} 
        onLoginClick={() => navigate('/login')} 
        onContactClick={onContactClick}
      />

      <main className="relative z-10 pt-20 lg:pt-28">
        {/* Floating Back Button (Bottom Left) */}
        <div className="fixed bottom-8 left-6 sm:left-10 z-[100]">
          <Link 
            to="/" 
            className="flex items-center justify-center w-12 h-12 text-aura-text-secondary hover:text-aura-text transition-all group bg-aura-navy/40 backdrop-blur-xl rounded-full border border-white/10 hover:border-aura-violet shadow-2xl"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
          <div className="about-hero-content text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aura-violet/10 border border-aura-violet/20 text-aura-violet text-[10px] uppercase tracking-widest font-bold mb-6">
              <Sparkles className="w-3 h-3" />
              <span>The Aura Ecosystem</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight">
              A premium destination <br className="hidden lg:block"/> for your <span className="text-gradient-violet">digital Aura.</span>
            </h1>
            <p className="text-aura-text-secondary text-base lg:text-xl leading-relaxed max-w-2xl mx-auto">
              AuraTree is a sophisticated platform built to centralize your digital world with precision and beauty.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreFeatures.map((f, i) => (
              <div key={i} className="glass-card-sm p-6 hover:border-aura-violet/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-aura-violet/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-aura-violet" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-aura-text-secondary text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Demo */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="glass-card p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-aura-violet/5 blur-[120px] -mr-48 -mt-48" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">Experience the Demo</h2>
                <div className="space-y-6 text-aura-text-secondary text-base leading-relaxed">
                  <p>
                    We believe in trying before you trust so our interactive demo allows you to test our 
                    Visual Editor without even creating an account first. 
                  </p>
                  <p>
                    Experience the speed of our Instant Link Detection where you simply paste a link and 
                    watch AuraTree intelligently parse the metadata and fetch the correct brand colors 
                    to present it beautifully in real time.
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <button onClick={() => setIsDemoOpen(true)} className="flex items-center gap-2 text-aura-violet font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all">
                      <PlayCircle className="w-5 h-5" />
                      Try Interactive Demo
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center p-4">
                <div className="relative w-[240px] h-[480px] sm:w-[280px] sm:h-[560px] transition-transform group">
                  {/* Phone Frame */}
                  <div className="absolute inset-0 bg-[#050505] rounded-[40px] sm:rounded-[48px] border-[6px] sm:border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden flex flex-col p-4 sm:p-5">
                    <div className="w-12 sm:w-16 h-1 bg-white/10 rounded-full mx-auto mb-6 sm:mb-8" />
                    
                    {/* Mock Profile */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-aura-violet mx-auto mb-4 p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#0A0E21] flex items-center justify-center overflow-hidden">
                        <img src="/aura%20tree%20logo.svg" className="w-[85%] h-[85%] object-contain" alt="Profile" />
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 h-2 bg-white/10 rounded-full mx-auto mb-8" />
                    
                    <div className="space-y-3 sm:space-y-4">
                      {/* Real Social Mock Links */}
                      <div className="w-full h-12 rounded-xl bg-[#FF0000] flex items-center px-4 gap-3 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">YouTube</span>
                      </div>
                      <div className="w-full h-12 rounded-xl bg-[#1DB954] flex items-center px-4 gap-3 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306c-.215.352-.49.463-.842.248-2.81-1.718-6.347-2.104-10.514-1.15-.402.09-.804-.16-.894-.562-.09-.402.16-.804.562-.894 4.562-1.042 8.487-.59 11.6 1.312.352.214.463.49.248.842v.004zm1.472-3.258c-.27.44-.63.578-1.07.308-3.214-1.976-8.114-2.552-11.914-1.4-.5.152-1.02-.14-1.17-.64-.152-.5.14-1.02.64-1.17 4.342-1.316 9.742-.66 13.406 1.594.44.27.578.63.308 1.07v.038zm.128-3.408c-3.85-2.286-10.204-2.5-13.874-1.386-.59.18-1.222-.154-1.402-.744-.18-.59.154-1.222.744-1.402 4.23-1.282 11.254-1.012 15.704 1.628.53.314.706 1.002.392 1.532-.314.53-1.002.706-1.532.392l-.032-.02z"/></svg>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Spotify</span>
                      </div>
                      <div className="w-full h-12 rounded-xl bg-black border border-white/10 flex items-center px-4 gap-3 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.83 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">TikTok</span>
                      </div>
                    </div>

                    <div className="mt-auto pb-4 flex flex-col items-center gap-4">
                      <div className="flex justify-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/5" />
                        <div className="w-6 h-6 rounded-full bg-white/5" />
                      </div>
                      <div className="px-3 py-1 rounded-full bg-aura-mint/10 border border-aura-mint/20">
                        <p className="text-[7px] text-aura-mint font-bold uppercase tracking-widest animate-pulse">Live Visual Session</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl mb-4">Pricing & Plan Limits</h2>
            <p className="text-aura-text-secondary max-w-2xl mx-auto">Scalable solutions for individuals and enterprise teams.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {planTiers.map((tier, i) => (
              <div key={i} className="glass-card-sm p-8 text-center hover:border-aura-violet/20 transition-all">
                <p className="text-xs font-bold text-aura-violet uppercase tracking-widest mb-2">{tier.name}</p>
                <h3 className="text-3xl font-display font-bold mb-4">{tier.price}</h3>
                <div className="py-4 border-y border-white/5 mb-6">
                  <p className="text-aura-text font-bold mb-1">{tier.limit}</p>
                  <p className="text-[10px] text-aura-text-secondary uppercase tracking-widest">Page Capacity</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="text-xs text-aura-text-secondary flex items-center justify-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-aura-violet" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Affiliate */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="glass-card p-8 lg:p-12 bg-aura-violet/5 border-aura-violet/20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
               <div>
                  <div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-aura-violet" />
                  </div>
                  <h2 className="font-display font-bold text-3xl mb-6">The Affiliate Program</h2>
                  <div className="space-y-4 text-aura-text-secondary leading-relaxed mb-8">
                    <p>
                      Grow with us and our industry leading affiliate system which offers a 20% lifetime recurring commission 
                      on every Pro and Teams subscription referred through your unique link.
                    </p>
                    <p>
                      You will get access to a dedicated affiliate dashboard to track your earnings and monitor referral signups 
                      while withdrawing your commissions directly to your bank account whenever you want.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-xl font-display font-bold text-aura-text">20%</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-aura-text-secondary">Commission</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-xl font-display font-bold text-aura-text">Lifetime</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-aura-text-secondary">Tracking</p>
                    </div>
                  </div>
               </div>
               <div className="glass-card p-6 bg-white/[0.02]">
                  <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-aura-mint" />
                    Affiliate Earnings
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-aura-violet/20" />
                            <div>
                               <p className="text-xs font-bold">New Referral</p>
                               <p className="text-[10px] text-aura-text-secondary">Teams Plan Subscription</p>
                            </div>
                         </div>
                         <p className="text-aura-mint font-bold text-sm whitespace-nowrap">+₦2,000</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="glass-card p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-aura-violet/10 blur-[120px]" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">Ready to elevate your Aura?</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group px-10">
                  Join AuraTree
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={handleAffiliateClick}
                  className="btn-secondary w-full sm:w-auto px-10 flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Become an Affiliate
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onContactOpenChange={onContactClick} />
    </div>
  );
};

export default AboutPage;
