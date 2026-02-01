import type React from 'react';
import { Metadata } from 'next';
import { Footer } from '@/components/home';
import HeaderComponent from '@/components/home/header';
import { Toaster } from '@/components/ui/toaster';
import { RouteGuard } from '@/lib/permissions';
import { ZaloContactButton } from '@/components/ui/zalo-contact-button';
import '../globals.css';
import { generateLocalizedMetadata } from '@/lib/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata();
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <RouteGuard>
      <HeaderComponent />
      <main className='min-h-screen'>{children}</main>
      <Footer />
      <Toaster />
      <ZaloContactButton />
    </RouteGuard>
  );
}
