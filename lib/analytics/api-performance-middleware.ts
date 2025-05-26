import { NextRequest, NextResponse } from 'next/server';
import { RealDataCollector } from './real-data-collector';

export interface APIPerformanceOptions {
  enablePayloadSizeTracking?: boolean;
  enableDetailedErrorTracking?: boolean;
  trackUserAgent?: boolean;
}

export function withAPIPerformanceTracking<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T> | Response>,
  options: APIPerformanceOptions = {}
) {
  const {
    enablePayloadSizeTracking = true,
    enableDetailedErrorTracking = true,
    trackUserAgent = false
  } = options;

  return async (req: NextRequest): Promise<NextResponse<T> | Response> => {
    const startTime = performance.now();
    const realDataCollector = RealDataCollector.getInstance();
    const endpoint = req.nextUrl.pathname;
    const method = req.method;
    
    let requestSize = 0;
    let responseSize = 0;
    let success = true;
    let statusCode = 200;
    let errorMessage: string | undefined;

    try {
      // Track request size if enabled
      if (enablePayloadSizeTracking) {
        try {
          const clonedRequest = req.clone();
          const requestBody = await clonedRequest.text();
          requestSize = new Blob([requestBody]).size;
        } catch (e) {
          // Ignore payload size tracking errors
          console.warn('Could not measure request payload size:', e);
        }
      }

      // Execute the actual API handler
      const response = await handler(req);
      
      statusCode = response.status;
      success = statusCode >= 200 && statusCode < 400;

      // Track response size if enabled
      if (enablePayloadSizeTracking) {
        try {
          const responseText = await response.clone().text();
          responseSize = new Blob([responseText]).size;
        } catch (e) {
          // Ignore response size tracking errors
          console.warn('Could not measure response payload size:', e);
        }
      }

      return response;
    } catch (error: any) {
      success = false;
      statusCode = 500;
      errorMessage = enableDetailedErrorTracking ? error.message : 'Internal Server Error';
      
      // Re-throw the error to maintain normal error handling
      throw error;
    } finally {
      // Always track the API performance metrics
      const duration = performance.now() - startTime;
      
      try {
        await realDataCollector.storeApiMetric(
          endpoint,
          method,
          duration,
          success,
          statusCode,
          enablePayloadSizeTracking ? (requestSize + responseSize) : undefined,
          errorMessage
        );

        // Track additional detailed metrics
        await realDataCollector.storeUserEvent('api_call_completed', {
          endpoint,
          method,
          duration,
          success,
          status_code: statusCode,
          request_size: enablePayloadSizeTracking ? requestSize : undefined,
          response_size: enablePayloadSizeTracking ? responseSize : undefined,
          user_agent: trackUserAgent ? req.headers.get('user-agent') : undefined,
          error: errorMessage
        });
      } catch (analyticsError) {
        // Don't let analytics errors affect the API response
        console.error('Analytics tracking error:', analyticsError);
      }
    }
  };
}

/**
 * Simplified wrapper for API routes that only need basic performance tracking
 */
export function trackAPIPerformance<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T> | Response>
): (req: NextRequest) => Promise<NextResponse<T> | Response> {
  return withAPIPerformanceTracking(handler);
}

/**
 * Enhanced wrapper for API routes that need detailed tracking including payload sizes
 */
export function trackAPIPerformanceDetailed<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T> | Response>
): (req: NextRequest) => Promise<NextResponse<T> | Response> {
  return withAPIPerformanceTracking(handler, {
    enablePayloadSizeTracking: true,
    enableDetailedErrorTracking: true,
    trackUserAgent: true
  });
} 