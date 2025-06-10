'use client';

import { useEffect } from 'react';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { GameOfLifeProvider } from '@/contexts/GameOfLifeContext';
import { initWebVitals } from '@/lib/monitoring/web-vitals';
import { ThemeManager } from '@/components/providers/ThemeManager';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals monitoring (client-side only)
    if (typeof window !== 'undefined') {
      initWebVitals();
    }
  }, []);

  return (
    <ThemeManager>
      <SessionProvider>
        <GameOfLifeProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </GameOfLifeProvider>
      </SessionProvider>
    </ThemeManager>
  );
} 