interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  endpoint?: string;
  operation: string;
  metadata?: Record<string, any>;
  status: 'success' | 'error';
  memoryUsage?: NodeJS.MemoryUsage;
}

interface WebVitalsMetrics {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  tti?: number;
  cls?: number;
  fid?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private webVitals: Map<string, WebVitalsMetrics> = new Map();
  
  // Start timing an operation
  startTiming(operation: string): (metadata?: Record<string, any>, status?: 'success' | 'error') => PerformanceMetrics {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    return (metadata?: Record<string, any>, status: 'success' | 'error' = 'success') => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      const metric: PerformanceMetrics = {
        timestamp: Date.now(),
        duration: endTime - startTime,
        operation,
        metadata,
        status,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        }
      };
      
      this.metrics.push(metric);
      
      // Keep only last 1000 metrics to prevent memory leaks
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
      
      return metric;
    };
  }
  
  // Record API endpoint performance
  async measureAPICall<T>(
    endpoint: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const endTiming = this.startTiming(`API:${endpoint}`);
    
    try {
      const result = await operation();
      endTiming({ ...metadata, endpoint }, 'success');
      return result;
    } catch (error) {
      endTiming({ 
        ...metadata, 
        endpoint, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'error');
      throw error;
    }
  }
  
  // Record database query performance
  async measureDBQuery<T>(
    queryName: string,
    query: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const endTiming = this.startTiming(`DB:${queryName}`);
    
    try {
      const result = await query();
      endTiming({ ...metadata, queryName }, 'success');
      return result;
    } catch (error) {
      endTiming({ 
        ...metadata, 
        queryName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'error');
      throw error;
    }
  }
  
  // Record web vitals from client
  recordWebVitals(page: string, vitals: WebVitalsMetrics) {
    this.webVitals.set(page, {
      ...this.webVitals.get(page),
      ...vitals,
    });
  }
  
  // Get performance statistics
  getStats(operation?: string, timeRange?: { start: number; end: number }) {
    let filteredMetrics = this.metrics;
    
    if (operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation.includes(operation));
    }
    
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    if (filteredMetrics.length === 0) {
      return null;
    }
    
    const durations = filteredMetrics.map(m => m.duration);
    const successCount = filteredMetrics.filter(m => m.status === 'success').length;
    const errorCount = filteredMetrics.filter(m => m.status === 'error').length;
    
    return {
      count: filteredMetrics.length,
      successRate: (successCount / filteredMetrics.length) * 100,
      errorRate: (errorCount / filteredMetrics.length) * 100,
      duration: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        p50: this.percentile(durations, 50),
        p90: this.percentile(durations, 90),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99),
      },
      memoryUsage: this.getMemoryStats(filteredMetrics),
      recentMetrics: filteredMetrics.slice(-10)
    };
  }
  
  // Get web vitals for all pages
  getWebVitals() {
    return Object.fromEntries(this.webVitals.entries());
  }
  
  // Get slow operations (above threshold)
  getSlowOperations(thresholdMs: number = 1000) {
    return this.metrics
      .filter(m => m.duration > thresholdMs)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20);
  }
  
  // Get error operations
  getErrorOperations() {
    return this.metrics
      .filter(m => m.status === 'error')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }
  
  // Clear metrics (for testing or memory management)
  clearMetrics() {
    this.metrics = [];
    this.webVitals.clear();
  }
  
  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      webVitals: Object.fromEntries(this.webVitals.entries()),
      timestamp: Date.now()
    };
  }
  
  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
  
  private getMemoryStats(metrics: PerformanceMetrics[]) {
    const memoryMetrics = metrics
      .filter(m => m.memoryUsage)
      .map(m => m.memoryUsage!);
    
    if (memoryMetrics.length === 0) return null;
    
    const heapUsed = memoryMetrics.map(m => m.heapUsed);
    const rss = memoryMetrics.map(m => m.rss);
    
    return {
      heapUsed: {
        avg: heapUsed.reduce((a, b) => a + b, 0) / heapUsed.length,
        max: Math.max(...heapUsed),
        min: Math.min(...heapUsed)
      },
      rss: {
        avg: rss.reduce((a, b) => a + b, 0) / rss.length,
        max: Math.max(...rss),
        min: Math.min(...rss)
      }
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware for Next.js API routes
export function withPerformanceMonitoring<T extends any[], R>(
  endpoint: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    return performanceMonitor.measureAPICall(
      endpoint,
      () => handler(...args),
      { args: args.length }
    );
  };
}

// Hook for React components
export function usePerformanceMonitor() {
  const measureRender = (componentName: string) => {
    const endTiming = performanceMonitor.startTiming(`Render:${componentName}`);
    
    return () => {
      endTiming();
    };
  };
  
  const measureUserAction = (actionName: string) => {
    const endTiming = performanceMonitor.startTiming(`UserAction:${actionName}`);
    
    return (metadata?: Record<string, any>) => {
      endTiming(metadata);
    };
  };
  
  return {
    measureRender,
    measureUserAction,
    recordWebVitals: performanceMonitor.recordWebVitals.bind(performanceMonitor)
  };
}

export type { PerformanceMetrics, WebVitalsMetrics }; 