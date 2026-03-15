import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play, ShoppingBag, Music, FileText, Image, LayoutDashboard } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  user: FirebaseUser | null;
  onDemoClick: () => void;
  onAuthClick: () => void;
}

const HeroSection = ({ user, onDemoClick, onAuthClick }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const orbitCardsRef = useRef<HTMLDivElement>(null);

  const orbitCards = [
    { icon: FileText, label: 'Blog', color: 'from-aura-violet/40 to-aura-cyan/40' },
    { icon: ShoppingBag, label: 'Store', color: 'from-aura-pink/40 to-aura-violet/40' },
    { icon: Music, label: 'Podcast', color: 'from-aura-cyan/40 to-aura-mint/40' },
    { icon: Image, label: 'Gallery', color: 'from-aura-amber/40 to-aura-pink/40' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Load animation timeline
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Center card entrance
      loadTl.fromTo(
        centerCardRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6 },
        0.1
      );

      // Orbit cards entrance (only on desktop)
      const isDesktop = window.innerWidth >= 1024;
      
      if (isDesktop) {
        loadTl.fromTo(
          orbitCardsRef.current,
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5 },
          0.25
        );
      }

      // Headline entrance
      loadTl.fromTo(
        headlineRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.45
      );

      // Subhead entrance
      loadTl.fromTo(
        subheadRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.6
      );

      // CTA entrance
      loadTl.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.75
      );

      // Scroll-driven exit animation - ONLY ON DESKTOP
      if (isDesktop) {
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              // Smoothly fade out elements as we scroll
              gsap.set(centerCardRef.current, { x: -100 * p, opacity: 1 - p * 1.5 });
              if (orbitCardsRef.current) {
                gsap.set(orbitCardsRef.current, { opacity: 1 - p * 2 });
              }
              gsap.set([headlineRef.current, subheadRef.current, ctaRef.current], { 
                y: -50 * p, 
                opacity: 1 - p * 1.5 
              });
            }
          }
        });
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen lg:overflow-hidden pt-32 pb-20 lg:pt-36 lg:pb-24 bg-aura-navy"
      style={{ zIndex: 10 }}
    >
      {/* Content Container */}
      <div className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Headline */}
        <div className="text-center z-20 mb-6 lg:mb-8 mt-4 lg:mt-0">
          <h1
            ref={headlineRef}
            className="font-display font-bold text-aura-text leading-[1.1] sm:leading-[0.95] tracking-[-0.02em] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
          >
            Your links. Your aura.{' '}
            <span className="text-gradient-violet block sm:inline">One powerful page.</span>
          </h1>
          <p
            ref={subheadRef}
            className="mt-4 text-aura-text-secondary text-sm sm:text-base lg:text-lg xl:text-xl max-w-xl mx-auto px-4 leading-relaxed"
          >
            A link-in-bio that feels like you, fast, beautiful, and effortless to manage.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center gap-4 z-20 mb-10 lg:mb-12"
        >
          {user ? (
            <Link 
              to="/dashboard"
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-sm sm:text-base px-8 py-4"
            >
              Go to dashboard
              <LayoutDashboard className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <button 
              onClick={onAuthClick}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-sm sm:text-base px-8 py-4"
            >
              Create your page — it's free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <button 
            onClick={onDemoClick}
            className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base px-8 py-4"
          >
            <Play className="w-4 h-4" />
            View demo
          </button>
        </div>

        {/* Center Profile Card */}
        <div
          ref={centerCardRef}
          className="relative z-10 w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[480px]"
        >
          <div className="glass-card w-full flex flex-col items-center justify-center p-6 sm:p-8 animate-breathe">
            {/* Avatar with Logo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-0.5 mb-4 sm:mb-6 shadow-2xl shadow-aura-violet/20">
              <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center border-2 border-aura-navy overflow-hidden">
                <img 
                  src="/aura%20tree%20logo.png" 
                  alt="Aura Tree Logo" 
                  className="w-full h-full object-cover scale-[2.2] invert dark:invert-0 transition-all duration-300" 
                />
              </div>
            </div>
            <h3 className="font-display font-semibold text-base sm:text-lg text-aura-text">@auratree</h3>
            <p className="text-xs sm:text-sm text-aura-text-secondary text-center mt-1">
              Creator & Designer
            </p>
            <div className="flex gap-2 mt-3 sm:mt-4">
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-aura-violet/20 text-aura-violet">7 links</span>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-aura-cyan/20 text-aura-cyan">Pro</span>
            </div>
          </div>
        </div>

        {/* Desktop Orbiting Cards - Fixed Overlap */}
        <div 
          ref={orbitCardsRef}
          className="hidden lg:block absolute inset-0 pointer-events-none"
        >
          {orbitCards.map((card, index) => {
            const positions = [
              'left-[5%] top-[30%]',    // Top Left: Blog
              'right-[5%] top-[35%]',   // Top Right: Store
              'right-[8%] top-[70%]',   // Bottom Right: Podcast
              'left-[8%] top-[65%]',    // Bottom Left: Gallery
            ];
            return (
              <div
                key={index}
                className={`absolute ${positions[index]} pointer-events-auto`}
              >
                <div 
                  className="glass-card-sm p-3 xl:p-4 w-[120px] xl:w-[140px] animate-float-slow"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className={`w-8 h-8 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-2 xl:mb-3`}>
                    <card.icon className="w-4 h-4 xl:w-5 xl:h-5 text-aura-violet" />
                  </div>
                  <p className="text-xs xl:text-sm font-medium text-aura-text">{card.label}</p>
                  <p className="text-[10px] xl:text-xs text-aura-text-secondary mt-0.5">Add to profile</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Feature Pills - Shown only on mobile */}
        <div className="flex lg:hidden flex-wrap justify-center gap-2 mt-6 z-10">
          {orbitCards.map((card, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-full glass-card-sm"
            >
              <card.icon className="w-4 h-4 text-aura-violet" />
              <span className="text-xs text-aura-text">{card.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
