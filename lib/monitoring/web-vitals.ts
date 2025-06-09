import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  pathname: string;
}

function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: Metric) {
  const webVitalMetric: WebVitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: getMetricRating(metric.name, metric.value),
    timestamp: Date.now(),
    pathname: window.location.pathname
  };

  // Log to console for debugging
  console.log(`[Web Vitals] ${metric.name}:`, {
    value: Math.round(metric.value),
    rating: webVitalMetric.rating,
    pathname: webVitalMetric.pathname
  });

  // Send to analytics API (optional)
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webVitalMetric),
      keepalive: true
    }).catch(error => {
      console.warn('[Web Vitals] Failed to send metric:', error);
    });
  }
}

export function initWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    
    console.log('[Web Vitals] Monitoring initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

export { sendToAnalytics }; 