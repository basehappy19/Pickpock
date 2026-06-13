/**
 * Performance utilities - caching, lazy loading, and optimizations
 */

/**
 * Simple in-memory cache with TTL
 */
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl ?? this.defaultTTL)
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Global cache instances
 */
export const cache = {
  products: new SimpleCache<any>(10 * 60 * 1000), // 10 minutes
  orders: new SimpleCache<any>(5 * 60 * 1000), // 5 minutes
  users: new SimpleCache<any>(15 * 60 * 1000), // 15 minutes
  stores: new SimpleCache<any>(10 * 60 * 1000), // 10 minutes
  analytics: new SimpleCache<any>(2 * 60 * 1000) // 2 minutes
};

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load component
 */
export function lazyLoad<T extends () => Promise<any>>(
  importFunc: T,
  fallback?: React.ComponentType
) {
  return React.lazy(importFunc);
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: 'image' | 'fetch' | 'script' | 'style'): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (as === 'image') {
    (link as any).fetchPriority = 'high';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resource for later use
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Image optimization helper
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // This would integrate with your CDN/image service
  // For now, returns original URL
  if (url.includes('supabase')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width || 800}&height=${height || 600}&quality=${quality}`;
  }
  return url;
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

/**
 * Batch API requests
 */
export class RequestBatcher<T> {
  private queue: Array<{ resolve: (value: T) => void; reject: (error: any) => void; key: string }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;

  constructor(delay: number = 100) {
    this.delay = delay;
  }

  async request(key: string, fetcher: (keys: string[]) => Map<string, T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, key });

      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.flush(), this.delay);
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const currentQueue = this.queue;
    this.queue = [];

    try {
      const keys = currentQueue.map(item => item.key);
      const results = await this.fetchBatch(keys);

      currentQueue.forEach(item => {
        const result = results.get(item.key);
        if (result) {
          item.resolve(result);
        } else {
          item.reject(new Error('No result found'));
        }
      });
    } catch (error) {
      currentQueue.forEach(item => item.reject(error));
    }
  }

  private async fetchBatch(keys: string[]): Promise<Map<string, T>> {
    // This should be implemented by the class user
    return new Map();
  }
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;

  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      ...options
    });
  }

  return null;
}

/**
 * Measure component render time (development only)
 */
export function measureRenderTime(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return;

  return function performanceWrapper<T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();

      console.log(`[Performance] ${componentName}.${propertyKey}: ${(end - start).toFixed(2)}ms`);
      return result;
    };

    return descriptor;
  };
}

/**
 * Virtual scrolling helper for large lists
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number
): { startIndex: number; endIndex: number; offsetY: number } {
  const itemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - Math.ceil(itemCount / 2));
  const endIndex = Math.min(totalItems, startIndex + itemCount * 2);
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
}
