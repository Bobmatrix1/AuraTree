import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link2, Palette, QrCode } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FeaturesOrbit = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Link2,
      title: 'Auto-detect links',
      description: 'Instagram, TikTok, Spotify, YouTube, and more. We automatically detect and style your links.',
    },
    {
      icon: Palette,
      title: 'Custom themes',
      description: 'Fonts, gradients, glass intensity—make it unmistakably yours.',
    },
    {
      icon: QrCode,
      title: 'QR + Share',
      description: 'One scan to your page. Share anywhere, anytime.',
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 1024;

      if (isDesktop) {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 0.6,
          }
        });

        // ENTRANCE (0-30%)
        scrollTl.fromTo(
          headlineRef.current,
          { y: '-10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        );

        scrollTl.fromTo(
          subcopyRef.current,
          { y: '-6vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.08
        );

        // Cards entrance
        scrollTl.fromTo(
          cardsRef.current,
          { y: '20vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.1
        );

        // EXIT (70-100%)
        scrollTl.to(
          cardsRef.current,
          { y: '15vh', opacity: 0, ease: 'power2.in' },
          0.7
        );

        scrollTl.to(
          [headlineRef.current, subcopyRef.current],
          { y: '-8vh', opacity: 0, ease: 'power2.in' },
          0.72
        );
      } else {
        // Simple fade-in for mobile without pinning
        gsap.fromTo(
          [headlineRef.current, subcopyRef.current, cardsRef.current],
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.2,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
            }
          }
        );
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden flex items-center justify-center py-24 sm:py-32 lg:py-0"
      style={{ zIndex: 20 }}
    >
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Headline */}
        <div className="text-center z-20 mb-12 lg:mb-16 px-4">
          <h2
            ref={headlineRef}
            className="font-display font-bold text-aura-text text-3xl sm:text-4xl lg:text-5xl leading-tight"
          >
            Everything you need to share—
            <span className="text-gradient-violet block sm:inline">automatically.</span>
          </h2>
          <p
            ref={subcopyRef}
            className="mt-4 lg:mt-6 text-aura-text-secondary text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Paste a link. We handle the icon, title, and layout. You stay in control.
          </p>
        </div>

        {/* Feature Cards - Mobile: Stack, Desktop: Row */}
        <div 
          ref={cardsRef}
          className="w-full max-w-6xl px-2 sm:px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 sm:p-8 lg:p-8 animate-float flex flex-col items-center sm:items-start text-center sm:text-left"
                style={{ animationDelay: `${index * 0.3}s`, animationDuration: `${4 + index}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aura-violet/30 to-aura-cyan/30 flex items-center justify-center mb-6 shadow-lg shadow-aura-violet/10">
                  <feature.icon className="w-7 h-7 text-aura-violet" />
                </div>
                <h3 className="font-display font-semibold text-xl text-aura-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-aura-text-secondary text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesOrbit;
