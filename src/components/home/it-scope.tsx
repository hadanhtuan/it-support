'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Monitor, Wifi, HelpCircle } from 'lucide-react';

const scopes = [
  { label: 'Phần cứng', icon: HardDrive, bg: 'bg-slate-100', text: 'text-slate-600' },
  { label: 'Phần mềm', icon: Monitor, bg: 'bg-blue-100', text: 'text-blue-600' },
  { label: 'Mạng', icon: Wifi, bg: 'bg-green-100', text: 'text-green-600' },
  { label: 'Khác', icon: HelpCircle, bg: 'bg-gray-100', text: 'text-gray-600' }
];

export function ITScope(): React.JSX.Element {
  return (
    <section className='container py-16'>
      <motion.h2
        className='text-3xl font-bold text-center mb-10'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Phạm Vi Hỗ Trợ IT
      </motion.h2>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {scopes.map((scope, i) => {
          const Icon = scope.icon;
          return (
            <motion.div
              key={scope.label}
              className='flex flex-col items-center justify-center gap-4 border rounded-xl p-8 hover:shadow-md transition-shadow cursor-default'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`p-4 rounded-xl ${scope.bg}`}>
                <Icon className={`w-10 h-10 ${scope.text}`} />
              </div>
              <span className='font-semibold text-base'>{scope.label}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
