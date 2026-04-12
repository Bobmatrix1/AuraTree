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

    // 3. Strict 3-Minute Throttling Logic
    const LAST_AD_KEY = 'last_ad_timestamp';
    const THROTTLE_MS = 3 * 60 * 1000; // 3 minutes
    const lastAdTime = localStorage.getItem(LAST_AD_KEY);
    const now = Date.now();

    // If we are within the 3-minute window of the LAST time we allowed the script to load
    if (lastAdTime && now - parseInt(lastAdTime) < THROTTLE_MS) {
      console.log('Ads suppressed: cooldown active');
      // Ensure any existing script is removed to be absolutely sure
      const existingScript = document.querySelector('script[data-zone="228814"]');
      if (existingScript) existingScript.remove();
      return;
    }

    // 4. Load the script only if cooldown has passed
    const script = document.createElement('script');
    script.src = "https://quge5.com/88/tag.min.js";
    script.dataset.zone = "228814";
    script.async = true;
    script.dataset.cfasync = "false";
    
    // Update the timestamp immediately so no other component/page loads it for 3 mins
    localStorage.setItem(LAST_AD_KEY, Date.now().toString());
    
    document.head.appendChild(script);

    return () => {
      // We do NOT remove the script on cleanup here because Propeller 
      // often needs the script to stay to handle the "OnClick" events.
      // The useEffect dependency [location.pathname] will handle the re-check.
    };
  }, [location.pathname, userPlan]);

  return null;
};

export default PropellerAdsManager;
