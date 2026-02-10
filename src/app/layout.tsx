import type React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/context';
import './globals.css';
import { ReactQueryClientProvider } from '@/components/query-client-provider';
import { LanguageProvider } from '@/lib/i18n';
import { generateLocalizedMetadata } from '@/lib/utils/metadata';
import { WebVitals } from '@/components/web-vitals';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata();
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

  return (
    <ReactQueryClientProvider>
      <html lang='vi'>
        <head>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy='afterInteractive'
          />
          <Script id='google-analytics' strategy='afterInteractive'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </head>
        <body>
          <WebVitals />
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
