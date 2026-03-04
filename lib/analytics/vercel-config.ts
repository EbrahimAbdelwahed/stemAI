import type { BeforeSendEvent } from '@vercel/analytics/react';

// Vercel Analytics Configuration
export const vercelAnalyticsConfig = {
  // Debug mode - automatically enabled in development
  debug: process.env.NODE_ENV === 'development',
  
  // Mode override - use environment detection by default
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Custom endpoint for isolated deployments (if needed)
  endpoint: process.env.VERCEL_ANALYTICS_ENDPOINT || undefined,
  
  // Custom script source (if needed)
  scriptSrc: process.env.VERCEL_ANALYTICS_SCRIPT_SRC || undefined,
  
  // Disable server-side debug logs in production
  disableServerLogs: process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS === 'true',
} as const;

// Sensitive routes that should not be tracked
const SENSITIVE_ROUTES = [
  '/auth/',
  '/api/auth/',
  '/profile/',
  '/debug-',
  '/test-',
  '/admin/',
] as const;

// Safe query parameters that can be tracked
const SAFE_QUERY_PARAMS = [
  'page',
  'tab',
  'view',
  'mode',
  'filter',
  'sort',
  'category',
] as const;

/**
 * Filters sensitive data from analytics events as per Vercel documentation
 * This implements the beforeSend pattern to protect user privacy
 */
export function beforeSendAnalytics(event: BeforeSendEvent): BeforeSendEvent | null {
  // Filter out sensitive routes
  const isSensitiveRoute = SENSITIVE_ROUTES.some(route => 
    event.url.includes(route)
  );
  
  if (isSensitiveRoute) {
    if (vercelAnalyticsConfig.debug) {
      console.log(`[Analytics] Filtered sensitive route: ${event.url}`);
    }
    return null;
  }
  
  // Filter out error pages (4xx, 5xx) if they contain sensitive data
  if (event.url.includes('/error') || event.url.includes('/404') || event.url.includes('/500')) {
    if (vercelAnalyticsConfig.debug) {
      console.log(`[Analytics] Filtered error page: ${event.url}`);
    }
    return null;
  }
  
  // Clean query parameters
  if (event.url.includes('?')) {
    try {
      const url = new URL(event.url, 'https://example.com');
      const filteredParams = new URLSearchParams();
      
      // Only keep safe query parameters
      SAFE_QUERY_PARAMS.forEach(param => {
        const value = url.searchParams.get(param);
        if (value && value.length < 100) { // Prevent overly long parameter values
          filteredParams.set(param, value);
        }
      });
      
      const cleanUrl = `${url.pathname}${filteredParams.toString() ? '?' + filteredParams.toString() : ''}`;
      
      if (vercelAnalyticsConfig.debug && cleanUrl !== event.url) {
        console.log(`[Analytics] Cleaned URL: ${event.url} -> ${cleanUrl}`);
      }
      
      event.url = cleanUrl;
    } catch (error) {
      if (vercelAnalyticsConfig.debug) {
        console.warn(`[Analytics] Failed to clean URL: ${event.url}`, error);
      }
      // If URL parsing fails, filter out the entire event to be safe
      return null;
    }
  }
  
  return event;
}

/**
 * Environment-specific analytics configuration for CLIENT components
 * This excludes functions that cannot be serialized
 */
export function getClientAnalyticsConfig() {
  const config = {
    debug: vercelAnalyticsConfig.debug,
    mode: vercelAnalyticsConfig.mode,
  } as any;
  
  // Add custom endpoint if specified (useful for multi-project setups)
  if (vercelAnalyticsConfig.endpoint) {
    config.endpoint = vercelAnalyticsConfig.endpoint;
  }
  
  // Add custom script source if specified
  if (vercelAnalyticsConfig.scriptSrc) {
    config.scriptSrc = vercelAnalyticsConfig.scriptSrc;
  }
  
  return config;
}

/**
 * Environment-specific analytics configuration with beforeSend function
 * Only use this for server-side components or when functions are allowed
 */
export function getAnalyticsConfig() {
  const config = {
    debug: vercelAnalyticsConfig.debug,
    beforeSend: beforeSendAnalytics,
    mode: vercelAnalyticsConfig.mode,
  } as const;
  
  // Add custom endpoint if specified (useful for multi-project setups)
  if (vercelAnalyticsConfig.endpoint) {
    (config as any).endpoint = vercelAnalyticsConfig.endpoint;
  }
  
  // Add custom script source if specified
  if (vercelAnalyticsConfig.scriptSrc) {
    (config as any).scriptSrc = vercelAnalyticsConfig.scriptSrc;
  }
  
  return config;
}

/**
 * Check if analytics should be enabled in current environment
 */
export function shouldEnableAnalytics(): boolean {
  // Disable in test environment
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  
  // Disable if explicitly set
  if (process.env.DISABLE_ANALYTICS === 'true') {
    return false;
  }
  
  // Enable in development and production
  return true;
}

/**
 * Utility to log analytics configuration in development
 */
export function logAnalyticsConfig(): void {
  if (vercelAnalyticsConfig.debug) {
    console.log('[Analytics] Configuration:', {
      mode: vercelAnalyticsConfig.mode,
      debug: vercelAnalyticsConfig.debug,
      endpoint: vercelAnalyticsConfig.endpoint || 'default',
      scriptSrc: vercelAnalyticsConfig.scriptSrc || 'default',
      disableServerLogs: vercelAnalyticsConfig.disableServerLogs,
      sensitiveRoutes: SENSITIVE_ROUTES.length,
      safeQueryParams: SAFE_QUERY_PARAMS.length,
    });
  }
} 