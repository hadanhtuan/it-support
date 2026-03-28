'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function Footer(): React.JSX.Element | null {
  const pathname = usePathname();

  if (pathname === '/messages') {
    return null;
  }

  return (
    <footer className='border-t border-[#2b40b3]' style={{ background: '#3d52c4' }}>
      <div className='container py-8 md:py-10'>
        <div className='flex flex-col items-center text-center gap-2'>
          <span className='font-bold text-base text-white'>IT Support Chuyên Nghiệp</span>
          <p className='text-sm text-blue-100'>
            <span className='font-medium'>Hotline:</span> 0975115994
          </p>
          <p className='text-sm text-blue-100'>
            <span className='font-medium'>Email:</span> taxuanky.ht@gmail.com
          </p>
          <p className='text-sm text-blue-100'>
            <span className='font-medium'>Khu vực hoạt động:</span> Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
