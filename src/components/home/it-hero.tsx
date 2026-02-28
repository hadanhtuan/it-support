'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Shield, Monitor, Wifi, Server, HardDrive } from 'lucide-react';

export function ITHero(): React.JSX.Element {
  return (
    <section className='bg-background py-16'>
      <div className='container'>
        <div className='flex flex-col lg:flex-row items-center gap-12'>
          {/* Left content */}
          <div className='w-full lg:w-1/2'>
            <motion.h1
              className='text-4xl font-bold tracking-tight sm:text-5xl'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Dịch vụ IT Support
              <br />
              <span className='text-muted-foreground font-semibold text-3xl sm:text-4xl'>
                cho doanh nghiệp vừa &amp; nhỏ
              </span>
            </motion.h1>

            <motion.p
              className='text-muted-foreground mt-4 text-base'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Cung cấp giải pháp IT chuyên nghiệp cho doanh nghiệp vừa &amp; nhỏ
            </motion.p>

            <motion.div
              className='mt-8 flex flex-wrap gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button size='lg' asChild>
                <Link href='/user/create-ticket'>Liên hệ ngay</Link>
              </Button>
              <Button size='lg' variant='outline' asChild>
                <Link href='#services'>Xem dịch vụ</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right illustration */}
          <motion.div
            className='w-full lg:w-1/2 flex justify-center'
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className='relative w-72 h-72 sm:w-96 sm:h-96'>
              {/* Central shield */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center'>
                  <Shield className='w-20 h-20 text-primary' />
                </div>
              </div>
              {/* Orbiting icons */}
              <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-blue-100 rounded-xl p-3 shadow-md'>
                <Monitor className='w-7 h-7 text-blue-600' />
              </div>
              <div className='absolute top-1/2 right-4 -translate-y-1/2 bg-green-100 rounded-xl p-3 shadow-md'>
                <Wifi className='w-7 h-7 text-green-600' />
              </div>
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-100 rounded-xl p-3 shadow-md'>
                <Server className='w-7 h-7 text-purple-600' />
              </div>
              <div className='absolute top-1/2 left-4 -translate-y-1/2 bg-orange-100 rounded-xl p-3 shadow-md'>
                <HardDrive className='w-7 h-7 text-orange-600' />
              </div>
              {/* Decorative ring */}
              <div className='absolute inset-8 rounded-full border-2 border-dashed border-primary/20' />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
