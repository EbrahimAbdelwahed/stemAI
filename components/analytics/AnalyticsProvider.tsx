'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import { initWebVitals } from '@/lib/analytics/web-vitals';
import { ChatFlowTracker } from '@/lib/analytics/event-tracking';

interface AnalyticsContextType {
  trackPageView: (page: string) => void;
  trackChatSession: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initWebVitals();
    
    // Track initial page load
    if (typeof window !== 'undefined') {
      ChatFlowTracker.sessionStarted(window.location.pathname);
    }
  }, []);

  const trackPageView = (page: string) => {
    ChatFlowTracker.sessionStarted(page);
  };

  const trackChatSession = () => {
    if (typeof window !== 'undefined') {
      ChatFlowTracker.sessionStarted(window.location.pathname);
    }
  };

  const value: AnalyticsContextType = {
    trackPageView,
    trackChatSession
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
} 