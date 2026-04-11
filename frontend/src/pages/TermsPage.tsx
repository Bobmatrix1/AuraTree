import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { FileText, Scale, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import PropellerAd from '../components/PropellerAd';
import Footer from '../sections/Footer';
import Starfield from '../components/Starfield';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';

gsap.registerPlugin(ScrollTrigger);

interface PageProps {
  onContactClick: () => void;
}

const TermsPage = ({ onContactClick }: PageProps) => {
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
              <FileText className="w-6 h-6 text-aura-violet" />
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">Terms of Service</h1>
            <p className="text-aura-text-secondary text-sm">Last Updated: March 30, 2026</p>
          </div>

          <div className="glass-card p-8 sm:p-12 space-y-10 text-aura-text-secondary leading-relaxed">
            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-violet rounded-full" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using AuraTree, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-cyan rounded-full" />
                2. User Accounts
              </h2>
              <p className="mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for safeguarding your password.</li>
                <li>You may not use as a username the name of another person or entity that is not lawfully available for use.</li>
                <li>AuraTree reserves the right to refuse service or terminate accounts at our sole discretion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-pink rounded-full" />
                3. Acceptable Use
              </h2>
              <p className="mb-4">
                You agree not to use AuraTree for any unlawful purposes or to conduct any unlawful activity, including, but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fraud or cyber-crimes.</li>
                <li>Distribution of malware or viruses.</li>
                <li>Spamming or sending unsolicited communications.</li>
                <li>Impersonating AuraTree staff or other users.</li>
              </ul>
            </section>

            {/* Ad in Terms of Service */}
            <div className="py-4 border-y border-white/5">
              <PropellerAd zoneId="your_terms_zone" format="banner" className="mx-auto" />
            </div>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-mint rounded-full" />
                4. Intellectual Property
              </h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of AuraTree and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-amber rounded-full" />
                5. Subscription and Billing
              </h2>
              <p>
                AuraTree offers both free and paid subscription plans. Payments are processed securely via Paystack. You may cancel your subscription at any time through your dashboard. No refunds are provided for partial subscription periods.
              </p>
            </section>

            <section>
              <h2 className="text-white font-display font-bold text-xl mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-aura-violet rounded-full" />
                6. Contact Us
              </h2>
              <p className="mb-6">
                If you have any questions about these Terms, please contact us at:
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

export default TermsPage;
