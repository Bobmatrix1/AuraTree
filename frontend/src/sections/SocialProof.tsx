import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Sparkles } from 'lucide-react';
import { API_V1_URL } from '@/config/api';
import type { User as FirebaseUser } from 'firebase/auth';

gsap.registerPlugin(ScrollTrigger);

interface SocialProofProps {
  user?: FirebaseUser | null;
  onReviewClick?: () => void;
}

const SocialProof = ({ user, onReviewClick }: SocialProofProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultTestimonials = [
    {
      quote: "Setup took 3 minutes. It looks like I hired a designer.",
      name: "Mina R.",
      role: "Creator",
      avatar: "/avatars/avatar-1.jpg",
    },
    {
      quote: "The QR code alone saved our launch day.",
      name: "Jonas K.",
      role: "Founder",
      avatar: "/avatars/avatar-2.jpg",
    },
    {
      quote: "Finally, a link-in-bio that feels premium.",
      name: "Sofia L.",
      role: "Creative Director",
      avatar: "/avatars/avatar-3.jpg",
    },
    {
      quote: "The analytics are incredibly deep and helpful for my growth.",
      name: "Alex M.",
      role: "Influencer",
      avatar: "/avatars/avatar-4.jpg",
    },
    {
      quote: "Customization options are far beyond anything else I've tried.",
      name: "Emma S.",
      role: "Artist",
      avatar: "/avatars/avatar-5.jpg",
    },
    {
      quote: "Aura Tree transformed how I share my professional work.",
      name: "Lucas G.",
      role: "Software Engineer",
      avatar: "/avatars/avatar-6.jpg",
    },
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_V1_URL}/testimonials`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setTestimonials(data.data);
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (error) {
        setTestimonials(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;
  // Clone the first item for the loop
  const extendedTestimonials = [...displayTestimonials, displayTestimonials[0]];

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setActiveTestimonial((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, displayTestimonials.length]);

  // Master Loop Logic
  useEffect(() => {
    if (activeTestimonial === extendedTestimonials.length - 1) {
      // We've reached the clone at the end
      const timer = setTimeout(() => {
        setIsTransitioning(false); // Disable transition for the jump
        setActiveTestimonial(0); // Snap back to true first item
      }, 1000); // Wait for the glide to finish (1000ms is duration)
      return () => clearTimeout(timer);
    }
  }, [activeTestimonial, extendedTestimonials.length]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 lg:py-32"
      style={{ zIndex: 70 }}
    >
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-aura-violet border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center">
          {/* Content */}
          <div className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Headline */}
            <div className="text-center z-20 mb-12 px-4">
              <h2
                className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
              >
                Loved by <span className="text-gradient-violet">creators,</span> founders, and teams.
              </h2>
              <p
                className="mt-2 sm:mt-3 lg:mt-4 text-aura-text-secondary text-sm sm:text-base lg:text-lg max-w-lg mx-auto"
              >
                Join thousands turning their bio into a destination.
              </p>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-5xl mt-8">
              {/* Desktop View */}
              <div className="hidden lg:block relative mb-12">
                {/* Avatar Row */}
                <div className="flex justify-center gap-6 mb-12">
                  {displayTestimonials.map((testimonial, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsTransitioning(true);
                        setActiveTestimonial(index);
                      }}
                      className={`relative w-20 h-20 rounded-2xl transition-all duration-500 ${
                        (activeTestimonial % displayTestimonials.length) === index
                          ? 'border-aura-violet scale-110 shadow-glow-violet rotate-3'
                          : 'border-white/10 hover:border-white/30 -rotate-3 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                      } border-2 overflow-hidden`}
                    >
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Sliding Desktop Card Container */}
                <div className="relative z-10 w-full max-w-3xl mx-auto overflow-hidden px-4">
                  <div 
                    className="flex"
                    style={{ 
                      transform: `translateX(-${activeTestimonial * 100}%)`,
                      transition: isTransitioning ? 'transform 1000ms cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                    }}
                  >
                    {extendedTestimonials.map((testimonial, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-6">
                        <div className="glass-card p-10 lg:p-12 shadow-[0_0_50px_rgba(0,0,0,0.3)] min-h-[350px] flex flex-col justify-between">
                          <div>
                            <Quote className="w-10 h-10 text-aura-violet/50 mb-6" />
                            <p className="text-xl lg:text-2xl text-aura-text leading-relaxed mb-8 font-medium">
                              "{testimonial?.quote}"
                            </p>
                          </div>
                          <div className="flex items-center gap-5">
                            <img
                              src={testimonial?.avatar}
                              alt={testimonial?.name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-aura-violet/30"
                            />
                            <div>
                              <p className="font-display font-semibold text-aura-text text-lg">
                                {testimonial?.name}
                              </p>
                              <p className="text-base text-aura-text-secondary">
                                {testimonial?.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet View */}
              <div className="lg:hidden w-full overflow-hidden">
                <div 
                  className="flex"
                  style={{ 
                    transform: `translateX(-${activeTestimonial * 100}%)`,
                    transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
                  }}
                >
                  {extendedTestimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="glass-card p-6 max-w-lg mx-auto min-h-[250px] flex flex-col justify-between">
                        <div>
                          <Quote className="w-6 h-6 text-aura-violet/50 mb-3" />
                          <p className="text-base sm:text-lg text-aura-text leading-relaxed mb-4">
                            "{testimonial?.quote}"
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <img
                            src={testimonial?.avatar}
                            alt={testimonial?.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-aura-violet/30"
                          />
                          <div>
                            <p className="font-display font-semibold text-aura-text text-sm">
                              {testimonial?.name}
                            </p>
                            <p className="text-xs text-aura-text-secondary">
                              {testimonial?.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Dots & Button */}
              <div className="flex justify-center gap-2 mt-8">
                {displayTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsTransitioning(true);
                      setActiveTestimonial(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      (activeTestimonial % displayTestimonials.length) === i ? 'bg-aura-violet w-6' : 'bg-white/20 w-2'
                    }`}
                  />
                ))}
              </div>

              {/* Leave a Review Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={onReviewClick}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text-secondary hover:text-aura-violet hover:border-aura-violet/30 hover:bg-aura-violet/5 transition-all text-sm font-bold group"
                >
                  <div className="w-4 h-4 flex items-center justify-center overflow-hidden">
                    <img src="/logo-icon.svg" className="w-full h-full object-contain" alt="" />
                  </div>
                  Leave a Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SocialProof;
