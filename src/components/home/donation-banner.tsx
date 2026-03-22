'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export function DonationBanner(): React.JSX.Element {
  return (
    <section className='container py-10'>
      <motion.div
        className='flex flex-col sm:flex-row items-center gap-8 rounded-2xl border bg-background px-8 py-8 shadow-sm'
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* QR code */}
        <div className='flex-shrink-0'>
          <Image
            src='/qr-donation.jpg'
            alt='QR Ủng hộ dự án IT Support'
            width={260}
            height={260}
            className='rounded-xl border shadow-sm'
          />
        </div>

        {/* Text */}
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <Heart className='w-5 h-5 text-red-500 fill-red-500' />
            <h3 className='text-lg font-bold'>Ủng hộ dự án IT Support</h3>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed max-w-sm'>
            Nếu dự án hữu ích với bạn, hãy ủng hộ chúng tôi để tiếp tục phát triển và duy trì dịch vụ tốt hơn.
            Quét mã QR để chuyển khoản qua <span className='font-semibold text-foreground'>MoMo / VietQR / Napas 247</span>.
          </p>
          <p className='mt-3 text-xs text-muted-foreground'>Cảm ơn sự hỗ trợ của bạn 💙</p>
        </div>
      </motion.div>
    </section>
  );
}
