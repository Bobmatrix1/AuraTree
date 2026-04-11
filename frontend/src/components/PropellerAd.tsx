import { useEffect, useRef } from 'react';

interface PropellerAdProps {
  zoneId: string;
  format: 'banner' | 'interstitial' | 'native';
  className?: string;
}

const PropellerAd = ({ zoneId, format, className }: PropellerAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId) return;

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';

    if (format === 'banner') {
      script.src = `//pl254321.top/${zoneId}/invoke.js`;
      if (adRef.current) {
        adRef.current.appendChild(script);
      }
    } else if (format === 'interstitial') {
      // Interstitials usually go in the head or at the end of body
      script.src = `//pl254321.top/${zoneId}/invoke.js`;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup if needed
      if (format === 'banner' && adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [zoneId, format]);

  if (format === 'banner') {
    return <div ref={adRef} className={`ad-container ${className}`} id={`container-${zoneId}`} />;
  }

  return null;
};

export default PropellerAd;
