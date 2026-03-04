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
      // Track request size from Content-Length header to avoid consuming the body stream
      if (enablePayloadSizeTracking) {
        const contentLength = req.headers.get('content-length');
        if (contentLength) {
          requestSize = parseInt(contentLength, 10) || 0;
        }
      }

      // Execute the actual API handler
      const response = await handler(req);
      
      statusCode = response.status;
      success = statusCode >= 200 && statusCode < 400;

      // Track response size only for non-streaming responses.
      // Cloning a streaming response tees the ReadableStream, which delays delivery
      // and corrupts the AI data stream protocol (causes 405 / stream-start errors).
      // Check multiple indicators — AI SDK v4 sets x-vercel-ai-data-stream:v1 and
      // uses content-type:text/plain (not text/event-stream) for its data streams.
      const contentType = response.headers.get('content-type') ?? '';
      const isStreaming =
        response.headers.get('x-vercel-ai-data-stream') != null ||
        contentType.includes('text/event-stream') ||
        contentType.startsWith('text/plain') ||
        response.headers.get('transfer-encoding')?.includes('chunked');

      if (enablePayloadSizeTracking && !isStreaming) {
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
      // Fire-and-forget analytics: do NOT await so streaming responses are
      // returned to the client immediately (awaiting here would block the
      // Promise resolution and delay the first byte of any streamed response).
      const duration = performance.now() - startTime;

      realDataCollector.storeApiMetric(
        endpoint,
        method,
        duration,
        success,
        statusCode,
        enablePayloadSizeTracking ? (requestSize + responseSize) : undefined,
        errorMessage
      ).catch(err => console.error('Analytics metric error:', err));

      realDataCollector.storeUserEvent('api_call_completed', {
        endpoint,
        method,
        duration,
        success,
        status_code: statusCode,
        request_size: enablePayloadSizeTracking ? requestSize : undefined,
        response_size: enablePayloadSizeTracking ? responseSize : undefined,
        user_agent: trackUserAgent ? req.headers.get('user-agent') : undefined,
        error: errorMessage
      }).catch(err => console.error('Analytics event error:', err));
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