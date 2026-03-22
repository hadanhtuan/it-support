'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTicketStats } from '@/hooks/use-ticket-stats';

export function ITStats(): React.JSX.Element {
  const { data, isLoading } = useTicketStats();

  const stats = [
    { label: 'Tổng Ticket', value: data?.total ?? '—', dot: null, color: 'text-gray-800' },
    { label: 'Đang Xử Lý', value: data?.inProgress ?? '—', dot: 'bg-blue-500', color: 'text-gray-800' },
    { label: 'Hoàn Thành', value: data?.resolved ?? '—', dot: null, color: 'text-green-500' },
    { label: 'Chờ Phản Hồi', value: data?.waitingForCustomer ?? '—', dot: null, color: 'text-gray-800' }
  ];

  return (
    <section className='container py-8'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className='border rounded-xl p-6 text-center bg-background shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className={`text-4xl font-bold ${stat.color} flex items-center justify-center gap-2`}>
              {stat.dot && <span className={`w-3 h-3 rounded-full ${stat.dot} inline-block`} />}
              {isLoading ? (
                <span className='inline-block w-12 h-8 bg-muted animate-pulse rounded' />
              ) : (
                stat.value
              )}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
