import { PerformanceTracker } from './event-tracking';

export interface ApiCallResult<T> {
  data: T;
  duration: number;
  success: boolean;
  status?: number;
}

export interface ApiMonitorOptions {
  timeout?: number;
  retries?: number;
  trackErrors?: boolean;
}

class ApiMonitor {
  private static instance: ApiMonitor;
  
  static getInstance(): ApiMonitor {
    if (!ApiMonitor.instance) {
      ApiMonitor.instance = new ApiMonitor();
    }
    return ApiMonitor.instance;
  }

  /**
   * Track an API call with automatic performance monitoring
   */
  async trackApiCall<T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>,
    options: ApiMonitorOptions = {}
  ): Promise<ApiCallResult<T>> {
    const startTime = performance.now();
    const { timeout = 30000, retries = 0, trackErrors = true } = options;
    
    let lastError: Error | null = null;
    let attempt = 0;
    
    while (attempt <= retries) {
      try {
        // Add timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('API call timeout')), timeout);
        });
        
        const data = await Promise.race([apiCall(), timeoutPromise]);
        const duration = performance.now() - startTime;
        
        // Track successful API call
        PerformanceTracker.apiCallCompleted({
          endpoint,
          method,
          status: 200,
          duration,
          response_size: this.getResponseSize(data),
          success: true
        });
        
        return {
          data,
          duration,
          success: true,
          status: 200
        };
        
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt > retries) {
          const duration = performance.now() - startTime;
          
          if (trackErrors) {
            PerformanceTracker.apiCallFailed({
              endpoint,
              method,
              error_type: lastError.name,
              error_message: lastError.message,
              duration
            });
          }
          
          return {
            data: null as any,
            duration,
            success: false
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Unknown API error');
  }

  /**
   * Track a fetch request
   */
  async trackFetch(
    url: string,
    options: RequestInit = {},
    monitorOptions: ApiMonitorOptions = {}
  ): Promise<ApiCallResult<Response>> {
    const method = options.method || 'GET';
    const endpoint = this.extractEndpoint(url);
    
    return this.trackApiCall(
      endpoint,
      method,
      () => fetch(url, options),
      monitorOptions
    );
  }

  /**
   * Track a JSON API call
   */
  async trackJsonApi<T>(
    url: string,
    options: RequestInit = {},
    monitorOptions: ApiMonitorOptions = {}
  ): Promise<ApiCallResult<T>> {
    const method = options.method || 'GET';
    const endpoint = this.extractEndpoint(url);
    
    return this.trackApiCall(
      endpoint,
      method,
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
      monitorOptions
    );
  }

  /**
   * Track a chat API call specifically
   */
  async trackChatApi<T>(
    url: string,
    payload: any,
    monitorOptions: ApiMonitorOptions = {}
  ): Promise<ApiCallResult<T>> {
    const endpoint = this.extractEndpoint(url);
    
    // Track chat-specific metrics
    const messageLength = payload?.messages?.slice(-1)[0]?.content?.length || 0;
    const model = payload?.model || 'unknown';
    
    return this.trackApiCall(
      endpoint,
      'POST',
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Track additional chat metrics
        const tokenCount = data?.usage?.total_tokens || 0;
        const toolCalls = data?.tool_calls?.length || 0;
        
        return data;
      },
      monitorOptions
    );
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  private getResponseSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const apiMonitor = ApiMonitor.getInstance();

// Convenience functions
export function trackApiCall<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>,
  options?: ApiMonitorOptions
): Promise<ApiCallResult<T>> {
  return apiMonitor.trackApiCall(endpoint, method, apiCall, options);
}

export function trackFetch(
  url: string,
  options?: RequestInit,
  monitorOptions?: ApiMonitorOptions
): Promise<ApiCallResult<Response>> {
  return apiMonitor.trackFetch(url, options, monitorOptions);
}

export function trackJsonApi<T>(
  url: string,
  options?: RequestInit,
  monitorOptions?: ApiMonitorOptions
): Promise<ApiCallResult<T>> {
  return apiMonitor.trackJsonApi(url, options, monitorOptions);
}

export function trackChatApi<T>(
  url: string,
  payload: any,
  monitorOptions?: ApiMonitorOptions
): Promise<ApiCallResult<T>> {
  return apiMonitor.trackChatApi(url, payload, monitorOptions);
} 