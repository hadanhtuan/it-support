'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { UsersIcon, HeadphonesIcon, TicketIcon, AlertTriangleIcon, TrendingUpIcon } from 'lucide-react';
import React from 'react';

export default function AdminDashboard(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>{t('admin.dashboard')}</h1>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>{t('admin.totalUsers')}</CardTitle>
            <UsersIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,248</div>
            <p className='text-xs text-muted-foreground'>+12% {t('admin.fromLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>{t('admin.itSupportStaff')}</CardTitle>
            <HeadphonesIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-xs text-muted-foreground'>+2 {t('admin.fromLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>{t('admin.openTickets')}</CardTitle>
            <TicketIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>156</div>
            <p className='text-xs text-muted-foreground'>-8% {t('admin.fromLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>{t('admin.urgentIssues')}</CardTitle>
            <AlertTriangleIcon className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>8</div>
            <p className='text-xs text-muted-foreground'>+3 {t('admin.fromLastWeek')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional IT Support Dashboard Content */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentTickets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>{t('admin.recentTicketsDescription')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.systemPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>{t('admin.systemPerformanceDescription')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
