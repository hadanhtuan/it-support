'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function Footer(): React.JSX.Element | null {
  const pathname = usePathname();

  if (pathname === '/messages') {
    return null;
  }

  return (
    <footer className='border-t bg-background'>
      <div className='container py-8 md:py-10'>
        <div className='flex flex-col items-center text-center gap-2'>
          <span className='font-bold text-base'>IT Support Chuyên Nghiệp</span>
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium'>Hotline:</span> 0123 456 789
          </p>
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium'>Email:</span> info@itsupport.com
          </p>
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium'>Khu vực hoạt động:</span> TP.HCM &amp; Lân Cận
          </p>
        </div>
      </div>
    </footer>
  );
}
