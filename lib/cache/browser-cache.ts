'use client';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  size: number; // For memory management
}

class BrowserCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  private currentSize = 0;

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Fallback estimate
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.currentSize -= item.size;
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const item = this.cache.get(oldestKey);
      if (item) {
        this.currentSize -= item.size;
        this.cache.delete(oldestKey);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    this.cleanupExpired();

    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.currentSize -= item.size;
      this.cache.delete(key);
      return null;
    }

    console.log(`[Browser Cache] Hit for key: ${key}`);
    return item.data;
  }

  set<T>(key: string, data: T): void {
    const size = this.estimateSize(data);
    
    // Remove existing entry if it exists
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.size;
    }

    // Ensure we don't exceed max size
    while (this.cache.size >= this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    });

    this.currentSize += size;
    console.log(`[Browser Cache] Set key: ${key} (size: ${size})`);
  }

  has(key: string): boolean {
    this.cleanupExpired();
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size;
      return this.cache.delete(key);
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    console.log('[Browser Cache] Cache cleared');
  }

  // Get cache statistics
  getStats() {
    this.cleanupExpired();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      currentMemorySize: this.currentSize,
      ttl: this.ttl,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Create a namespaced cache instance
  namespace(prefix: string): BrowserCache {
    const namespacedCache = new BrowserCache(this.maxSize, this.ttl);
    
    // Override methods to add prefix
    const originalGet = namespacedCache.get.bind(namespacedCache);
    const originalSet = namespacedCache.set.bind(namespacedCache);
    const originalHas = namespacedCache.has.bind(namespacedCache);
    const originalDelete = namespacedCache.delete.bind(namespacedCache);

    namespacedCache.get = <T>(key: string) => originalGet(`${prefix}:${key}`) as Promise<T | null>;
    namespacedCache.set = <T>(key: string, data: T) => originalSet(`${prefix}:${key}`, data);
    namespacedCache.has = (key: string) => originalHas(`${prefix}:${key}`);
    namespacedCache.delete = (key: string) => originalDelete(`${prefix}:${key}`);

    return namespacedCache;
  }
}

// Export a singleton instance
export const browserCache = new BrowserCache();

// Export specialized cache instances
export const ragCache = browserCache.namespace('rag');
export const visualizationCache = browserCache.namespace('viz');
export const documentCache = browserCache.namespace('doc'); 