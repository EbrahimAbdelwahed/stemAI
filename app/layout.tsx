import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { GameOfLifeProvider } from '@/contexts/GameOfLifeContext';
import { getClientAnalyticsConfig, shouldEnableAnalytics, logAnalyticsConfig } from '@/lib/analytics/vercel-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'STEM AI Assistant',
  description: 'AI assistant for STEM topics with RAG capabilities',
};

// Log analytics configuration in development
if (typeof window === 'undefined') {
  logAnalyticsConfig();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <SessionProvider>
          <GameOfLifeProvider>
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
          </GameOfLifeProvider>
        </SessionProvider>
        {shouldEnableAnalytics() && <Analytics {...getClientAnalyticsConfig()} />}
        <SpeedInsights />
      </body>
    </html>
  );
} 