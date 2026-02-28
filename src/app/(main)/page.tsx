'use client';

import React, { useEffect } from 'react';
import { ITHero } from '@/components/home/it-hero';
import { ITStats } from '@/components/home/it-stats';
import { ITScope } from '@/components/home/it-scope';
import { ITServices } from '@/components/home/it-services';
import { CallToAction } from '@/components/home';

export default function Home(): React.JSX.Element {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return (): void => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className='pb-16'>
      <ITHero />
      <ITStats />
      <ITScope />
      <ITServices />
      <CallToAction />
    </div>
  );
}
