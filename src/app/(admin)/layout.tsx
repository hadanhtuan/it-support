import { AdminHeader, AdminSidebar } from '@/components/admin';
import React from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/utils/metadata';
import { RouteGuard } from '@/lib/permissions';
// import { AdminHeader } from '@/components/admin/admin-header';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('meta.admin.title', 'meta.admin.description');
}

export default function AdminLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <RouteGuard>
      <div className='flex h-screen bg-gray-50'>
        <AdminSidebar />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <AdminHeader />
          <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6'>{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
