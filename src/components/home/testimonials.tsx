'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

export function Testimonials(): React.JSX.Element {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      content: t('testimonials.testimonial1.content'),
      author: {
        name: t('testimonials.testimonial1.author'),
        role: t('testimonials.testimonial1.role'),
        avatar: '/person/person1.webp?height=50&width=50'
      },
      rating: 5
    },
    {
      id: 2,
      content: t('testimonials.testimonial2.content'),
      author: {
        name: t('testimonials.testimonial2.author'),
        role: t('testimonials.testimonial2.role'),
        avatar: '/person/person2.webp?height=50&width=50'
      },
      rating: 5
    },
    {
      id: 3,
      content: t('testimonials.testimonial3.content'),
      author: {
        name: t('testimonials.testimonial3.author'),
        role: t('testimonials.testimonial3.role'),
        avatar: '/person/person3.webp?height=50&width=50'
      },
      rating: 4
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
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
        <h2 className='text-3xl font-bold tracking-tight'>{t('home.testimonials')}</h2>
        <p className='text-muted-foreground mt-2'>{t('home.realStoriesSuccess')}</p>
      </motion.div>

      <motion.div
        className='grid grid-cols-1 md:grid-cols-3 gap-6'
        variants={container}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true }}
      >
        {testimonials.map((testimonial) => (
          <motion.div key={testimonial.id} variants={item}>
            <Card className='h-full hover:shadow-md transition-all duration-300'>
              <CardContent className='p-6'>
                <Quote className='h-8 w-8 text-primary/20 mb-4' />
                <div className='flex mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <p className='text-muted-foreground mb-6'>&quot;{testimonial.content}&quot;</p>
                <div className='flex items-center'>
                  <Avatar className='h-10 w-10 mr-3'>
                    <AvatarImage src={testimonial.author.avatar || '/placeholder.svg'} alt={testimonial.author.name} />
                    <AvatarFallback>{testimonial.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{testimonial.author.name}</p>
                    <p className='text-sm text-muted-foreground'>{testimonial.author.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
