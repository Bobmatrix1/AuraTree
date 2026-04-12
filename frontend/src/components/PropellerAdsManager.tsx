import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const PropellerAdsManager = () => {
  const location = useLocation();
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserPlan(userDoc.data()?.subscription?.plan || 'free');
      } else {
        setUserPlan('free');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 1. COMPLETELY Disable for Paid Users
    if (userPlan && userPlan !== 'free') {
      removeAdScript();
      return;
    }

    // 2. Disable for critical non-dashboard pages
    const criticalPages = ['/checkout', '/admin'];
    if (criticalPages.some(page => location.pathname.startsWith(page))) {
      removeAdScript();
      return;
    }

    // 3. Strict Throttling Logic
    const LAST_AD_KEY = 'last_ad_timestamp';
    const CLICK_COUNT_KEY = 'ad_click_session_count';
    const THROTTLE_MS = 3 * 60 * 1000; // 3 minutes
    const MAX_CLICKS = 3;

    const checkCooldown = () => {
      const lastAdTime = localStorage.getItem(LAST_AD_KEY);
      const now = Date.now();
      if (lastAdTime && now - parseInt(lastAdTime) < THROTTLE_MS) {
        removeAdScript();
        return true;
      }
      return false;
    };

    const handleInteraction = () => {
      if (checkCooldown()) return;

      let clicks = parseInt(localStorage.getItem(CLICK_COUNT_KEY) || '0');
      clicks++;
      
      if (clicks >= MAX_CLICKS) {
        // Limit reached: Start 3-minute lockdown
        localStorage.setItem(LAST_AD_KEY, Date.now().toString());
        localStorage.setItem(CLICK_COUNT_KEY, '0');
        removeAdScript();
        console.log('Ad limit (3) reached. Lockdown for 3 minutes.');
      } else {
        localStorage.setItem(CLICK_COUNT_KEY, clicks.toString());
      }
    };

    function loadAdScript() {
      if (checkCooldown()) return;
      if (document.querySelector('script[data-zone="228814"]')) return;
      
      const script = document.createElement('script');
      script.src = "https://quge5.com/88/tag.min.js";
      script.dataset.zone = "228814";
      script.async = true;
      script.dataset.cfasync = "false";
      document.head.appendChild(script);
    }

    function removeAdScript() {
      // Physically remove script tag
      const script = document.querySelector('script[data-zone="228814"]');
      if (script) script.remove();
      
      // Clean up all possible Propeller objects and dynamic tags
      const propellerGlobals = ['propeller', 'prophsh', 'pps', 'pp_ms'];
      propellerGlobals.forEach(key => {
        if ((window as any)[key]) delete (window as any)[key];
      });
      
      // Remove any dynamic scripts Propeller might have added
      document.querySelectorAll('script[src*="quge5.com"], script[src*="5gvci.com"]').forEach(s => s.remove());
    }

    // Initial check and load
    loadAdScript();
    
    // Use mousedown/touchstart for faster detection than 'click'
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [location.pathname, userPlan]);

  return null;
};

export default PropellerAdsManager;
