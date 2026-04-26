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

    const adDomains = ['6opo.com', 'quge5.com', '5gvci.com', 'pl254321.top', 'proproads'];

    // SHIELD: Intercept all network calls to ad domains
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      if (adDomains.some(domain => url.includes(domain))) {
        // Return a fake successful response that contains nothing
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return originalFetch.apply(this, args);
    };

    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(...args: any[]) {
      const url = args[1];
      if (typeof url === 'string' && adDomains.some(domain => url.includes(domain))) {
        // Just return and don't actually open the connection
        return; 
      }
      return originalXHR.apply(this, args as any);
    };

    if (isProtectedContext) {
      nuclearRemoveAds();
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
      document.querySelectorAll('script[data-zone="228814"]').forEach(s => s.remove());
      document.querySelectorAll('script[src*="quge5.com"], script[src*="5gvci.com"], script[src*="6opo.com"], script[src*="pl254321.top"]').forEach(s => s.remove());
      
      const pKeys = ['propeller', 'prophsh', 'pps', 'pp_ms', 'pp_s', 'pp_ns', 'p_v', 'p_r'];
      pKeys.forEach(key => {
        try {
          (window as any)[key] = undefined;
          delete (window as any)[key];
        } catch (e) {}
      });

      let id = window.setTimeout(() => {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    }

    loadAdScript();
    window.addEventListener('mousedown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest.prototype.open = originalXHR;
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [location.pathname, userPlan, isPlanLoaded, isAuthOpen]);

  return null;
};

export default PropellerAdsManager;
