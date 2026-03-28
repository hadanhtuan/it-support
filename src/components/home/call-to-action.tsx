'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function CallToAction(): React.JSX.Element {
  return (
    <section className='py-8 px-4'>
      <motion.div
        className='rounded-2xl overflow-hidden'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href='https://taxuanky.my.canva.site/laptopcu?fbclid=IwY2xjawQszfNleHRuA2FlbQIxMABicmlkETF6QWc1dVNtMmJ1OThvZ2Jhc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHnc0FX7RS6hB3562prPxVmcqlfJRKMzbXymQ_vWFXJIMe1Xm7S7URY9pVpCJ_aem_6-pSkO1lJFWiHGOX7hCe8A'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            src='/advertise.png'
            alt='Laptop doanh nghiệp đã qua sử dụng'
            width={1200}
            height={400}
            className='w-full object-cover'
            priority
          />
        </Link>
      </motion.div>
    </section>
  );
}
