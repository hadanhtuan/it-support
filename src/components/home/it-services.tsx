'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, Network, Database, Wifi } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    icon: Headphones,
    title: 'IT Support Tổng Thể',
    description: 'Hỗ thợ & quản lý toàn bộ hệ thống IT',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Network,
    title: 'Quản Trị Mạng & Firewall',
    description: 'Quản lý hệ thống mạng, bảo mật',
    bg: 'bg-green-100',
    text: 'text-green-600'
  },
  {
    icon: Database,
    title: 'Backup & Server / NAS',
    description: 'Giải pháp backup, quản trị server',
    bg: 'bg-purple-100',
    text: 'text-purple-600'
  },
  {
    icon: Wifi,
    title: 'WiFi & Camera Doanh Nghiệp',
    description: 'Lắp đặt camera, quản lý hệ thống WiFi',
    bg: 'bg-orange-100',
    text: 'text-orange-600'
  }
];

export function ITServices(): React.JSX.Element {
  return (
    <section id='services' className='container py-16'>
      <motion.h2
        className='text-3xl font-bold text-center mb-10'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Dịch Vụ IT Doanh Nghiệp
      </motion.h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {services.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className='h-full hover:shadow-lg transition-shadow'>
                <CardContent className='flex flex-col items-center text-center gap-4 p-6'>
                  <div className={`p-4 rounded-xl ${service.bg}`}>
                    <Icon className={`w-10 h-10 ${service.text}`} />
                  </div>
                  <h3 className='font-semibold text-base'>{service.title}</h3>
                  <p className='text-sm text-muted-foreground'>{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
