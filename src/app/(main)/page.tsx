'use client';

import { HowItWorks } from '@/components/home';
import SupportCategories from '@/components/home/support-categories';
import { TicketDonutChart, TicketBarChart } from '@/components/charts';
import { firebaseAuth } from '@/lib/firebase/client/client-config';
import React, { useEffect } from 'react';

export default function Home(): React.JSX.Element {
  // Smooth scroll effect for the entire page
  useEffect(() => {
    // Add smooth scrolling to the html element
    document.documentElement.style.scrollBehavior = 'smooth';

    // Clean up
    return (): void => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className='space-y-8 pb-16'>
      <div className='container pt-8'>
        <TicketDonutChart />
      </div>
      <div className='container'>
        <TicketBarChart />
      </div>
      <SupportCategories />
      <HowItWorks />
      <div className='container py-16 text-center'>
        <h2 className='text-2xl font-bold mb-4'>Hệ thống hỗ trợ IT</h2>
        <p className='text-muted-foreground'>
          Chúng tôi cung cấp dịch vụ hỗ trợ IT toàn diện để giải quyết mọi vấn đề công nghệ của bạn.
        </p>
        {!firebaseAuth.currentUser && (
          <div className='mt-8'>
            <a
              href='/auth/register'
              className='bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
            >
              Bắt đầu ngay
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
