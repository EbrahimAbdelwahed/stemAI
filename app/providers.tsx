'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { GameOfLifeProvider } from '@/contexts/GameOfLifeContext';
import { getClientAnalyticsConfig, shouldEnableAnalytics } from '@/lib/analytics/vercel-config';
import { initWebVitals } from '@/lib/monitoring/web-vitals';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals();
  }, []);

  return (
    <SessionProvider>
      <GameOfLifeProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </GameOfLifeProvider>
    </SessionProvider>
  );
} 