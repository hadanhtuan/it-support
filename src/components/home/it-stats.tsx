'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ShieldCheck, Wifi, Monitor, Lock, HelpCircle } from 'lucide-react';

const incidentTypes = [
  { label: 'Sự cố mạng', percent: 45, icon: Wifi, color: 'bg-blue-500' },
  { label: 'Sự cố hệ thống', percent: 30, icon: Monitor, color: 'bg-green-500' },
  { label: 'Bảo mật', percent: 15, icon: Lock, color: 'bg-orange-500' },
  { label: 'Khác', percent: 10, icon: HelpCircle, color: 'bg-gray-400' }
];

export function ITStats(): React.JSX.Element {
  return (
    <section className='container py-16'>
      <motion.h2
        className='text-3xl font-bold text-center mb-10'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Xử lý sự cố IT nhanh &amp; có kiểm soát
      </motion.h2>

      <div className='border rounded-xl overflow-hidden'>
        {/* Header row */}
        <div className='grid grid-cols-2 border-b bg-muted/40'>
          <div className='text-center py-3 font-semibold text-sm border-r'>Phân Loại Sự Cố</div>
          <div className='text-center py-3 font-semibold text-sm'>IT Support - Hiệu Suất Xử Lý Sự Cố</div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2'>
          {/* Left: incident classification */}
          <div className='p-6 border-r space-y-4'>
            {incidentTypes.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className='flex items-center gap-3'
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Icon className='w-5 h-5 text-muted-foreground shrink-0' />
                  <span className='text-sm w-36 shrink-0'>{item.label}</span>
                  <div className='flex-1 bg-muted rounded-full h-2 overflow-hidden'>
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                    />
                  </div>
                  <span className='text-sm font-semibold w-10 text-right'>{item.percent}%</span>
                </motion.div>
              );
            })}
          </div>

          {/* Right: performance metrics */}
          <div className='p-6 grid grid-cols-2 gap-6'>
            <motion.div
              className='flex flex-col items-center justify-center gap-1'
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className='w-8 h-8 text-green-500 mb-1' />
              <span className='text-4xl font-bold text-green-600'>94%</span>
              <span className='text-sm text-muted-foreground text-center'>Xử lý thành công</span>
            </motion.div>

            <motion.div
              className='flex flex-col items-center justify-center gap-1'
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Clock className='w-8 h-8 text-blue-500 mb-1' />
              <span className='text-4xl font-bold text-blue-600'>&lt;1 giờ</span>
              <span className='text-sm text-muted-foreground text-center'>Thời gian phản hồi</span>
            </motion.div>

            <motion.div
              className='flex flex-col items-center justify-center gap-1 col-span-2'
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ShieldCheck className='w-8 h-8 text-primary mb-1' />
              <span className='text-lg font-semibold'>SLA cam kết</span>
              <span className='text-sm text-muted-foreground text-center'>Đảm bảo thời gian xử lý theo hợp đồng</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
