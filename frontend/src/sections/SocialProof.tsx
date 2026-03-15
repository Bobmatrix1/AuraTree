import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SocialProof = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
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
  ];

  const avatars = [
    { src: "/avatars/avatar-1.jpg", name: "Mina" },
    { src: "/avatars/avatar-2.jpg", name: "Jonas" },
    { src: "/avatars/avatar-3.jpg", name: "Sofia" },
    { src: "/avatars/avatar-4.jpg", name: "Alex" },
    { src: "/avatars/avatar-5.jpg", name: "Emma" },
    { src: "/avatars/avatar-6.jpg", name: "Lucas" },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0-30%)
      scrollTl.fromTo(
        headlineRef.current,
        { y: '-8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        subcopyRef.current,
        { y: '-6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.08
      );

      scrollTl.fromTo(
        contentRef.current,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.14
      );

      // EXIT (70-100%)
      scrollTl.fromTo(
        contentRef.current,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        [headlineRef.current, subcopyRef.current],
        { y: 0, opacity: 1 },
        { y: '-6vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

    }, section);

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ zIndex: 70 }}
    >
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="text-center z-20 mb-4 sm:mb-6 lg:mb-8 px-4">
          <h2
            ref={headlineRef}
            className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
          >
            Loved by <span className="text-gradient-violet">creators,</span> founders, and teams.
          </h2>
          <p
            ref={subcopyRef}
            className="mt-2 sm:mt-3 lg:mt-4 text-aura-text-secondary text-sm sm:text-base lg:text-lg max-w-lg mx-auto"
          >
            Join thousands turning their bio into a destination.
          </p>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="w-full max-w-4xl">
          {/* Desktop: Orbiting Avatars */}
          <div className="hidden lg:block relative h-64 mb-8">
            {/* Avatar Ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              {avatars.map((avatar, index) => {
                const angle = (index * 60) * (Math.PI / 180);
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index % testimonials.length)}
                    className={`absolute w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                      activeTestimonial === index % testimonials.length
                        ? 'border-aura-violet scale-110 shadow-glow-violet'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <img
                      src={avatar.src}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile/Tablet: Avatar Row */}
          <div className="flex lg:hidden justify-center gap-2 sm:gap-3 mb-6">
            {avatars.slice(0, 5).map((avatar, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index % testimonials.length)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                  activeTestimonial === index % testimonials.length
                    ? 'border-aura-violet scale-110'
                    : 'border-white/20'
                }`}
              >
                <img
                  src={avatar.src}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Testimonial Card */}
          <div className="glass-card p-5 sm:p-6 lg:p-8 max-w-lg mx-auto">
            <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-aura-violet/50 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg lg:text-xl text-aura-text leading-relaxed mb-4 sm:mb-6">
              "{testimonials[activeTestimonial].quote}"
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={testimonials[activeTestimonial].avatar}
                alt={testimonials[activeTestimonial].name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-aura-violet/30"
              />
              <div>
                <p className="font-display font-semibold text-aura-text text-sm sm:text-base">
                  {testimonials[activeTestimonial].name}
                </p>
                <p className="text-xs sm:text-sm text-aura-text-secondary">
                  {testimonials[activeTestimonial].role}
                </p>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    activeTestimonial === i
                      ? 'bg-aura-violet w-4 sm:w-6'
                      : 'bg-white/20 hover:bg-white/40 w-1.5 sm:w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
