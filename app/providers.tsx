'use client';

import { useEffect } from 'react';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { GameOfLifeProvider } from '@/contexts/GameOfLifeContext';
import { initWebVitals } from '@/lib/monitoring/web-vitals';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals monitoring (client-side only)
    if (typeof window !== 'undefined') {
      initWebVitals();
    }
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