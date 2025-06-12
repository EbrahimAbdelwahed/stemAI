import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';
import { trackEvent } from './event-tracking';

// Send metric to Vercel Analytics
function sendToAnalytics(metric: Metric) {
  const value = metric.value;
  const timestamp = Date.now();
  
  // Determine rating based on standard thresholds
  let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
  
  switch (metric.name) {
    case 'CLS':
      rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      trackEvent('web_vital_cls', { value, rating, delta: metric.delta, timestamp });
      break;
    case 'INP':
      rating = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
      trackEvent('web_vital_fid', { value, rating, delta: metric.delta, timestamp });
      break;
    case 'FCP':
      rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      trackEvent('web_vital_fcp', { value, rating, delta: metric.delta, timestamp });
      break;
    case 'LCP':
      rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      trackEvent('web_vital_lcp', { value, rating, delta: metric.delta, timestamp });
      break;
    case 'TTFB':
      rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      trackEvent('web_vital_ttfb', { value, rating, delta: metric.delta, timestamp });
      break;
  }
  
  // Track performance issues for poor ratings
  if (rating === 'poor' && typeof window !== 'undefined') {
    trackEvent('performance_issue', {
      issue_type: `poor_${metric.name.toLowerCase()}`,
      page: window.location.pathname,
      severity: 'high',
      metric_value: value,
      timestamp
    });
  }
}

// Initialize Web Vitals tracking
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  try {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (error) {
    console.warn('Web Vitals initialization failed:', error);
  }
}

// Simple performance score calculation
export function calculatePerformanceScore(vitals: {
  cls?: number;
  inp?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
}): number {
  let totalScore = 0;
  let count = 0;
  
  // Score each metric
  if (vitals.cls !== undefined) {
    totalScore += vitals.cls <= 0.1 ? 100 : vitals.cls <= 0.25 ? 50 : 0;
    count++;
  }
  if (vitals.inp !== undefined) {
    totalScore += vitals.inp <= 200 ? 100 : vitals.inp <= 500 ? 50 : 0;
    count++;
  }
  if (vitals.fcp !== undefined) {
    totalScore += vitals.fcp <= 1800 ? 100 : vitals.fcp <= 3000 ? 50 : 0;
    count++;
  }
  if (vitals.lcp !== undefined) {
    totalScore += vitals.lcp <= 2500 ? 100 : vitals.lcp <= 4000 ? 50 : 0;
    count++;
  }
  if (vitals.ttfb !== undefined) {
    totalScore += vitals.ttfb <= 800 ? 100 : vitals.ttfb <= 1800 ? 50 : 0;
    count++;
  }
  
  return count > 0 ? Math.round(totalScore / count) : 0;
} 