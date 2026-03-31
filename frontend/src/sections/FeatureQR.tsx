import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Share2, Download, Link2, Eye, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { User as FirebaseUser } from 'firebase/auth';

gsap.registerPlugin(ScrollTrigger);

interface FeatureQRProps {
  user: FirebaseUser | null;
}

const FeatureQR = ({ user }: FeatureQRProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      import('../config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'users', user.uid)).then(snapshot => {
            if (snapshot.exists()) setUserData(snapshot.data());
          });
        });
      });
    }
  }, [user]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Simple entrance reveal
      gsap.fromTo(
        [visualRef.current, textRef.current],
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
      style={{ zIndex: 50 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 xl:gap-20 items-center max-w-7xl mx-auto">
          {/* Visual Block - First on Mobile */}
          <div ref={visualRef} className="order-1 lg:order-2">
            <div className={`glass-card p-4 sm:p-6 lg:p-8 transition-all duration-700 ${(userData?.auraScore || 0) >= 95 ? 'shadow-[0_0_50px_rgba(123,97,255,0.4)] border-aura-violet/50' : ''}`}>
              {/* QR Code Display */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div className={`w-40 h-40 sm:w-48 sm:h-48 lg:w-48 lg:h-48 rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 mb-4 sm:mb-5 shadow-2xl flex items-center justify-center transition-all duration-700 ${(userData?.auraScore || 0) >= 95 ? 'bg-gradient-to-br from-aura-violet to-aura-cyan p-1' : ''}`}>
                  <div className="bg-white w-full h-full rounded-lg sm:rounded-xl p-3 flex items-center justify-center">
                    {/* Real Scannable QR Code */}
                    <QRCodeSVG 
                      value={userData?.auraTreeSlug ? `https://auratree.link/${userData.auraTreeSlug}` : "https://auratree.link/demo"}
                      size={256}
                      bgColor={"#FFFFFF"}
                      fgColor={"#070913"}
                      level={"H"}
                      includeMargin={false}
                      className="w-full h-full"
                      imageSettings={{
                        src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTYwIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiByeD0iMjUiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNjAgMTEwIEw2MCA3MCBNNjAgODAgTDQwIDU1IE02MCA4MCBMODAgNTUgTTYwIDcwIEw1MCA0MCBNNjAgNzAgTDcwIDQwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+",
                        x: undefined,
                        y: undefined,
                        height: 64,
                        width: 64,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
                <p className="text-aura-text font-semibold text-base sm:text-lg">auratree.link/yourname</p>
                <p className="text-xs sm:text-sm text-aura-text-secondary mt-1">Scan to visit</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: Download, label: 'Download', color: 'bg-aura-violet/20 text-aura-violet' },
                  { icon: Link2, label: 'Copy Link', color: 'bg-aura-cyan/20 text-aura-cyan' },
                  { icon: Eye, label: 'Preview', color: 'bg-aura-pink/20 text-aura-pink' },
                ].map((action, i) => (
                  <button 
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${action.color}`}>
                      <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-aura-text-secondary">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Block - Second on Mobile */}
          <div ref={textRef} className="order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-aura-violet" />
              <span className="text-xs sm:text-sm font-medium text-aura-violet uppercase tracking-wider">Share</span>
            </div>
            
            <h2 className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight">
              One scan. <span className="text-gradient-violet">Everywhere.</span>
            </h2>
            
            <p className="text-aura-text-secondary text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10">
              Download your QR code, copy your link, or share directly to stories, DMs, and bios.
            </p>

            <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {[
                'High-res QR for print + stories',
                'Short link, always editable',
                'Preview before you post',
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
              Get your QR code
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureQR;
