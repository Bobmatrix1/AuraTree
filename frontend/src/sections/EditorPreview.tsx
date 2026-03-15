import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, GripVertical, Youtube, Instagram, Music, ExternalLink, Twitter } from 'lucide-react';
import { SiYoutube, SiInstagram, SiSpotify, SiX } from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

interface EditorPreviewProps {
  onAuthClick: () => void;
}

const EditorPreview = ({ onAuthClick }: EditorPreviewProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  const [links] = useState([
    { icon: SiYoutube, title: 'Latest YouTube Video', url: 'youtube.com/c/aura', color: 'bg-[#FF0000]' },
    { icon: SiInstagram, title: 'Photography Portfolio', url: 'instagram.com/aura.tree', color: 'bg-gradient-to-tr from-[#FFB800] via-[#FF0000] to-[#D300C5]' },
    { icon: SiSpotify, title: 'Weekly Playlist', url: 'open.spotify.com/playlist', color: 'bg-[#1DB954]' },
    { icon: SiX, title: 'Daily Thoughts', url: 'twitter.com/aura_tree', color: 'bg-[#000000]' },
  ]);

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
            end: '+=130%',
            pin: true,
            scrub: 0.6,
          }
        });

        // ENTRANCE (0-35%)
        scrollTl.fromTo(
          editorRef.current,
          { x: '-50vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out' },
          0
        );

        scrollTl.fromTo(
          phoneRef.current,
          { x: '50vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out' },
          0.05
        );

        // EXIT (70-100%)
        scrollTl.to(
          editorRef.current,
          { x: '-20vw', opacity: 0, ease: 'power2.in' },
          0.75
        );

        scrollTl.to(
          phoneRef.current,
          { x: '20vw', opacity: 0, ease: 'power2.in' },
          0.75
        );
      } else {
        // Mobile simple fade in
        gsap.fromTo(
          [editorRef.current, phoneRef.current],
          { opacity: 0, y: 40 },
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
      className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden bg-aura-navy py-24 sm:py-32 lg:py-0 flex items-center"
      style={{ zIndex: 60 }}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--aura-violet) 1px, transparent 1px),
            linear-gradient(90deg, var(--aura-violet) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content Container */}
      <div 
        ref={containerRef}
        className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 xl:gap-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        
        {/* Editor Panel */}
        <div
          ref={editorRef}
          className="w-full max-w-md lg:max-w-none lg:w-[50%] xl:w-[45%]"
        >
          <div className="glass-card w-full flex flex-col shadow-2xl overflow-hidden border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 bg-white/5">
              <div>
                <h3 className="font-display font-bold text-xl text-aura-text">Your links</h3>
                <p className="text-xs text-aura-text-secondary mt-1">Manage and reorder your bio links</p>
              </div>
              <button 
                onClick={onAuthClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aura-violet text-white text-sm font-semibold hover:bg-aura-violet/90 transition-all shadow-lg shadow-aura-violet/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            </div>

            {/* Link List */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[400px] lg:max-h-[500px] overflow-y-auto custom-scrollbar">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-aura-violet/40 hover:bg-white/[0.05] transition-all group cursor-grab active:cursor-grabbing"
                >
                  <div className="text-aura-text-secondary/30 group-hover:text-aura-violet transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className={`w-11 h-11 rounded-2xl ${link.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-aura-text font-bold text-sm sm:text-base truncate group-hover:text-aura-violet transition-colors">{link.title}</p>
                    <p className="text-[11px] text-aura-text-secondary truncate mt-0.5 opacity-60">{link.url}</p>
                  </div>
                  <button className="p-2 rounded-xl bg-white/5 hover:bg-aura-violet/20 text-aura-text-secondary hover:text-aura-violet transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-aura-text-secondary font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-aura-mint animate-pulse" />
                Live Preview Active
              </div>
              <p className="text-[11px] text-aura-text-secondary/60">
                Drag to reorder
              </p>
            </div>
          </div>
        </div>

        {/* Phone Preview */}
        <div
          ref={phoneRef}
          className="w-full max-w-[280px] lg:max-w-[320px] flex-shrink-0"
        >
          <div className="relative w-full aspect-[9/18.5] rounded-[3rem] bg-aura-navy p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-[6px] border-white/10 ring-1 ring-white/5">
            {/* Screen - Adaptive Background */}
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-aura-navy-light relative border border-aura-glass-border">
              {/* Notch - Adaptive */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-aura-navy rounded-b-3xl z-10 border-x border-b border-aura-glass-border" />
              
              {/* Dynamic Content */}
              <div className="flex flex-col items-center pt-10 px-5 h-full overflow-hidden">
                {/* Profile Section */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-0.5 mb-3 shadow-xl shadow-aura-violet/10 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-aura-navy-light flex items-center justify-center border-2 border-aura-navy-light overflow-hidden">
                    <img 
                      src="/aura%20tree%20logo.png" 
                      alt="Aura Tree Logo" 
                      className="w-full h-full object-cover scale-[2.2] invert dark:invert-0 transition-all duration-300" 
                    />
                  </div>
                </div>
                
                <h3 className="font-display font-bold text-aura-text text-sm tracking-tight flex-shrink-0">@auratree</h3>
                <p className="text-aura-text-secondary text-[9px] text-center mt-1 max-w-[160px] leading-tight flex-shrink-0">
                  Design system & links collection.
                </p>

                {/* Live Links - Condensed for no-scroll */}
                <div className="w-full mt-5 space-y-2 overflow-hidden flex-shrink">
                  {links.map((link, index) => (
                    <div
                      key={index}
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] dark:bg-white/5 border border-aura-glass-border hover:bg-white/[0.08] transition-all cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-lg ${link.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <link.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="flex-1 text-left text-[10px] font-bold text-aura-text truncate">
                        {link.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Brand - Pulled up */}
                <div className="mt-6 mb-4 flex items-center gap-1.5 opacity-30 flex-shrink-0">
                  <Plus className="w-2.5 h-2.5 text-aura-violet rotate-45" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-aura-text">Aura Tree</span>
                </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-aura-glass-border rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorPreview;
