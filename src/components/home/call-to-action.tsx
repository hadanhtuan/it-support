'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export function CallToAction(): React.JSX.Element {
  return (
    <section className='container py-16'>
      <motion.div
        className='bg-primary/5 rounded-lg p-8 md:p-12 text-center'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <motion.h2
          className='text-3xl font-bold tracking-tight mb-4'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Cần IT Support cho doanh nghiệp của bạn?
        </motion.h2>

        <motion.div
          className='flex justify-center'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button size='lg' asChild className='transition-transform duration-300 hover:scale-105'>
            <Link href='/user/create-ticket'>Liên hệ ngay</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
