'use client';

import { UserDataTable } from '@/components/admin/user-data-table';
import { useTranslation } from '@/lib/i18n';
import React from 'react';

export default function ManageUsersPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className='space-y-1'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{t('admin.manageUsers')}</h1>
        <p className='text-muted-foreground mt-2'>{t('admin.manageUsersDescription')}</p>
      </div>
      <UserDataTable />
    </div>
  );
}
