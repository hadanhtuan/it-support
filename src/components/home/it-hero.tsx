'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';

export function ITHero(): React.JSX.Element {
  return (
    <section
      className='py-16'
      style={{
        backgroundImage: 'url(/background/background1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className='container'>
        <div className='flex flex-col lg:flex-row items-center gap-12'>
          {/* Left content */}
          <div className='w-full lg:w-1/2 text-white'>
            <motion.h1
              className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Hỗ trợ IT &amp; Quản trị hệ thống cho cá nhân và doanh nghiệp
            </motion.h1>

            <motion.p
              className='mt-4 text-blue-50 text-base max-w-md'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Giải quyết sự cố máy tính, mạng và hệ thống IT nhanh chóng và chuyên nghiệp.
            </motion.p>

            <motion.div
              className='mt-8 flex flex-wrap gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button size='lg' className='bg-white text-blue-600 hover:bg-blue-50 font-semibold' asChild>
                <Link href='/user/create-ticket'>Tạo Ticket Hỗ Trợ</Link>
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='bg-transparent border-white text-white hover:bg-white/10 hover:text-white'
                asChild
              >
                <Link href='#services' className='flex items-center gap-1'>
                  Xem Dịch Vụ <ChevronDown className='w-4 h-4' />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: IT support image */}
          <motion.div
            className='w-full lg:w-1/2 flex justify-center'
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className='relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl'>
              <Image
                src='https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80'
                alt='IT Support chuyên nghiệp'
                fill
                className='object-cover'
                priority
              />
              {/* Blend edges into section background */}
              <div
                className='absolute inset-0 pointer-events-none rounded-2xl'
                style={{ background: 'linear-gradient(to right, rgba(30,50,160,0.7) 0%, transparent 50%)' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
