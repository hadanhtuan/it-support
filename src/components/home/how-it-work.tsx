'use client';

import { FileText, Users, Wrench, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '../ui/card';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('howItWorks.submitTicket'),
      description: t('howItWorks.submitTicketDesc'),
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: t('howItWorks.assignSupport'),
      description: t('howItWorks.assignSupportDesc'),
      icon: Users,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: t('howItWorks.getAssistance'),
      description: t('howItWorks.getAssistanceDesc'),
      icon: Wrench,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: t('howItWorks.resolveIssue'),
      description: t('howItWorks.resolveIssueDesc'),
      icon: CheckCircle,
      color: 'bg-orange-100 text-orange-600'
    }
  ];
  return (
    <section className='container py-16 overflow-hidden'>
      <motion.div
        className='text-center mb-8'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className='text-3xl font-bold tracking-tight'>{t('home.howItWorks')}</h2>
        <p className='text-muted-foreground mt-2'>{t('howItWorks.followSteps')}</p>
      </motion.div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className='border-none shadow-none h-full'>
              <CardContent className='flex flex-col items-center text-center p-6'>
                <div className='relative mb-4'>
                  <motion.div
                    className={`p-4 rounded-full ${step.color}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <step.icon className='h-6 w-6' />
                  </motion.div>
                  <div className='absolute top-1/2 left-full h-0.5 w-full bg-muted transform -translate-y-1/2 hidden md:block'>
                    {index < steps.length - 1 && <div className='h-full w-full bg-muted' />}
                  </div>
                </div>
                <h3 className='text-xl font-medium mb-2'>{step.title}</h3>
                <p className='text-sm text-muted-foreground'>{step.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
