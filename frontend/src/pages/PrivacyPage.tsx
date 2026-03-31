import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { Shield, Lock, Eye, FileText, ArrowLeft, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../sections/Footer';
import Starfield from '../components/Starfield';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';

gsap.registerPlugin(ScrollTrigger);

interface PageProps {
  onContactClick: () => void;
}

const PrivacyPage = ({ onContactClick }: PageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
      const targets = gsap.utils.toArray('.legal-content > *');
      if (targets.length > 0) {
        gsap.fromTo(targets, 
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-aura-navy text-aura-text overflow-x-hidden">
      <Starfield />
      <div className="noise-overlay" />
      
      <Navigation 
        user={auth.currentUser}
        onDemoClick={() => {}} 
        onAuthClick={() => {}} 
        onLoginClick={() => {}} 
        onContactClick={onContactClick}
      />

      <main className="relative z-10 pt-24 lg:pt-32 pb-20">
        {/* Floating Back Button */}
        <div className="fixed bottom-8 left-6 sm:left-10 z-[100]">
          <Link 
            to="/" 
            className="flex items-center justify-center w-12 h-12 text-aura-text-secondary hover:text-aura-text transition-all group bg-aura-navy/40 backdrop-blur-xl rounded-full border border-white/10 hover:border-aura-violet shadow-2xl"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto legal-content">
          <div className="mb-12">
            <div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-aura-violet" />
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">Privacy Policy</h1>
            <p className="text-aura-text-secondary text-sm">Last Updated: March 30, 2026</p>
          </div>

          <div className="glass-card p-8 sm:p-12 space-y-10 text-aura-text-secondary leading-relaxed">
            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-violet rounded-full" />
                1. Information We Collect
              </h2>
              <p className="mb-4">
                We collect information you provide directly to us when you create an account, update your profile, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account Information (name, email, password)</li>
                <li>Profile Information (display name, bio, social media links)</li>
                <li>Transaction Information (subscription plans, payment references)</li>
                <li>Communication Information (emails, support tickets)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-cyan rounded-full" />
                2. How We Use Information
              </h2>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processing your AuraTree page rendering and analytics</li>
                <li>Managing your subscription and payments</li>
                <li>Sending technical notices, updates, and security alerts</li>
                <li>Responding to your comments and questions</li>
                <li>Analyzing trends and usage to enhance user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-pink rounded-full" />
                3. Analytics and Cookies
              </h2>
              <p>
                AuraTree uses proprietary tracking to provide you with engagement analytics. We do not use third-party advertising trackers. We use essential cookies to keep you signed in and remember your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-mint rounded-full" />
                4. Data Security
              </h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All passwords are encrypted using industry-standard hashing, and payment information is handled securely by Paystack.
              </p>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-violet rounded-full" />
                5. Contact Us
              </h2>
              <p className="mb-6">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <a href="mailto:support@feel-flytech.site" className="inline-flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-aura-violet transition-all text-aura-text font-bold">
                <Mail className="w-5 h-5 text-aura-violet" />
                support@feel-flytech.site
              </a>
            </section>
          </div>
        </div>
      </main>

      <Footer onContactOpenChange={onContactClick} />
    </div>
  );
};

export default PrivacyPage;
