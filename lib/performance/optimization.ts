/**
 * Performance Optimization Utilities
 * Provides lazy loading, memory management, and performance monitoring
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Performance monitoring interface
export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage?: number;
  bundleSize?: number;
  renderTime?: number;
}

// Lazy loading with performance tracking
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  return lazy(async () => {
    const startTime = performance.now();
    
    try {
      console.log(`[Performance] Loading ${componentName}...`);
      
      const loadedModule = await importFn();
      const loadTime = performance.now() - startTime;
      
      console.log(`[Performance] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Track memory usage if available
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        console.log(`[Performance] ${componentName} memory usage:`, {
          used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
      }
      
      return loadedModule;
    } catch (error) {
      console.error(`[Performance] Failed to load ${componentName}:`, error);
      throw error;
    }
  });
}

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: Map<string, () => void> = new Map();
  private memoryThreshold = 100 * 1024 * 1024; // 100MB threshold

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Register cleanup task
  registerCleanup(id: string, cleanupFn: () => void): void {
    this.cleanupTasks.set(id, cleanupFn);
  }

  // Unregister cleanup task
  unregisterCleanup(id: string): void {
    this.cleanupTasks.delete(id);
  }

  // Execute cleanup for specific component
  cleanup(id: string): void {
    const cleanupFn = this.cleanupTasks.get(id);
    if (cleanupFn) {
      try {
        cleanupFn();
        console.log(`[MemoryManager] Cleaned up ${id}`);
      } catch (error) {
        console.error(`[MemoryManager] Error cleaning up ${id}:`, error);
      }
    }
  }

  // Execute all cleanup tasks
  cleanupAll(): void {
    console.log(`[MemoryManager] Cleaning up ${this.cleanupTasks.size} components`);
    this.cleanupTasks.forEach((cleanupFn, id) => {
      try {
        cleanupFn();
      } catch (error) {
        console.error(`[MemoryManager] Error cleaning up ${id}:`, error);
      }
    });
    this.cleanupTasks.clear();
  }

  // Check memory usage and trigger cleanup if needed
  checkMemoryUsage(): boolean {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const usedMemory = memoryInfo.usedJSHeapSize;
      
      if (usedMemory > this.memoryThreshold) {
        console.warn(`[MemoryManager] Memory usage high: ${(usedMemory / 1024 / 1024).toFixed(2)}MB`);
        
        // Trigger garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
          console.log('[MemoryManager] Triggered garbage collection');
        }
        
        return true;
      }
    }
    return false;
  }

  // Get current memory usage
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return {
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const memoryManager = MemoryManager.getInstance();
  
  const startMeasurement = (measurementName: string) => {
    performance.mark(`${componentName}-${measurementName}-start`);
  };

  const endMeasurement = (measurementName: string) => {
    const endMark = `${componentName}-${measurementName}-end`;
    const measureName = `${componentName}-${measurementName}`;
    
    performance.mark(endMark);
    performance.measure(measureName, `${componentName}-${measurementName}-start`, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`);
    
    return measure.duration;
  };

  const registerCleanup = (cleanupFn: () => void) => {
    memoryManager.registerCleanup(componentName, cleanupFn);
  };

  const cleanup = () => {
    memoryManager.cleanup(componentName);
  };

  return {
    startMeasurement,
    endMeasurement,
    registerCleanup,
    cleanup,
    checkMemory: () => memoryManager.checkMemoryUsage(),
    getMemoryUsage: () => memoryManager.getMemoryUsage()
  };
}

// Bundle size analyzer
export class BundleAnalyzer {
  private static loadedChunks: Set<string> = new Set();
  
  static trackChunkLoad(chunkName: string, size?: number): void {
    if (!this.loadedChunks.has(chunkName)) {
      this.loadedChunks.add(chunkName);
      console.log(`[BundleAnalyzer] Loaded chunk: ${chunkName}${size ? ` (${(size / 1024).toFixed(2)}KB)` : ''}`);
    }
  }

  static getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks);
  }

  static getTotalChunks(): number {
    return this.loadedChunks.size;
  }
}

// Resource preloader
export class ResourcePreloader {
  private static preloadedResources: Set<string> = new Set();

  static preloadScript(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.crossOrigin = 'anonymous';
      
      if (priority === 'high') {
        link.setAttribute('importance', 'high');
      }

      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload script: ${src}`));
      };

      document.head.appendChild(link);
    });
  }

  static preloadModule(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = src;
      link.crossOrigin = 'anonymous';

      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload module: ${src}`));
      };

      document.head.appendChild(link);
    });
  }
}

// Performance budget checker
export class PerformanceBudget {
  private static budgets = {
    maxBundleSize: 500 * 1024, // 500KB
    maxLoadTime: 3000, // 3 seconds
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxRenderTime: 100 // 100ms
  };

  static checkBudget(metrics: Partial<PerformanceMetrics>): {
    passed: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    if (metrics.bundleSize && metrics.bundleSize > this.budgets.maxBundleSize) {
      violations.push(`Bundle size exceeded: ${(metrics.bundleSize / 1024).toFixed(2)}KB > ${(this.budgets.maxBundleSize / 1024).toFixed(2)}KB`);
    }

    if (metrics.loadTime && metrics.loadTime > this.budgets.maxLoadTime) {
      violations.push(`Load time exceeded: ${metrics.loadTime.toFixed(2)}ms > ${this.budgets.maxLoadTime}ms`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > this.budgets.maxMemoryUsage) {
      violations.push(`Memory usage exceeded: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB > ${(this.budgets.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    if (metrics.renderTime && metrics.renderTime > this.budgets.maxRenderTime) {
      violations.push(`Render time exceeded: ${metrics.renderTime.toFixed(2)}ms > ${this.budgets.maxRenderTime}ms`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  static setBudget(type: keyof typeof PerformanceBudget.budgets, value: number): void {
    this.budgets[type] = value;
  }

  static getBudgets() {
    return { ...this.budgets };
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Debounced function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttled function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 