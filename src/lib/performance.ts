// Performance optimization utilities

import { useCallback, useRef } from 'react';

/**
 * Debounce hook for optimizing frequent function calls
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Throttle hook for limiting function execution frequency
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Memoized time formatting function
 */
const timeFormatCache = new Map<string, string>();

export const formatTimeAgo = (dateString: string): string => {
  if (timeFormatCache.has(dateString)) {
    return timeFormatCache.get(dateString)!;
  }

  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  let result: string;
  
  if (diffInMinutes < 1) result = "Just now";
  else if (diffInMinutes < 60) result = `${diffInMinutes} minutes ago`;
  else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) result = `${diffInHours} hours ago`;
    else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) result = `${diffInDays} days ago`;
      else result = date.toLocaleDateString();
    }
  }
  
  // Cache result for 1 minute
  timeFormatCache.set(dateString, result);
  setTimeout(() => timeFormatCache.delete(dateString), 60000);
  
  return result;
};

/**
 * Optimized image loading with lazy loading support
 */
export const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';
  
  // If it's an Unsplash URL, add optimization parameters
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('fit', 'crop');
    params.set('auto', 'format');
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

/**
 * Batch API calls to reduce network requests
 */
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private readonly batchSize: number;
  private readonly delay: number;
  private readonly processor: (items: T[]) => Promise<R[]>;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize = 10,
    delay = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);
      
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      if (this.batch.length >= this.batchSize) {
        this.processBatch().then(resolve).catch(reject);
      } else {
        this.timeout = setTimeout(() => {
          this.processBatch().then(resolve).catch(reject);
        }, this.delay);
      }
    });
  }

  private async processBatch(): Promise<R> {
    const currentBatch = [...this.batch];
    this.batch = [];
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    const results = await this.processor(currentBatch);
    return results[0]; // Return first result for simplicity
  }
}

/**
 * Memory-efficient virtual scrolling helper
 */
export const calculateVisibleItems = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
};