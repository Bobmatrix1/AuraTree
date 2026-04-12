import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const PropellerAdsManager = () => {
  const location = useLocation();
  const [userPlan, setUserData] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserData(userDoc.data()?.subscription?.plan || 'free');
      } else {
        setUserData('free'); // Treat logged out users as free for landing page
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 1. COMPLETELY Disable for Paid Users
    if (userPlan && userPlan !== 'free') {
      const existingScript = document.querySelector('script[data-zone="228814"]');
      if (existingScript) existingScript.remove();
      return;
    }

    // 2. Disable ONLY for critical non-dashboard pages like Checkout or Admin
    const criticalPages = ['/checkout', '/admin'];
    const isCriticalPage = criticalPages.some(page => location.pathname.startsWith(page));

    if (isCriticalPage) {
      const existingScript = document.querySelector('script[data-zone="228814"]');
      if (existingScript) existingScript.remove();
      return;
    }

    // 3. 3-Minute Throttling Logic
    const LAST_AD_KEY = 'last_ad_timestamp';
    const THROTTLE_MS = 3 * 60 * 1000; // 3 minutes
    const lastAdTime = localStorage.getItem(LAST_AD_KEY);
    const now = Date.now();

    if (lastAdTime && now - parseInt(lastAdTime) < THROTTLE_MS) {
      console.log('Ad suppressed: 3-minute cooldown active');
      return;
    }

    // 4. Load the script
    const script = document.createElement('script');
    script.src = "https://quge5.com/88/tag.min.js";
    script.dataset.zone = "228814";
    script.async = true;
    script.dataset.cfasync = "false";
    
    // Record that we loaded an ad set
    localStorage.setItem(LAST_AD_KEY, now.toString());
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.remove();
      }
    };
  }, [location.pathname, userPlan]);

  return null;
};

export default PropellerAdsManager;
