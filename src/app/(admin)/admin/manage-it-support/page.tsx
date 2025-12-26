'use client';

import { ITSupportDataTable } from '@/components/admin/it-support-data-table';
import { useTranslation } from '@/lib/i18n';
import React from 'react';

export default function ManageITSupportPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className='space-y-1'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{t('admin.manageITSupport')}</h1>
        <p className='text-muted-foreground mt-2'>{t('admin.manageITSupportDescription')}</p>
      </div>
      <ITSupportDataTable />
    </div>
  );
}
