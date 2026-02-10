'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    const sendToGoogleAnalytics = ({ name, value, id }: { name: string; value: number; id: string }) => {
      // Log metrics to console for debugging
      console.log({ name, value, id });

      const eventParams = {
        non_interaction: true,
        event_label: id,
        value: 0
      };

      // Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        switch (name) {
          case 'CLS':
            eventParams.value = Math.round(value * 1000);
            break;
          case 'INP':
            eventParams.value = Math.round(value);
            break;
          case 'LCP':
            eventParams.value = Math.round(value);
            break;
          case 'FCP':
            eventParams.value = Math.round(value);
            break;
          case 'TTFB':
            eventParams.value = Math.round(value);
            break;
        }

        (window as any).gtag('event', name, eventParams);
      }
    };

    // Monitor Core Web Vitals
    onCLS(sendToGoogleAnalytics);
    onINP(sendToGoogleAnalytics);
    onLCP(sendToGoogleAnalytics);
    onFCP(sendToGoogleAnalytics);
    onTTFB(sendToGoogleAnalytics);
  }, [pathname]);

  return null;
}
