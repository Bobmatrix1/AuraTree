import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface FinalCTAProps {
  onCompareClick: () => void;
  onAuthClick: () => void;
  user: FirebaseUser | null;
}

const FinalCTA = ({ onCompareClick, onAuthClick, user }: FinalCTAProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
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
      className="relative w-full min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-20 flex items-center justify-center"
      style={{ zIndex: 100 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div 
          ref={contentRef}
          className="max-w-2xl lg:max-w-3xl mx-auto text-center"
        >
          {/* Decorative Element */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-0.5 animate-pulse-glow flex-shrink-0">
              <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center border-2 border-aura-navy overflow-hidden">
                <img 
                  src="/aura%20tree%20logo.png" 
                  alt="Aura Tree Logo" 
                  className="w-full h-full object-cover scale-[2.2] invert dark:invert-0 transition-all duration-300" 
                />
              </div>
            </div>
          </div>

          <h2 className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6">
            Ready to own your <span className="text-gradient-violet">bio?</span>
          </h2>
          
          <p className="text-aura-text-secondary text-sm sm:text-base lg:text-lg xl:text-xl mb-8 sm:mb-10 max-w-lg mx-auto">
            Create your Aura Tree in under 5 minutes. Free forever to start.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="btn-primary flex items-center gap-2 group text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
              >
                Go to dashboard
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button 
                onClick={onAuthClick}
                className="btn-primary flex items-center gap-2 group text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
              >
                Create your page — it's free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button 
              onClick={onCompareClick}
              className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
            >
              Compare plans
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
