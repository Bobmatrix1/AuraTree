import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Eye, MousePointer, Globe, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FeatureAnalytics = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const stats = [
    { icon: Eye, label: 'Total Views', value: '12.5K', change: '+23%' },
    { icon: MousePointer, label: 'Link Clicks', value: '3.2K', change: '+18%' },
    { icon: Globe, label: 'Top Source', value: 'Instagram', change: '' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Simple entrance reveal
      gsap.fromTo(
        [textRef.current, visualRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen py-24 sm:py-32 flex items-center"
      style={{ zIndex: 30 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 xl:gap-20 items-center max-w-7xl mx-auto">
          {/* Visual Block - First on Mobile */}
          <div ref={visualRef} className="order-1 lg:order-2">
            <div className="glass-card p-4 sm:p-6 lg:p-8">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="font-display font-semibold text-aura-text text-sm sm:text-base">Performance</h3>
                <div className="flex gap-2">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-aura-violet/20 text-aura-violet">7 days</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-white/5 text-aura-text-secondary hidden sm:inline">30 days</span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-40 sm:h-48 lg:h-48 mb-6 sm:mb-8">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 300 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 80 Q 30 70 60 75 T 120 50 T 180 45 T 240 30 T 300 20"
                    fill="none"
                    stroke="#7B61FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 80 Q 30 70 60 75 T 120 50 T 180 45 T 240 30 T 300 20 L 300 100 L 0 100 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-aura-violet" />
                      <span className="text-[10px] sm:text-xs text-aura-text-secondary truncate">{stat.label}</span>
                    </div>
                    <p className="font-display font-bold text-sm sm:text-lg text-aura-text">{stat.value}</p>
                    {stat.change && (
                      <p className="text-[10px] sm:text-xs text-aura-mint mt-0.5 sm:mt-1">{stat.change}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text Block - Second on Mobile */}
          <div ref={textRef} className="order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-aura-violet" />
              <span className="text-xs sm:text-sm font-medium text-aura-violet uppercase tracking-wider">Analytics</span>
            </div>
            
            <h2 className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight">
              See what's <span className="text-gradient-violet">working.</span>
            </h2>
            
            <p className="text-aura-text-secondary text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10">
              Views, clicks, and top referrers—updated in real time. No setup. No scripts.
            </p>

            <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {[
                'Daily, weekly, and monthly trends',
                'Click-through rates by link',
                'Top traffic sources',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-aura-text text-sm sm:text-base">
                  <div className="w-6 h-6 rounded-full bg-aura-violet/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-aura-violet text-xs font-bold">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button className="flex items-center gap-2 text-aura-violet font-semibold hover:gap-3 transition-all group text-sm sm:text-base">
              Explore analytics
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureAnalytics;
