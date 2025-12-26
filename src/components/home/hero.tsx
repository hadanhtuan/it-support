'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '../ui/button';
import { firebaseAuth } from '@/lib/firebase/client/client-config';

interface HeroProps {
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
}

export function Hero({
  primaryButtonHref = '/filter/class',
  secondaryButtonHref = '/become-teacher'
}: HeroProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className='bg-background py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex  items-center gap-8'>
          <div className='w-full lg:w-1/2 mb-8 lg:mb-0'>
            <motion.h1
              className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary pb-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              className='text-xl text-muted-foreground mt-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {!firebaseAuth.currentUser && (
              <motion.div
                className='mt-8 flex flex-wrap gap-4'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href={primaryButtonHref}>
                  <Button
                    variant='default'
                    size='lg'
                    className={cn(
                      'bg-gradient-to-r from-primary to-secondary text-white',
                      'shadow-lg hover:from-primary/90 hover:to-secondary/90',
                      'transition-all duration-300',
                      'px-8 py-3 rounded-full font-semibold'
                    )}
                  >
                    {t('header.classes')}
                  </Button>
                </Link>
                <Link href={secondaryButtonHref}>
                  <Button
                    variant='outline'
                    size='lg'
                    className={cn(
                      'text-primary border-primary hover:bg-primary/10',
                      'transition-colors duration-200',
                      'px-8 py-3 rounded-full font-semibold'
                    )}
                  >
                    {t('header.teachers')}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
          <div className='w-full lg:w-1/2'>
            <div className='relative'>
              <Image
                src='/hero.svg'
                alt={t('hero.title')}
                width={600}
                height={500}
                className='w-full rounded-lg shadow-2xl'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
