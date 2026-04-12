import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const PropellerAdsManager = () => {
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
    // LAYER 1: Absolute block until plan is verified
    if (!isPlanLoaded) return;

    // LAYER 2: Absolute block for Paid Users
    if (userPlan && userPlan !== 'free') {
      console.log('Premium user detected: Ads blocked permanently.');
      nuclearRemoveAds();
      return;
    }

    // LAYER 3: Block for critical pages
    const criticalPages = ['/checkout', '/admin'];
    if (criticalPages.some(page => location.pathname.startsWith(page))) {
      nuclearRemoveAds();
      return;
    }

    const LAST_AD_KEY = 'strict_ad_lockdown_ts';
    const THROTTLE_MS = 3 * 60 * 1000; // 3 Minutes

    const checkLockdown = () => {
      const lastAd = localStorage.getItem(LAST_AD_KEY);
      const now = Date.now();
      if (lastAd && (now - parseInt(lastAd)) < THROTTLE_MS) {
        nuclearRemoveAds();
        return true;
      }
      return false;
    };

    const handleInteraction = () => {
      if (checkLockdown()) return;

      // START LOCKDOWN: Mark current time as "Ad Fired"
      localStorage.setItem(LAST_AD_KEY, Date.now().toString());
      console.log('Ad triggered. Entering 3-minute silence mode.');
      
      // Give the ad 1 second to actually trigger its pop-under, then kill everything
      setTimeout(() => {
        nuclearRemoveAds();
      }, 1000);
    };

    function loadAdScript() {
      if (checkLockdown()) return;
      if (document.querySelector('script[data-zone="228814"]')) return;
      
      const script = document.createElement('script');
      script.src = "https://quge5.com/88/tag.min.js";
      script.dataset.zone = "228814";
      script.async = true;
      script.dataset.cfasync = "false";
      document.head.appendChild(script);
    }

    function nuclearRemoveAds() {
      // 1. Remove the main script
      document.querySelectorAll('script[data-zone="228814"]').forEach(s => s.remove());
      
      // 2. Clear all global Propeller objects to prevent background triggers
      const pKeys = ['propeller', 'prophsh', 'pps', 'pp_ms', 'pp_s', 'pp_ns'];
      pKeys.forEach(key => {
        try {
          (window as any)[key] = undefined;
          delete (window as any)[key];
        } catch (e) {}
      });

      // 3. Remove any injected scripts from their CDN
      document.querySelectorAll('script[src*="quge5.com"], script[src*="5gvci.com"]').forEach(s => s.remove());
      
      // 4. Force clear any existing click listeners by Propeller if possible
      // (This is a fallback as we can't easily list all listeners)
    }

    loadAdScript();
    window.addEventListener('mousedown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [location.pathname, userPlan, isPlanLoaded]);

  return null;
};

export default PropellerAdsManager;
