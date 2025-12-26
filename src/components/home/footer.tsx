'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Facebook, Instagram, Twitter } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export function Footer(): React.JSX.Element | null {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Hide footer on messages page
  if (pathname === '/messages') {
    return null;
  }

  return (
    <footer className='border-t bg-background'>
      <div className='container py-8 md:py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-6 w-6 text-primary' />
              <span className='font-bold text-xl'>{t('footer.groupTutor')}</span>
            </div>
            <p className='text-sm text-muted-foreground'>{t('footer.connectingStudents')}</p>
            <div className='flex gap-4'>
              <Link href='#' className='text-muted-foreground hover:text-primary'>
                <Facebook className='h-5 w-5' />
                <span className='sr-only'>Facebook</span>
              </Link>
              <Link href='#' className='text-muted-foreground hover:text-primary'>
                <Twitter className='h-5 w-5' />
                <span className='sr-only'>Twitter</span>
              </Link>
              <Link href='#' className='text-muted-foreground hover:text-primary'>
                <Instagram className='h-5 w-5' />
                <span className='sr-only'>Instagram</span>
              </Link>
            </div>
          </div>
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>{t('footer.forStudents')}</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/filter/class' className='text-muted-foreground hover:text-primary'>
                  {t('footer.findClasses')}
                </Link>
              </li>
              <li>
                <Link href='/how-it-works' className='text-muted-foreground hover:text-primary'>
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href='/reviews' className='text-muted-foreground hover:text-primary'>
                  {t('footer.studentReviews')}
                </Link>
              </li>
              <li>
                <Link href='/faq' className='text-muted-foreground hover:text-primary'>
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>{t('footer.forTeachers')}</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/become-teacher' className='text-muted-foreground hover:text-primary'>
                  {t('footer.becomeTeacher')}
                </Link>
              </li>
              <li>
                <Link href='/teacher-resources' className='text-muted-foreground hover:text-primary'>
                  {t('footer.teacherResources')}
                </Link>
              </li>
              <li>
                <Link href='/teacher-faq' className='text-muted-foreground hover:text-primary'>
                  {t('footer.teacherFaq')}
                </Link>
              </li>
              <li>
                <Link href='/success-stories' className='text-muted-foreground hover:text-primary'>
                  {t('footer.successStories')}
                </Link>
              </li>
            </ul>
          </div>
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>{t('footer.company')}</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/about' className='text-muted-foreground hover:text-primary'>
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href='/careers' className='text-muted-foreground hover:text-primary'>
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link href='/privacy' className='text-muted-foreground hover:text-primary'>
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href='/terms' className='text-muted-foreground hover:text-primary'>
                  {t('footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-8 border-t pt-8 text-center text-sm text-muted-foreground'>
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
