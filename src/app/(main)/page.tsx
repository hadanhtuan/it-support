'use client';

import React, { useEffect } from 'react';
import { ITHero } from '@/components/home/it-hero';
import { ITStats } from '@/components/home/it-stats';
import { ITScope } from '@/components/home/it-scope';
import { ITServices } from '@/components/home/it-services';
import { CallToAction } from '@/components/home';
import { DonationBanner } from '@/components/home/donation-banner';

export default function Home(): React.JSX.Element {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return (): void => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className='pb-16' style={{ background: 'linear-gradient(180deg, #e8eeff 0%, #f5f7ff 60%, #ffffff 100%)' }}>
      <ITHero />
      <ITStats />
      <ITScope />
      <CallToAction />
      <ITServices />
      <DonationBanner />
    </div>
  );
}
