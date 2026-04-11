import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download, Sparkles, Smartphone, Chrome } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
      // Show iOS prompt on every refresh if not standalone
      setShowPrompt(true);
    } else {
      setPlatform('android');
      // Android/Chrome logic
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        setDeferredPrompt(e);
        setShowPrompt(true);
      });
    }

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] animate-in slide-in-from-bottom duration-500 lg:left-auto lg:right-8 lg:bottom-8 lg:w-96">
      <div className="glass-card p-6 border-aura-violet/30 shadow-2xl relative overflow-hidden bg-aura-navy/90 backdrop-blur-2xl">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-aura-violet/10 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-aura-text-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aura-violet to-aura-cyan p-[1px] shrink-0">
            <div className="w-full h-full rounded-2xl bg-aura-navy flex items-center justify-center">
              <img src="/aura tree icon.png" className="w-8 h-8 object-contain" alt="AuraTree" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-aura-text text-lg flex items-center gap-2">
              Install Aura Tree <Sparkles className="w-4 h-4 text-aura-pink animate-pulse" />
            </h3>
            <p className="text-aura-text-secondary text-sm mt-1 leading-relaxed">
              Add AuraTree to your home screen for a faster, premium experience.
            </p>

            {platform === 'ios' ? (
              <div className="mt-4 space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs font-bold text-aura-violet uppercase tracking-widest">iOS Install Guide:</p>
                <div className="flex items-center gap-3 text-xs text-aura-text-secondary">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Share className="w-3 h-3 text-aura-cyan" />
                  </div>
                  <span>Tap the <span className="text-white font-bold">Share</span> button in Safari</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-aura-text-secondary">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-3 h-3 text-aura-mint" />
                  </div>
                  <span>Scroll down and tap <span className="text-white font-bold">"Add to Home Screen"</span></span>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleInstallClick}
                className="mt-4 w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-aura-violet/20"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[10px] text-aura-text-secondary/50 font-bold uppercase tracking-widest border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3 h-3" /> Mobile Optimized
          </div>
          <div className="flex items-center gap-1.5">
            <Chrome className="w-3 h-3" /> Secure Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
