'use client';

import React from 'react';

export function ZaloContactButton(): React.JSX.Element {
  const zaloPhoneNumber = '0975114994';

  const handleZaloClick = (): void => {
    // Open Zalo chat - you can customize this URL with your Zalo OA or phone number
    window.open(`https://zalo.me/${zaloPhoneNumber}`, '_blank');
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <button
        onClick={handleZaloClick}
        className='group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg transition-all hover:scale-110 hover:shadow-xl'
        aria-label='Contact via Zalo'
      >
        {/* Zalo Icon SVG */}
        <svg
          className='h-8 w-8 text-white'
          viewBox='0 0 48 48'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M24 4C12.95 4 4 12.95 4 24C4 29.37 6.29 34.22 10 37.66V44L16.34 40.85C18.73 41.89 21.32 42.5 24 42.5C35.05 42.5 44 33.55 44 24C44 12.95 35.05 4 24 4Z'
            fill='currentColor'
          />
          <path
            d='M32.5 27.5H15.5V25H32.5V27.5ZM32.5 23H15.5V20.5H32.5V23ZM32.5 18.5H15.5V16H32.5V18.5Z'
            fill='#0068FF'
          />
        </svg>

        {/* Tooltip */}
        <div className='absolute right-full mr-3 hidden whitespace-nowrap rounded bg-gray-900 px-3 py-2 text-sm text-white shadow-lg group-hover:block'>
          Liên hệ qua Zalo
          <div className='absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-gray-900'></div>
        </div>

        {/* Pulse animation */}
        <span className='absolute inset-0 -z-10 animate-ping rounded-full bg-blue-400 opacity-75'></span>
      </button>
    </div>
  );
}
