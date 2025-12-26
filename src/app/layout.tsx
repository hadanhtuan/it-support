import type React from 'react';
import { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/context';
import './globals.css';
import { ReactQueryClientProvider } from '@/components/query-client-provider';
import { LanguageProvider } from '@/lib/i18n';
import { generateLocalizedMetadata } from '@/lib/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata();
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ReactQueryClientProvider>
      <html lang='vi'>
        <body>
          <LanguageProvider>
            <ThemeProvider attribute='class' defaultTheme='light'>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </LanguageProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
