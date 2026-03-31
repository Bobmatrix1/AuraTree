import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Twitter, Instagram, Github, Mail, Phone, MessageSquare, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  isContactOpen?: boolean;
  onContactOpenChange?: (open: boolean) => void;
}

const Footer = ({ isContactOpen, onContactOpenChange }: FooterProps) => {
  const footerRef = useRef<HTMLElement>(null);

  const setIsContactOpen = onContactOpenChange || (() => {});

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      // Simple fade-in without scrubbing to prevent lag
      gsap.fromTo(
        footer,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSocial = (platform: string) => {
    toast.success(`Opening ${platform}`, {
      description: 'Follow us for updates!',
    });
  };

  const links = {
    Product: [
      { label: 'Features', id: 'features' },
      { label: 'Themes', id: 'themes' },
      { label: 'Pricing', id: 'pricing' },
    ],
    Company: [
      { label: 'About', path: '/about' },
      { label: 'Blog', path: '/blog' },
      { label: 'Contact Us', action: () => setIsContactOpen(true) },
      { label: 'Careers', path: '/careers' },
    ],
    Legal: [
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
    ],
  };

  return (
    <footer
      ref={footerRef}
      className="relative w-full py-12 sm:py-16 border-t border-white/5"
      style={{ zIndex: 110 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div 
                className="flex items-center gap-0 mb-4"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 -ml-2 sm:-mr-2 flex items-center justify-center transition-transform duration-300">
                  <img 
                    src="/aura%20tree%20logo.png" 
                    alt="Aura Tree Logo" 
                    className="w-full h-full object-contain scale-[3.2] invert dark:invert-0 transition-all duration-300" 
                  />
                </div>
                <span className="font-display font-semibold text-base sm:text-lg text-aura-text transition-colors">
                  Aura Tree
                </span>
              </div>
              <p className="text-aura-text-secondary text-xs sm:text-sm">
                Your links. Your aura. One powerful page.
              </p>
            </div>

            {/* Links */}
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-display font-semibold text-aura-text mb-3 sm:mb-4 text-sm sm:text-base">
                  {category}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {items.map((item: any, i) => (
                    <li key={i}>
                      {item.id ? (
                        <button
                          onClick={() => scrollToSection(item.id!)}
                          className="text-xs sm:text-sm text-aura-text-secondary hover:text-aura-text transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : item.path ? (
                        <Link
                          to={item.path}
                          className="text-xs sm:text-sm text-aura-text-secondary hover:text-aura-text transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="text-xs sm:text-sm text-aura-text-secondary hover:text-aura-text transition-colors"
                        >
                          {item.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-white/5">
            <p className="text-xs sm:text-sm text-aura-text-secondary/60 mb-4 sm:mb-0 text-center sm:text-left">
              © 2026 Aura Tree. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              {[
                { icon: Twitter, name: 'Twitter' },
                { icon: Instagram, name: 'Instagram' },
                { icon: Github, name: 'GitHub' },
              ].map((social) => (
                <button
                  key={social.name}
                  onClick={() => handleSocial(social.name)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-aura-text-secondary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
