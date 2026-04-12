import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface PropellerAdProps {
  zoneId: string;
  format: 'banner' | 'interstitial' | 'native';
  className?: string;
}

const PropellerAd = ({ zoneId, format, className }: PropellerAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isPlanLoaded, setIsPlanLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setUserPlan(userDoc.data()?.subscription?.plan || 'free');
        } catch (e) { setUserPlan('free'); }
      } else { setUserPlan('free'); }
      setIsPlanLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!zoneId || !isPlanLoaded) return;

    // 1. Absolute block for Paid Users
    if (userPlan && userPlan !== 'free') return;

    // 2. Strict 3-Minute Cooldown Check
    const LAST_AD_KEY = 'strict_ad_lockdown_ts';
    const THROTTLE_MS = 3 * 60 * 1000;
    const lastAd = localStorage.getItem(LAST_AD_KEY);
    const now = Date.now();

    if (lastAd && (now - parseInt(lastAd)) < THROTTLE_MS) {
      console.log('Banner ad suppressed: cooldown active');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';

    if (format === 'banner') {
      script.src = `//pl254321.top/${zoneId}/invoke.js`;
      if (adRef.current) {
        adRef.current.appendChild(script);
      }
    } else if (format === 'interstitial') {
      script.src = `//pl254321.top/${zoneId}/invoke.js`;
      document.body.appendChild(script);
    }

    return () => {
      if (format === 'banner' && adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [zoneId, format, userPlan, isPlanLoaded]);

  // Hide the container entirely if user is paid or in cooldown
  const lastAd = localStorage.getItem('strict_ad_lockdown_ts');
  const now = Date.now();
  const inCooldown = lastAd && (now - parseInt(lastAd)) < (3 * 60 * 1000);
  
  if (!isPlanLoaded || (userPlan && userPlan !== 'free') || inCooldown) {
    return null;
  }

  if (format === 'banner') {
    return <div ref={adRef} className={`ad-container ${className}`} id={`container-${zoneId}`} />;
  }

  return null;
};

export default PropellerAd;
