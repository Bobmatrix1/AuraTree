import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const PropellerAdsManager = ({ isAuthOpen }: { isAuthOpen?: boolean }) => {
  const location = useLocation();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isPlanLoaded, setIsPlanLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const plan = userDoc.data()?.subscription?.plan || 'free';
          setUserPlan(plan);
        } catch (e) {
          setUserPlan('free');
        }
      } else {
        setUserPlan('free');
      }
      setIsPlanLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const criticalPages = ['/checkout', '/admin', '/login', '/signup', '/register'];
    const isModalVisuallyOpen = document.body.style.overflow === 'hidden' && !!document.querySelector('.glass-card h2')?.textContent?.match(/Sign In|Create Account|Login|Signup|Reset Password/i);
    const isProtectedContext = criticalPages.some(page => location.pathname.startsWith(page)) || isAuthOpen || isModalVisuallyOpen;

    // SHIELD: Intercept all network calls to ad domains in protected contexts
    if (isProtectedContext) {
      console.log('🛡️ Network Shield Active: Blocking Ad Domains');
      
      // Override Fetch
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        if (url.includes('6opo.com') || url.includes('quge5.com') || url.includes('5gvci.com') || url.includes('proproads')) {
          return Promise.reject(new Error('Blocked by Aura Shield'));
        }
        return originalFetch.apply(this, args);
      };

      // Override XHR
      const originalXHR = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function(...args: any[]) {
        const url = args[1];
        if (typeof url === 'string' && (url.includes('6opo.com') || url.includes('quge5.com') || url.includes('5gvci.com'))) {
          console.warn('Blocked XHR to ad domain');
          return; 
        }
        return originalXHR.apply(this, args as any);
      };

      nuclearRemoveAds();
      
      return () => {
        window.fetch = originalFetch;
        window.XMLHttpRequest.prototype.open = originalXHR;
      };
    }

    if (!isPlanLoaded) return;

    if (userPlan && userPlan !== 'free') {
      nuclearRemoveAds();
      return;
    }

    const LAST_AD_KEY = 'strict_ad_lockdown_ts';
    const THROTTLE_MS = 3 * 60 * 1000;

    const checkLockdown = () => {
      const lastAd = localStorage.getItem(LAST_AD_KEY);
      const now = Date.now();
      if (lastAd && (now - parseInt(lastAd)) < THROTTLE_MS) {
        nuclearRemoveAds();
        return true;
      }
      return false;
    };

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const isAuthClick = target.closest('a[href="/login"], a[href="/signup"], button.auth-trigger, .glass-card input, .glass-card button');
      
      if (isAuthClick || isAuthOpen || isProtectedContext) {
        return;
      }

      if (checkLockdown()) return;

      localStorage.setItem(LAST_AD_KEY, Date.now().toString());
      
      setTimeout(() => {
        nuclearRemoveAds();
      }, 1000);
    };

    function loadAdScript() {
      if (checkLockdown() || isProtectedContext) return;
      if (document.querySelector('script[data-zone="228814"]')) return;
      
      const script = document.createElement('script');
      script.src = "https://quge5.com/88/tag.min.js";
      script.dataset.zone = "228814";
      script.async = true;
      script.dataset.cfasync = "false";
      document.head.appendChild(script);
    }

    function nuclearRemoveAds() {
      // 1. Remove scripts
      document.querySelectorAll('script[data-zone="228814"]').forEach(s => s.remove());
      document.querySelectorAll('script[src*="quge5.com"], script[src*="5gvci.com"], script[src*="6opo.com"]').forEach(s => s.remove());
      
      // 2. Clear global objects
      const pKeys = ['propeller', 'prophsh', 'pps', 'pp_ms', 'pp_s', 'pp_ns', 'p_v', 'p_r'];
      pKeys.forEach(key => {
        try {
          (window as any)[key] = undefined;
          delete (window as any)[key];
        } catch (e) {}
      });

      // 3. Force stop any remaining timers
      let id = window.setTimeout(() => {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    }

    loadAdScript();
    window.addEventListener('mousedown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [location.pathname, userPlan, isPlanLoaded, isAuthOpen]);

  return null;
};

export default PropellerAdsManager;
