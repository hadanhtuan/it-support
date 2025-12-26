'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { BarChart3, HeadphonesIcon, Users, Ticket, Settings, Shield, AlertTriangle, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export function AdminSidebar(): React.JSX.Element {
  const pathname = usePathname();
  const { t } = useTranslation();

  const sidebarItems = [
    {
      title: t('admin.navigation.dashboard'),
      href: '/admin',
      icon: BarChart3
    },
    {
      title: t('admin.navigation.users'),
      href: '/admin/manage-users',
      icon: Users
    },
    {
      title: t('admin.navigation.itSupport'),
      href: '/admin/manage-it-support',
      icon: HeadphonesIcon
    },
    {
      title: t('admin.navigation.tickets'),
      href: '/admin/manage-tickets',
      icon: Ticket
    },
    {
      title: t('admin.navigation.urgentIssues'),
      href: '/admin/urgent-issues',
      icon: AlertTriangle
    },
    {
      title: t('admin.navigation.configuration'),
      href: '/admin/configuration',
      icon: Settings
    }
  ];

  return (
    <div className='w-64 bg-white shadow-lg'>
      <div className='p-6 border-b'>
        <div className='flex items-center space-x-2'>
          <Shield className='h-8 w-8 text-blue-600' />
          <div>
            <h1 className='text-xl font-bold text-gray-900'>{t('admin.panel')}</h1>
            <p className='text-sm text-gray-500'>IT Support</p>
          </div>
        </div>
      </div>

      <nav className='mt-6'>
        <div className='px-3'>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors',
                  isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className='mr-3 h-5 w-5' />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
