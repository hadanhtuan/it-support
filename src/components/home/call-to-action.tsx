'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Monitor, Cpu, Wifi, HardDrive } from 'lucide-react';
import { Button } from '../ui/button';

const BRANDS = [
  { label: 'DELL', Icon: Monitor },
  { label: 'HP', Icon: Cpu },
  { label: 'SURFACE', Icon: Wifi },
  { label: 'THẾ HỆ MỚI', Icon: HardDrive }
];

export function CallToAction(): React.JSX.Element {
  return (
    <section className='py-8 px-4'>
      <div
        className='relative overflow-hidden rounded-2xl'
        style={{ background: 'linear-gradient(135deg, #050d1f 0%, #0a1f4e 40%, #0d2a6b 70%, #081535 100%)' }}
      >
        {/* Glow streaks */}
        <div className='absolute inset-0 pointer-events-none'>
          {/* Left cyan streak */}
          <div
            className='absolute left-0 top-1/2 -translate-y-1/2 w-2/5 h-px opacity-60'
            style={{ boxShadow: '0 0 60px 18px #00aaff', background: 'transparent' }}
          />
          {/* Right cyan streak */}
          <div
            className='absolute right-0 top-1/2 -translate-y-1/2 w-2/5 h-px opacity-60'
            style={{ boxShadow: '0 0 60px 18px #00aaff', background: 'transparent' }}
          />
          {/* Center glow */}
          <div
            className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-20'
            style={{ background: 'radial-gradient(ellipse, #1a88ff 0%, transparent 70%)' }}
          />
          {/* Diagonal streaks */}
          <div
            className='absolute inset-0'
            style={{
              background: `
                linear-gradient(60deg, transparent 30%, rgba(0,150,255,0.06) 50%, transparent 70%),
                linear-gradient(-60deg, transparent 30%, rgba(0,150,255,0.06) 50%, transparent 70%)
              `
            }}
          />
        </div>

        {/* Gold top border line */}
        <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70' />
        {/* Gold bottom border line */}
        <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70' />

        <div className='relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-0'>
          {/* Headline */}
          <motion.h2
            className='text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide text-white leading-tight'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Chuyên Laptop cũ nhập mỹ
          </motion.h2>

          <motion.p
            className='mt-3 text-lg md:text-xl font-semibold text-blue-100 uppercase tracking-widest'
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Dell, HP, Surface chính hãng — thiết bị IT đã kiểm định
          </motion.p>

          {/* Laptop image */}
          <motion.div
            className='relative mt-6 w-full max-w-2xl'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
              alt='Laptop doanh nghiệp chính hãng'
              width={800}
              height={450}
              className='w-full object-cover object-center'
              style={{
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
              }}
            />
          </motion.div>
        </div>

        {/* Brand badges + CTA row */}
        <motion.div
          className='relative z-10 flex flex-wrap items-center justify-center gap-4 px-6 py-6 border-t border-white/10'
          style={{ background: 'rgba(0,20,60,0.6)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {BRANDS.map(({ label, Icon }) => (
            <div
              key={label}
              className='flex flex-col items-center gap-1 px-5 py-2 rounded-lg border border-blue-500/40 bg-blue-900/30'
            >
              <Icon className='w-6 h-6 text-white' />
              <span className='text-xs font-bold text-white tracking-widest'>{label}</span>
            </div>
          ))}

          <div className='flex flex-col items-center ml-4'>
            <span className='text-xs text-blue-300 font-semibold uppercase tracking-wider'>Xem sản phẩm</span>
            <Button
              size='lg'
              className='mt-1 bg-green-500 hover:bg-green-400 text-white font-bold tracking-wide border-0'
              asChild
            >
              <Link
                href='https://taxuanky.my.canva.site/laptopcu?fbclid=IwY2xjawQszfNleHRuA2FlbQIxMABicmlkETF6QWc1dVNtMmJ1OThvZ2Jhc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHnc0FX7RS6hB3562prPxVmcqlfJRKMzbXymQ_vWFXJIMe1Xm7S7URY9pVpCJ_aem_6-pSkO1lJFWiHGOX7hCe8A'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1'
              >
                Xem ngay <ChevronRight className='w-4 h-4' />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Bottom strip */}
        <div
          className='relative z-10 text-center py-3 text-sm font-bold tracking-widest text-blue-100 uppercase border-t border-yellow-400/30'
          style={{ background: 'rgba(0,10,40,0.7)' }}
        >
          Cam kết chất lượng — Bảo hành chu đáo
        </div>
      </div>
    </section>
  );
}
