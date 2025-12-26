'use client';

import { motion } from 'framer-motion';
import { Code, Languages, Palette, Search, GraduationCap, Target, Users, Dumbbell, Baby } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '../ui/card';

export function PopularSubjects(): React.JSX.Element {
  const { t } = useTranslation();

  const shortcuts = [
    // {
    //   name: t('categories.findGroupPartners'),
    //   icon: Users,
    //   color: 'bg-green-100 text-green-600',
    //   href: '/filter/class?type=TICKET'
    // },
    {
      name: t('categories.filterTutor'),
      icon: Search,
      color: 'bg-blue-100 text-blue-600',
      href: '/filter/tutor'
    },
    {
      name: t('categories.generalEducation'),
      icon: GraduationCap,
      color: 'bg-red-100 text-red-600',
      href: '/filter/class?type=Class&majorCode=MAJ_01_07_25_200902'
    },
    {
      name: t('categories.testPreparation'),
      icon: Target,
      color: 'bg-green-100 text-green-600',
      href: '/filter/class?type=Class&majorCode=MAJ_01_07_25_873403'
    },
    {
      name: t('categories.foreignLanguage'),
      icon: Languages,
      color: 'bg-yellow-100 text-yellow-600',
      href: '/filter/class?type=Class&majorCode=MAJ_01_07_25_381700'
    },
    {
      name: t('categories.softSkillsIT'),
      icon: Code,
      color: 'bg-purple-100 text-purple-600',
      href: '/filter/class?type=Class&majorCode=MAJ_01_07_25_990323'
    },
    {
      name: t('categories.sports'),
      icon: Dumbbell,
      color: 'bg-orange-100 text-orange-600',
      href: '/filter/class?type=Class&majorCode=MAJ_08_07_25_667646'
    },
    {
      name: t('categories.parentsEducation'),
      icon: Users,
      color: 'bg-pink-100 text-pink-600',
      href: '/filter/class?type=Class&majorCode=MAJ_08_07_25_384808'
    },
    {
      name: t('categories.kindergarten'),
      icon: Baby,
      color: 'bg-indigo-100 text-indigo-600',
      href: '/filter/class?type=Class&majorCode=MAJ_08_07_25_704806'
    },
    {
      name: t('categories.musicArt'),
      icon: Palette,
      color: 'bg-teal-100 text-teal-600',
      href: '/filter/class?type=Class&majorCode=MAJ_08_07_25_757267'
    }
  ];
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className='container py-16'>
      <motion.div
        className='text-center mb-8'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className='text-3xl font-bold tracking-tight'>{t('home.popularSubjects')}</h2>
        <p className='text-muted-foreground mt-2'>{t('subjects.browseBySubject')}</p>
      </motion.div>

      <motion.div
        className='grid grid-cols-2 md:grid-cols-4 gap-4'
        variants={container}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true }}
      >
        {shortcuts.map((subject) => (
          <motion.div key={subject.name} variants={item}>
            <Link href={subject.href}>
              <Card className='h-full transition-all hover:shadow-md hover:scale-105 duration-300'>
                <CardContent className='flex flex-col items-center justify-center p-6'>
                  <div className={`p-3 rounded-full ${subject.color} mb-4`}>
                    <subject.icon className='h-6 w-6' />
                  </div>
                  <h3 className='font-medium text-center'>{subject.name}</h3>
                  {/* <p className='text-sm text-muted-foreground mt-1'>{subject.count} classes</p> */}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
