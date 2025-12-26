'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Button } from '../ui/button';

export function CallToAction(): React.JSX.Element {
  const { t } = useTranslation();

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
          {t('callToAction.title')}
        </motion.h2>

        <motion.p
          className='text-muted-foreground max-w-2xl mx-auto mb-8'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {t('callToAction.description')}
        </motion.p>

        <motion.div
          className='flex flex-col sm:flex-row justify-center gap-4'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button size='lg' asChild className='transition-transform duration-300 hover:scale-105'>
            <Link href='/auth/register'>{t('callToAction.signUpStudent')}</Link>
          </Button>
          <Button size='lg' variant='outline' asChild className='transition-transform duration-300 hover:scale-105'>
            <Link href='/auth/register'>{t('callToAction.becomeTeacher')}</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
