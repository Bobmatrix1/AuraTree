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
  const pinSpacerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
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

  useEffect(() => {
    if (loading) return;
    const section = sectionRef.current;
    if (!section) return;

    // Only apply scroll animations if we want them on mobile, 
    // but the request was to remove the "reveal" behavior which usually implies the pinning.
    // We'll remove the pinning/reveal TL entirely for a cleaner flow.

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % displayTestimonials.length);
    }, 6000);

    return () => {
      clearInterval(interval);
    };
  }, [loading, displayTestimonials.length]);

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
              {/* Desktop: Linear Avatars + Centered Card */}
              <div className="hidden lg:block relative mb-12">
                {/* Avatar Row */}
                <div className="flex justify-center gap-6 mb-12">
                  {displayTestimonials.map((testimonial, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`relative w-20 h-20 rounded-2xl transition-all duration-500 ${
                        activeTestimonial === index
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

                {/* Centered Desktop Card */}
                <div className="relative z-10 w-full max-w-2xl mx-auto" key={activeTestimonial}>
                  <div className="glass-card p-10 lg:p-12 shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500">
                    <Quote className="w-10 h-10 text-aura-violet/50 mb-6" />
                    <p className="text-xl lg:text-2xl text-aura-text leading-relaxed mb-8 font-medium">
                      "{displayTestimonials[activeTestimonial]?.quote}"
                    </p>
                    <div className="flex items-center gap-5">
                      <img
                        src={displayTestimonials[activeTestimonial]?.avatar}
                        alt={displayTestimonials[activeTestimonial]?.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-aura-violet/30"
                      />
                      <div>
                        <p className="font-display font-semibold text-aura-text text-lg">
                          {displayTestimonials[activeTestimonial]?.name}
                        </p>
                        <p className="text-base text-aura-text-secondary">
                          {displayTestimonials[activeTestimonial]?.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet View (unchanged) */}
              <div className="lg:hidden">
                <div className="flex justify-center gap-2 sm:gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
                  {displayTestimonials.map((testimonial, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                        activeTestimonial === index
                          ? 'border-aura-violet scale-110'
                          : 'border-white/20'
                      }`}
                    >
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Mobile Testimonial Card */}
                <div className="glass-card p-5 sm:p-6 max-w-lg mx-auto">
                  <Quote className="w-6 h-6 text-aura-violet/50 mb-3" />
                  <p className="text-base sm:text-lg text-aura-text leading-relaxed mb-4">
                    "{displayTestimonials[activeTestimonial]?.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={displayTestimonials[activeTestimonial]?.avatar}
                      alt={displayTestimonials[activeTestimonial]?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-aura-violet/30"
                    />
                    <div>
                      <p className="font-display font-semibold text-aura-text text-sm">
                        {displayTestimonials[activeTestimonial]?.name}
                      </p>
                      <p className="text-xs text-aura-text-secondary">
                        {displayTestimonials[activeTestimonial]?.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Dots & Button */}
              <div className="flex justify-center gap-2 mt-8">
                {displayTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeTestimonial === i ? 'bg-aura-violet w-6' : 'bg-white/20 w-2'
                    }`}
                  />
                ))}
              </div>

              {/* Leave a Review Button - Only show if user is logged in */}
              {user && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={onReviewClick}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text-secondary hover:text-aura-violet hover:border-aura-violet/30 hover:bg-aura-violet/5 transition-all text-sm font-bold group"
                  >
                    <Sparkles className="w-4 h-4 text-aura-violet group-hover:animate-pulse" />
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SocialProof;
