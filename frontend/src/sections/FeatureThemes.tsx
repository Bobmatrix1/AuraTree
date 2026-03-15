import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Paintbrush, Sparkles, Type, Palette, ArrowRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FeatureThemes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [activeTheme, setActiveTheme] = useState(0);

  const themes = [
    { name: 'Cosmic', gradient: 'from-purple-900/50 via-aura-navy to-aura-navy', accent: '#7B61FF' },
    { name: 'Frost', gradient: 'from-cyan-900/30 via-aura-navy to-aura-navy', accent: '#00D9FF' },
    { name: 'Neon', gradient: 'from-pink-900/30 via-aura-navy to-aura-navy', accent: '#FF61DC' },
    { name: 'Midnight', gradient: 'from-indigo-900/40 via-aura-navy to-aura-navy', accent: '#4F46E5' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 1024;

      // Visual card animation (from left this time)
      gsap.fromTo(
        visualRef.current,
        { x: isDesktop ? '-10vw' : 0, y: isDesktop ? 0 : 40, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: isDesktop ? 'top 80%' : 'top 90%',
            end: isDesktop ? 'top 30%' : 'top 60%',
            scrub: isDesktop ? 0.6 : false,
            once: !isDesktop,
          }
        }
      );

      // Text block animation (from right)
      gsap.fromTo(
        textRef.current,
        { x: isDesktop ? '8vw' : 0, y: isDesktop ? 0 : 30, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: isDesktop ? 'top 80%' : 'top 90%',
            end: isDesktop ? 'top 30%' : 'top 60%',
            scrub: isDesktop ? 0.6 : false,
            once: !isDesktop,
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="themes"
      className="relative w-full min-h-screen py-24 sm:py-32 lg:py-0 flex items-center lg:overflow-hidden"
      style={{ zIndex: 40 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 xl:gap-20 items-center max-w-7xl mx-auto">
          {/* Visual Block */}
          <div ref={visualRef}>
            <div className="glass-card p-4 sm:p-6 lg:p-8">
              {/* Theme Preview */}
              <div 
                className={`relative h-48 sm:h-56 lg:h-64 rounded-xl sm:rounded-2xl bg-gradient-to-b ${themes[activeTheme].gradient} overflow-hidden mb-6 sm:mb-8 transition-all duration-500`}
              >
                {/* Mock Profile */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mb-3 sm:mb-4 transition-all duration-500 shadow-lg"
                    style={{ backgroundColor: themes[activeTheme].accent }}
                  />
                  <div className="w-16 sm:w-20 h-2 sm:h-3 rounded-full bg-white/20 mb-2" />
                  <div className="w-10 sm:w-12 h-1.5 sm:h-2 rounded-full bg-white/10" />
                  
                  {/* Mock Links */}
                  <div className="w-full mt-6 sm:mt-8 space-y-2 sm:space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-full h-8 sm:h-10 rounded-lg sm:rounded-xl backdrop-blur-sm transition-all duration-500"
                        style={{ backgroundColor: `${themes[activeTheme].accent}20` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-aura-text-secondary font-medium">Choose a theme</span>
                <div className="flex gap-2 sm:gap-3">
                  {themes.map((theme, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTheme(i)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        activeTheme === i 
                          ? 'ring-2 ring-white scale-110 shadow-xl shadow-white/10' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: theme.accent }}
                      title={theme.name}
                    >
                      {activeTheme === i && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Block */}
          <div ref={textRef}>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Paintbrush className="w-4 h-4 sm:w-5 sm:h-5 text-aura-violet" />
              <span className="text-xs sm:text-sm font-medium text-aura-violet uppercase tracking-wider">Themes</span>
            </div>
            
            <h2 className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight">
              Make it <span className="text-gradient-violet">unmistakably you.</span>
            </h2>
            
            <p className="text-aura-text-secondary text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10">
              Choose a mood, then fine-tune colors, fonts, and glass intensity. Preview instantly.
            </p>

            <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {[
                { icon: Sparkles, text: 'Preset palettes: Cosmic, Frost, Neon, Midnight' },
                { icon: Palette, text: 'Custom gradients + opacity' },
                { icon: Type, text: 'Font pairings that feel premium' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-aura-text text-sm sm:text-base">
                  <div className="w-6 h-6 rounded-full bg-aura-violet/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-aura-violet" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>

            <button className="flex items-center gap-2 text-aura-violet font-semibold hover:gap-3 transition-all group text-sm sm:text-base">
              Try themes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureThemes;
