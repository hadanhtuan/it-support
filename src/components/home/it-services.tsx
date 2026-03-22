'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HardDrive, Monitor, Camera, Home, Zap, Cpu, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';

const personalServices = [
  {
    icon: HardDrive,
    title: 'Dịch vụ phần cứng',
    description: 'Sửa chữa máy tính, nâng cấp linh kiện phần cứng.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Monitor,
    title: 'Dịch vụ phần mềm',
    description: 'Cài đặt hệ điều hành, phần mềm và diệt virus.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Camera,
    title: 'Lắp đặt camera',
    description: 'Tư vấn và lắp đặt hệ thống camera giám sát.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Home,
    title: 'Giải pháp Smart Home',
    description: 'Tự động hóa ngôi nhà thông minh theo yêu cầu.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Zap,
    title: 'Giải pháp năng lượng',
    description: 'Tư vấn và lắp đặt hệ thống điện năng lượng mặt trời.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Cpu,
    title: 'Thiết bị smarter home',
    description: 'Cung cấp và lắp đặt thiết bị nhà thông minh.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: MoreHorizontal,
    title: 'Dịch vụ khác',
    description: 'Các dịch vụ IT khác theo yêu cầu của bạn.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  }
];

export function ITServices(): React.JSX.Element {
  return (
    <section id='services' className='container py-12'>
      <motion.h2
        className='text-2xl font-bold text-center mb-8'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Dịch Vụ IT Cho Cá Nhân
      </motion.h2>

      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4'>
        {personalServices.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.title}
              className='border rounded-xl p-4 flex flex-col gap-3 bg-background hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <div className='flex items-start gap-3'>
                <div className={`p-2.5 rounded-lg ${service.bg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${service.text}`} />
                </div>
                <div>
                  <h3 className='font-semibold text-sm'>{service.title}</h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>{service.description}</p>
                </div>
              </div>
              <Button size='sm' className='w-full text-xs' asChild>
                <Link href='/user/create-ticket'>Yêu cầu hỗ trợ</Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
